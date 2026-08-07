---
id: 3
title: "스프링과 싱글톤 컨테이너"
description: "들어가기 인프런-스프링 핵심 원리에서 싱글톤 컨테이너에 대해 배우고 정리한 것입니다. 먼저 싱글톤이란 생성자를 통해 계속 인스턴스를 만들어 사용하는 것이 아니라 클래스를 한번만 메모리에 할당하여 그것을 계속 재활용하는 디자인 패턴을 말합니다."
tags: [스프링]
---

## 들어가기

인프런-스프링 핵심 원리에서 싱글톤 컨테이너에 대해 배우고 정리한 것입니다.

먼저 싱글톤이란 생성자를 통해 계속 인스턴스를 만들어 사용하는 것이 아니라

클래스를 한번만 메모리에 할당하여 그것을 계속 재활용하는 디자인 패턴을 말합니다.

특정 디자인 패턴이 만들어진 이유가 있을겁니다.

싱글톤도 그런 이유가 있습니다.

코드를 보면서 알아봅시다.

## 쌩자바로짠 서비스 객체

```java
public class Service {
    public void logic() {
        System.out.println("객체 로직 호출");
    }
}
```

![](/images/spring-singleton-container/01.jpg)

기존에 쌩자바로 어떤 서비스를 사용자가 호출하게 되면

위 이미지처럼 여러 사용자들이 `Service`를 호출하여

그때마다 새로운 인스턴스가 생성되어 사용했습니다.

예를들어 배달의민족에서는 초당 5만번의 요청까지도 있다고 하는데

그렇게 되면 초당 5만개의 `Service`를 새로 생성하게 되는 것입니다.

이게 문제입니다.

이를 해결하기위해 싱글톤으로 클래스를 작성해봅니다.

## 싱글톤으로 만들기

```java
public class SingletonService {
    private static final SingletonService instance = new SingletonService(); // --- (1)

    public static SingletonService getInstance() { // --- (2)
        return instance;
    }

    private SingletonService() { // --- (3)
    }

    public void logic() {
        System.out.println("싱글톤 객체 로직 호출");
    }
}
```

(1)

먼저 자기 자신을 생성해서 필드로 선언하는데,

static을 선언함으로써 메모리에 한개만 올리고 [#static 참고 메모](https://github.com/kyupid/java-chess-again/issues/3)

접근제어자를 private으로 하여 외부에서 해당 필드에 대해 조작이 불가하도록 합니다. [#private static 참고 메모](https://github.com/kyupid/java-chess-again/issues/18)

(2)

`(1)`에서 생성한 객체를 불러오는 메소드를 static으로 작성합니다.

클래스 필드와는 다른 메모리에 올라가 있는 static 변수를 가져오기 위해

`getInstance()` 또한 static으로 선언합니다.

(3)

생성자를 외부에서 생성할수 없도록 하여 싱글톤 패턴을 완성합니다.

이전에 사용자들은 사용자마다 새로운 서비스 객체를 생성하여 호출했지만

싱글톤 패턴을 이용하여 하나의 객체를 계속 공유가 가능하게 됐습니다.

![](/images/spring-singleton-container/02.jpg)

## 싱글톤의 문제점

이런 싱글톤 패턴에도 문제점이 있다. 장점이 단점이 되는 경우입니다.

하나의 리소스를 공유하는 것은 좋은데 여러 사용자가 접근하며

기대와 다른 결과를 만들기도 합니다.

예를 들어 싱글톤을 적용한 아래와 같은 서비스 객체가 있습니다.

```java
public class StatefulSingletonService {
    // 싱글톤 패턴을 위한 코드 시작 //
    private static final StatefulSingletonService instance = new StatefulSingletonService(); // --- (1)

    public static StatefulSingletonService getInstance() { // --- (2)
        return instance;
    }

    private StatefulSingletonService() { // --- (3)
    }
    // 싱글톤 패턴을 위한 코드 끝 //

    // 비즈니스 코드 시작 //
    private int price; // 상태를 유지하는 필드

    public void order(String name, int price) {
        System.out.println("name = " + name + "price = " + price);
        this.price = price; // 여기가 문제!
    }

    public int getPrice() {
        return price;
    }
    // 비즈니스 코드 끝 //
}
```

자원 하나를 공유하기 때문에 아래와 같은 비즈니스 처리를 하게 되었을때 문제가 발생합니다.

```java
StatefulSingletonService service = StatefulSingletonService.getInstance(); // --- (1)
service.order("Kyu", 10000); // --- (2)
service.order("Pyro", 20000); // --- (3)
```

(1)

모든 사용자들은 `service` 리소스를 공유하게 될 것입니다.

(2)

`Kyu`라는 사용자는 어떤 물건을 `10000`원 주고 주문하였습니다.

(3)

여기가 문제입니다.

`Pyro`라는 사용자가 어떤 물건을 `20000`원을 주고 주문하였는데,

상태를 유지하는 `price` 필드가 `Kyu`가 주문한 가격이 덮어씌어지면서 `20000`원으로 변경됩니다.

`Kyu`라는 사용자는 10000원짜리 물건을 구매했는데 20000원을 결제해버리게 되는 꼴입니다.

이를 해결하기 위해서는 코드를 항상 "stateful(상태유지)"이 아니라 "stateless(무상태)"하게 작성해야합니다.

> stateful과 stateless라는 용어가 생소하면 HTTP 세션과 쿠키에 대해 알아보면 됩니다.

## 해결하기

stateless하게 작성하려면 어떻게 할까요?

```java
    public void order(String name, int price) {
        System.out.println("name = " + name + "price = " + price);
        return price;
    }
```

`order()` 메소드에서 상태를 유지하는 필드인 `price`를

위와 같이 사용자가 호출할때마다 즉시 return하도록 하면 될것입니다.

## 마무리

위 예제 코드는 단순하여 금방 수정했지만

현업에서는 이런 문제로 몇번씩 트러블이 생기기때문에

싱글톤이라는 주제는 매우 중요하여 잘 이해해야합니다.
