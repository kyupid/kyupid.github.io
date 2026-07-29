---
id: 2
title: "VO(Value Object) 이해하기"
description: "VO를 이해하기 위해서 기발한 예시가 생각났음. 두 사람이 만원짜리 지폐 한장씩 들고 있다. 그것을 서로 교환했다. 지폐의 번호(메모리 주소값)는 달라졌지만 그들이 교환한 지폐의 본질(속성)에는 차이가 없다. 그리고 사람들은 이것을 \"같다고\" 말한다."
tags: [자바, JVM]
---

VO를 이해하기 위해서 기발한 예시가 생각났음. 두 사람이 만원짜리 지폐 한장씩 들고 있다. 그것을 서로 교환했다. 지폐의 번호(메모리 주소값)는 달라졌지만 그들이 교환한 지폐의 본질(속성)에는 차이가 없다. 그리고 사람들은 이것을 "같다고" 말한다.

나 같은 경우엔 Value Object라는 것을 체스를 구현하는 프로젝트에서 [필요성을 느꼈다](https://velog.io/@kyukim/20210227). 간단하게 콘솔로 구현하는 프로젝트인데 코드를 테스트할 때였다. 체스말들은 폰, 킹, 퀸, 룩 등 체스판이라는 리스트 안에 있다. 나는 체스판의 특정 좌표에서 특정 체스말을 get하여 개별적으로 생성자를 통해 만들어진 체스말을 비교하여 두개의 체스말을 같은지 아닌지 테스트하려고 했다.

의도하려 했던 테스트는 당연히 같은 속성을 가진 체스말이기 때문에 객체가 가지고 있는 속성과 속성값들이 같으면, 두 개의 객체가 같다고 판별하려고 했다. 하지만 그렇게 할 수 있는 방법을 몰랐다. 무조건 다른 메모리 주소값을 참조할텐데 어떻게 두개를 같다고 테스트할 것인지 의문이었다.

지폐이든 체스말이든 서로 같은지 보려고 했다. 서로 같은 본질(속성)인지 비교하기 위해 Value Object라는 개념이 필요한 것이다.

그럼 체스말을 같도록 하려면 어떻게 해야할까? 먼저 객체를 생성해보자.

```java
public class Piece {
    private String position;
    private String color;

    public Piece(String position, String color) {
        this.position = position;
        this.color = color;
    }
}

public static void main(String[] args) {
    Piece pawn1 = new Piece("pawn", "black");
    Piece pawn2 = new Piece("pawn", "black");

    System.out.print(pawn1 == pawn2);
}
```

`pawn1`과 `pawn2`를 생성해 두 객체가 같은지 비교하는 테스트를 했다. 이렇게 비교한 방식으로는 서로 다른 메모리 주솟값을 가리키기 때문에 무조건 불린값이 false로 나온다.

의도한대로 true로 나오게 하려면 어떻게 해야할까? 클래스에 두 객체를 직접 비교할 수 있는 메소드를 추가하면 되는 것이다. 대체로 (구글 검색결과를 보면) 새 메소드를 추가하기보다 Object의 equals()를 오버라이딩해주는 것 같다.

중요한 것은 비교할 수 있도록 한다는 것이다.

```java
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Piece piece = (Piece) o;
        return Objects.equals(position, piece.position) && Objects.equals(color, piece.color);
    }

    @Override
    public int hashCode() {
        return Objects.hash(position, color);
    }
```

IntelliJ 같은 IDEA에서 사실 같은지 확인하기 위한 기본적으로 편하게 만들 수 있는 단축키가 있기 때문에 VO를 만들때 참고하면 좋다.

hasCode()는 equals()에 인자를 넣지 않고 기본적으로 가지고 있는 속성을 통해 고유한 hash값을 만드는데, 이것을 통해서도 VO의 동일성을 확인할 수 있다.

```java
System.out.print(pawn1.equals(pawn2));
```

다시 테스트를 해보면 결과는 true인 것을 확인 할 수 있다.

더 나아가서 프리미티브 타입이 아니라 객체라는 것을 적극 활용하여 유효성 검사까지 해주는 것도 좋다. position에는 한정적으로 체스말들만 들어온다. 킹,퀸,폰,룩,비숍,나이트 이게 전부이다.  색상도 체스에서는 흰색과 검은색 뿐이다. 하지만 현재 작성된 예제 코드는 position과 color에 모든 값들이 들어오도록 열려있기 때문에 color에 대한 유효성 검사를 하도록 해보자.

```java
public class Piece {
    private String position;
    private String color;

    public Piece(String position, String color) {
        this.position = position;
        this.color = color;
        validateColor();
    }

    private void validateColor() {
        if (!(this.color.contains("black") || this.color.contains("white"))) {
            throw new IllegalArgumentException("black 과 white 값만 허용됩니다.");
        }
    }
```

이 같이 Value Object에는 기본적인 의미에 더해 여러가지 기능을 넣어 사용여부에따라 그 의미를 더 견고하게 할 수 있다.

다시 정리해보자.

Value Object에는 여러 속성과 값을 가지고 있을 수 있다. 만약 또다른 객체가 똑같은 속성과 값을 가지고 있다면 이 두 개의 객체를 Value Object라고 한다. 그 객체에는 하나 혹은 둘 이상의 속성이 있고 특정한 값을 가리키게 된다. 이 Value Object라는 것은 앞에서 예제로 소개했듯, 프로그래밍 과정 속에서 자연스럽게 나오는 개념이기도 하지만 DTO와 Entity 등과 더불어 도메인 설계 때 많이 등장하는 용어이므로 그 의미를 제대로 받아들여야한다고 생각한다.

Value Object를 한국어로 풀면 객체 값이라는 뜻이다. 객체를 값처럼 쓰는 것을 말한다. 객체를 값처럼 쓴다는 말은 객체를 프리미티브 타입처럼 하나의 값을 가지고 있지만 객체의 이점을 이용한다는 말인것 같다.

객체의 이점이라면 값을 사용하기 전에 클래스 내에서 여러가지 유효성 검사들을 해줄 수 있고, 필요한 디자인 패턴을 객체에 입혀 사용이점을 더 극대화할 수 있다. 예를 들면, 정적 팩토리 메소드 패턴을 사용하면 생성자를 내부에 숨기면서 메소드를 통하면 생성자에 이름을 명명해줄 수 있기 때문에 필요에 따라 가독성을 향상시킬 수 있다. 코드는 [이 링크](https://livenow14.tistory.com/18)를 살펴보자.

끝.

---

참고 자료

[https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/](https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/)

[https://livenow14.tistory.com/18](https://livenow14.tistory.com/18)
