---
id: 9
title: "Spring Data Redis: Expired key trigger event: 2개 이상의 WAS가 있을 때"
description: "현재 개발중인 서비스는 어떤 \"미션\" 이라는 것을 유저가 참여할 수 있다. 해당 \"미션\"을 정해진 시간 내에 완료하지 못하면 휴대폰으로 푸시알림이 가도록 했다. 이 과정에서 겪은 문제와 해결법을 적어보았다."
tags: [스프링]
---

> 현재 개발중인 서비스는 어떤 "미션" 이라는 것을 유저가 참여할 수 있다.
>
> 해당 "미션"을 정해진 시간 내에 완료하지 못하면 휴대폰으로 푸시알림이 가도록 했다.
>
> 이 과정에서 겪은 문제와 해결법을 적어보았다.

미션을 참여할때 유저는 키값으로 메인미션인지 서브미션인지 구분하는 값과

해당 미션ID와 유저ID를 담고 value에는 미션시작datetime이 담겨져있다.

미션을 완료하지 못했을때 푸시를 보내야하는데 해당 시점에 어떤 trigger하는 이벤트가 발생하지 않는다.

미션이 만료된 것을 알 수 있는 유일한 수단은 redis에서 expire하는 이벤트를 subscribe하여 확인하는 수 밖에 없다.

먼저 스프링말고 레디스 서버에서 어떻게 expire된 이벤트를 확인할 수 있는지 보자.

레디스를 설치하면 이벤트를 트리거할 수 있는 설정을 따로 해줘야한다.

> 참고: 기본적으로 해당 설정이 꺼져있는 이유
>
> [By default keyspace event notifications are disabled because while not very sensible the feature uses some CPU power.](https://redis.io/docs/manual/keyspace-notifications/#:~:text=By%20default%20keyspace%20event%20notifications%20are%20disabled%20because%20while%20not%20very%20sensible%20the%20feature%20uses%20some%20CPU%20power.)

레디스에 접속하는 방법

- 윈도우에 설치했을 경우 redis-cli.exe를 실행
- 리눅스는 명령어에 redis-cli
- 도커는 docker exec -it my_container_name redis-cli

위 방법을 통하여 redis-cli에 접속한다

그리고 명령어에 아래와 같이 입력한다

```bash
CONFIG SET notify-keyspace-events "Ex"
CONFIG GET notify-keyspace-events
```

마지막에 "Ex"의 의미는 레디스에서 만들어놓은 알파벳 의미대로

E는 published 된 keyevent를 notify하는 것이고 x는 expired된 이벤트를 의미한다

![](/images/redis-expired-key-event-multi-was/01.png)

출처: [https://redis.io/docs/manual/keyspace-notifications/#configuration](https://redis.io/docs/manual/keyspace-notifications/#configuration)

해당 alias를 통해 expired events를 subscribe하도록 설정했으면 레디스에서 아래와 같이 확인할 수 있다

![](/images/redis-expired-key-event-multi-was/02.png)

그런데 config set 명령어를 통해 설정하면 레디스 리부트시에 설정이 초기화되므로 redis.config 파일을 수정해주는 편이 더 낫다.

redis-cli에서 확인한 부분을 Spring Data Redis에서도 편리하게 구현할 수 있다.

```java
@RequiredArgsConstructor
@Configuration
@EnableRedisRepositories
@Slf4j
public class RedisRepositoryConfig {

    private final RedisProperties redisProperties;
    private final String PATTERN = "__keyevent@*__:expired";

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(redisProperties.getHost(), redisProperties.getPort());
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(RedisConnectionFactory redisConnectionFactory, RedisExpirationListener expirationListener) {
        RedisMessageListenerContainer redisMessageListenerContainer = new RedisMessageListenerContainer();
        redisMessageListenerContainer.setConnectionFactory(redisConnectionFactory);
        redisMessageListenerContainer.addMessageListener(expirationListener, new PatternTopic(PATTERN));
        redisMessageListenerContainer.setErrorHandler(e -> log.error("There was an error in redis key expiration listener container", e));
        return redisMessageListenerContainer;
    }
}
```

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisExpirationListener implements MessageListener {

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String myKey = message.toString();
        
        /* ...로직... */
    }
}​
```

RedisRepositoryConfig를 통해서 연결된 레디스 서버의 key가 expire되면

스프링에서도 자바 코드로 이벤트에 대한 처리를 할 수 있도록 한다.

그런데 주의해야할 점은 부하분산을 위한 똑같은 WAS를 2개이상 사용하고 있을 경우이다.

이 경우에는 아래와 같은 형태를 띄기 때문에 어떻게 처리를 해야할지 고민해봐야한다.

![](/images/redis-expired-key-event-multi-was/03.png)

처음에 내가 시도한 방법은 process id를 이용하는 것이었다.

key를 set할때 인스턴스의 pid가 100번이라고 치자.

그러면 해당 인스턴스의 메시지 리스너에서만 pid가 100번인 인스턴스에서만 이벤트가 트리거 되도록 조건에 넣어서 사용하는 것이다

가령, 아래와 같은 것이다.

![](/images/redis-expired-key-event-multi-was/04.jpg)

![](/images/redis-expired-key-event-multi-was/05.jpg)

실제로 잘 작동하지만 문제점은 서버를 재부팅했을 경우이다.

foo()에서 set한 key값이 서버를 재부팅하면 받아야할 이벤트를 받지 못하기 때문이다.

그럼 expire 이벤트를 두 인스턴스에서 subscribe하고 있을땐 어떻게 해야할까?

레디스같은 경우에 동시성 해결을 위하여 분산락을 지원하고 있는데 해당 기능은 접근하는 공유자원에 대한 제어방법이라서 해당 방법을 사용할 수는 없었다.

그래서 어드민 서버에서 해당 기능을 넣어 사용하고 있다.

(뚜렷한 해결방법을 생각못하고 한달 후)

지금 생각하기에는 비즈니스 로직을 처리하는 서버에서 처리를 하는 것이 아니라

이런 푸쉬 종류의 유틸성 기능을 모은 서버를 하나 띄워서 해결하는 게 좋지 않을까 싶다.

애초에 스케일아웃 될 수 있는 비즈니스 로직이 담긴 서버에서

레디스의 특정 이벤트를 감지하는 등의 공통 액션을 넣는 것이 잘못된 아키텍쳐이지 않을까 싶기도하고.. 아직은 잘 모르겠다.
