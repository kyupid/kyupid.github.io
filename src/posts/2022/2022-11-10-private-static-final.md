---
id: 10
title: "왜 관습적으로 private static final 을 사용하는 것일까?"
description: "먼저 public static final 을 사용하는 이유에 대해서 생각해보자. public static final int DEFAULT_SIZE = 16; 와 같은 형태의 쓰임새는 이해가 갈것이다."
tags: [자바, JVM]
---

먼저 public static final 을 사용하는 이유에 대해서 생각해보자.

`public static final int DEFAULT_SIZE = 16;` 와 같은 형태의 쓰임새는 이해가 갈것이다.

접근제어자를 public 으로 선언함으로써 전역에서 사용하도록 하고, static 키워드를 붙임으로써 메모리 한 영역에 정적으로 할당하여 자원을 공유하도록 하고, final 로 해당 변수의 값을 변경하지 못하게하여 불변성을 보장하도록 하는 것이기 때문이다.

즉 다시 말하자면, 자주 사용하는 자원을 효율적으로 불변성을 보장받고 사용하기 위하여 그런식으로 사용한다는 것을 알 수 있다.

이 점을 기억하고 접근 제어자가 public이 아니라 private으로 바꿔서 다시 생각해보자.

먼저 클래스 외부에서는 사용하지 못하게 된다. 해당 필드를 사용하려면 클래스를 생성해야하는 것이고,

클래스를 생성한다는 뜻은 인스턴스를 만들면서 안에 가지고 있는 필드를 같이 [heap 영역에 저장](https://raw.githubusercontent.com/kyupid/blog-code/main/img/2022-11-10_11-06-30.png)하여 참조가 사라지면 해당 필드도 메모리에서 제거된다는 뜻이다.

따라서 private static final 에서 static 을 계속 메모리에 올려놓는 게 아니라 필요할 때만 사용하도록 static 을 빼는 것이 더 합리적인 것이 아니냐는 의구심이 들기 마련이다.

그런데 간단히 애초에 [상수의 의미](https://velog.io/@doli0913/%EC%83%81%EC%88%98%EC%99%80-%EB%A6%AC%ED%84%B0%EB%9F%B4)를 생각해보면, `private final int DEFAULT_SIZE = 16;` 과 같은 필드를 매번 인스턴스를 만들때마다 생성할 이유가 하나도 없다. 왜냐하면 생성된 각각의 인스턴스들이 모두 같은 값을 가진 변수를 똑같이 생성하여 들고 있기 때문이다. 똑같은 값을 가진 자원을 다시 만들어 그것을 사용할 이유는 없다.

결국 `private static final int DEFAULT_SIZE = 16;`으로 사용하는 의미와 같게 된다.

상수뿐만이 아니라 이런 로깅 객체를 `private static final Logger logger = ...` 사용할때 도 마찬가지이다.

이미 생성한 Logger같은 객체는 다른 인스턴스로 바꿀 이유가 없기 때문에, 우리는 클래스를 초기화할때 필드에 있는 Logger 객체를 같이 초기화해준다.

그래서 Logger 같은 경우에도 private static final 로 선언하여 객체를 생성할 때마다 불필요한 메모리 사용을 하지 않도록 하여야한다.

따라서 private final 이 아니라 private static final 을 사용하는 것이다.

추가적으로 스프링 어플리케이션에서는 따지고 보면 bean으로 등록된 컨트롤러나 서비스에서 사용할 때 굳이 static을 선언할 이유는 없지만 이런 의미들을 알았을 때 private static final 라는 텍스트만 보았을때 해당 필드가 풍기는 뉘앙스를 단번에 파악할 수 있기 때문에, 또 일부러 사용안할 이유는 없다고 생각한다.
