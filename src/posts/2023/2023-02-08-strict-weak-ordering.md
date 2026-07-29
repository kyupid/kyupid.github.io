---
id: 12
title: "자바 strict weak ordering 과 Comparison method violates its general contract 에러"
description: "자바 \"IllegalArgumentException: Comparison method violates its general contract!\" 에러에 대해 알아보자."
tags: [자바, JVM]
---

자바 "IllegalArgumentException: Comparison method violates its general contract!" 에러에 대해 알아보자.

해당 에러는 비교 메소드가 Comparator 에서 사용하고 있는 **어떤 contract** 를 위반했기 때문에 발생하는 에러이다. 다시 말해서, Comparator 를 구현할 때 어떠한 모순점이 있으면 해당 에러가 발생하다.

**어떤 contract** 라는 것은 자바에서 따르고 있는 strict weak ordering 이라는 순서 규칙을 말한다. 에러에 대해 알아보기 전에 먼저 strict weak ordering 부터 살펴보자.

## 들어가기

`Comparison method violates its general contract!` 에러는 정렬 알고리즘이 두 항의 관계에서 모순이 있을 때 생기는 에러이다. 순서 이론에서 이항 관계(binary relation)라는 것이 있다.

binary relation 은 요소 간의 특정 유형의 관계를 정의하는 요소 쌍 집합이다. binary relation 에는 total order 과 weak order 가 있다.

## total order, weak order, strict weak ordering

total order 라는 것은 두 항의 비교가 가능한 상태를 말한다. `a > b`, `a < b`, `a = b` 와 같이 두 항이 수학적으로 비교가 가능한 상태를 말한다. 반면에 weak order 는 두 요소가 비교가 불가능한 상태가 허용된 상태를 말한다. weak order 는 strict 하지않다는 것을 기억해두면 strict weak ordering 을 이해하는데 도움될 것이다.

나도 아직 이해를 못해서 설명을 할 수 없지만 중요한 것은 weak order 는 **두 요소가 실제로 같지 않음에도 같은 것으로 간주**될 수 있다는 것을 기억해야한다. strict weak ordering 은 weak order 이긴한데 strict 하다. 즉, 두 요소를 비교 불가능한 상태에 대해서 허용하지 않는 상태를 말한다.

어떤 집합에서의 모든 두 짝의 요소는 비교 가능한 상태여야하고 요소가 동일하도록 허용하는 반면 strict weak ordering 은 관계에서 요소가 같지 않아야 한다는 것을 의미한다. 이는 집합의 모든 두 요소를 비교할 수 있고 그들 사이에 consistent 하고 transitive 한 관계를 설정할 수 있으며 두 요소는 동일한 경우에만 동일한 것으로 간주됨을 의미한다.

이러한 구분은 정렬 또는 정렬 알고리즘을 정의하거나 일련의 요소에 대한 전체 순서를 설정하기 위해 strict weak ordering 이 사용되는 곳에서 중요하게 작용한다.

## In Java

자바에서는 Comparator 를 구현할 땐 strict weak ordering 규칙을 준수해야한다. 위에서 설명한 strict weak ordering 을 만족하려면 어떤 특성들이 있어야할까?

바로 두 요소 간의 비교가 Antisymmetry(비대칭성), 비반사성(Irreflexivity), Transitivity(전이성)을 만족해야한다. 이런 규칙을 따르지 않으면 정렬 작업에서 `Comparison method violates its general contract!` 같은 에러가 발생할 수 있다.

예제와 함께 strict weak ordering 을 다음 특징들을 알아보자.

1) Antisymmetry(비대칭성)

**compare(a,a)는 false를 반환해야한다.** 왜냐하면 `a > a` 가 true가 되는 것은 모순이기 때문이다.

2) Irreflexivity(비반사성)

compare(a,b) = true이면 **compare(b,a)는 false를 반환해야한다.** `a > b` 가 true인데 `b > a` 가 true가 되는 것은 모순이기 때문이다.

3) Transitivity(전이성)

compare(a,b) = true, compare(b,c) = true이면 **compare(a,c)는 true를 반환해야한다**. `a > b` , `b > c`가 true인데 `a > c` 가 false가 되는 것은 모순이기 때문이다

4) Transitivity of equivalence (동등성의 전이성)

comp(a,b) = false, comp(b,a) = false이고 comp(b,c) = false, comp(c,b) = false이면 **comp(a,c)와 comp(c,a)도 모두 false를 반환해야한다**. `a > b` 가 false이고 `b > a`가 false라는 것은 `a == b` 라는 것을 뜻한다. 즉, `a == b`이고 `b == c` 인데 `a != c`가 되는 것은 모순이기 때문이다.

## total order VS strict weak ordering

이쯤되면 total order 과 strict weak ordering 이 뭐가 다르냐는 의문이 생길 수 있다.

왜냐하면 total order 는 두 항이 주어졌을대 자연적으로 일반 수학 교과 과정을 마쳤다면 생각할 수 있는 비교에 따라서 결정되는 순서이고, strict weak ordering 도 위에 설명을 보자면 굉장히 논리적으로 자연스러운 것이기 때문이다.

두 개를 비교한다면 이렇게 기억하면 된다. (나도 잘 이해를 못했지만 일단 관계를 기억하자.)

- total order 는 반사성(reflexivity)을 가진 strict weak ordering 이다.
- 즉, total order 는 strict weak ordering 의 상위 포함 관계이다.

## strict weak ordering 예제

간단한 예제와 함께 strict weak ordering 을 이해해보자.

아래는 숫자들에서 두 요소를 오름차순으로 sorting 하는 코드이다.

```java
numberList.stream()
            .sorted((a, b) -> a - b)
            .collect(Collectors.toList());
```

지극히 자연스럽고 논리적이고 컴파일 에러도 발생하지 않고 strict weak ordering 에도 만족한다.

왜냐하면 `sorted()` 에서 Comparator 는 `a - b` 라는 연산을 통해 값에 따라 비교하여 음수, 양수, 0 을 리턴할 수 있기 때문이다.

그렇다면 아래 코드는 어떨까?

```java
// a, b 의 타입은 double 혹은 long 이라고 생각하자.
numberList.stream()
            .sorted((a, b) -> (int) (a - b))
            .collect(Collectors.toList());
```

위 코드는 `a - b` 를 int 로 캐스팅하여 반환한다. 이것은 strict weak ordering 를 만족시키지 않는다.

왜냐하면 int 로 캐스팅하게 되면, 숫자들이 int 범위를 넘어섰을 때 가지고 있는 값을 올바르게 캐스팅할 수 없는 경우도 있기 때문이다. 자세한 건 [JVM 형변환 long to int](/11/)를 참고하자.

![](/images/strict-weak-ordering/01.jpg)

위에서 처럼 int 로 캐스팅해서 `l1 - l2`, `l2 - l3` 을 해보자. 결과는 l1 이 l2 보다 작고, l2 가 l3 보다 작다는 것을 보여준다.

즉, strict weak ordering 의 특징에서 전이성(transitivity)에 따르면 l1 은 l3 보다 작아야한다. 그러나 결과를 보면 `l1 - l3` 가 값이 잘라져 결국 차이가 0 으로 나오고 서로 같다는 것을 의미하게 된다. 따라서 strict weak ordering 을 위반하게 된다.

이처럼 아무 의심 없이  Comparator 를 구현하다보면 해당 에러가 발생하기 마련인데, strict weak ordering 의 특성을 잘 이해하며 코드를 작성해야한다
