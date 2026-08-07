---
title: "마이바티스 select 주의할 점 (with 타임리프)"
description: "타임리프로 개발하다보면 아래와 같은 예외를 무조건 만나게 될것이다. org.thymeleaf.exceptions.TemplateProcessingException: Exception evaluati..."
tags: [마이바티스]
---

타임리프로 개발하다보면 아래와 같은 예외를 무조건 만나게 될것이다.

```bash
org.thymeleaf.exceptions.TemplateProcessingException: Exception evaluating SpringEL expression:
```

위 예외는 타임리프 문법에서 객체에서 필드를 꺼내올때 타임리프에 적은 필드명이 객체 없으면 나는 에러이다.

예를 들어서

```java
public class Person {
    private String name;
    private Integer age;

    // getter, setter, constructor ...
}
```

```html
<pre>
    이름: <span th:text="${person.name}"></span>
    나이: <span th:text="${person.AGE}"></span>
</pre>
```

위와 같이 person.age를 가져와야하는데 person.AGE를 가져오는거같이 person이 가지고 있지 않은 필드를 가져오면 아래 예외가 터진다.

```bash
org.thymeleaf.exceptions.TemplateProcessingException: Exception evaluating SpringEL expression:
```

그냥 `TemplateProcessingException` 이라 되어있어서 처음엔 왜 예외가 나는지 의아할수있다.

이런 실수를 하겠어? 하는데, `nickName`이라는 변수명인데 `nick_name` 이라는 이름으로 꺼내온다던가 하는 실수가 있을 수 있다.

어쨋든 그런에러인데,

나같은 경우에 이상하게 객체 하나를 렌더링할땐 null값이 빈값으로 들어가서 html뷰가 잘 생성이되는데

객체를 리스트에서 가져오는건 자꾸 저런 에러가 났다.

리스트로 꺼내오는 페이지에서 타임리프와 관련된 설정을 해줘야하는가 싶어 이런저런 시도를 해봤지만 결과는 똑같았다.

나중에 로그를 찍어보니 마이바티스에서 가져오는 리스트에 해당 필드가 null이 아니라 아예 필드자체가 없었다.

> 항상 느끼는 거지만 무작정 이것저것 시도해보는게 아니라 테스트할때 마치 Junit에서 항상 나오는거처럼 EXPECT랑 ACTUAL을 생각해야한다 아니면
>
> `TemplateProcessingException`같이 사전에 저런 기본적인 예외에 대해서도 모르고 마이바티스랑 같이 사용한다면 엄청난 삽질을 하는거처럼
>
> 늘 문제가 부딪칠때마다 해결하는 시간이 더 늘어난다.

어쨋든 다시 돌아가서

코드를 예를 들어보자면

```sql
create table test
(
    column_name1 varchar(10) null,
    column_name2 varchar(10) not null
);

insert into `test` (column_name2) values ("hello world");
```

```java
      // 대충 마이바티스가 select해서 데이터 가져오는  코드
        Map<String, Object> testMap = new HashMap<>();

        testMap.put("columnName1", null);
        testMap.put("columnName2", "hello world");

        System.out.println("결과");
        System.out.println(testMap);
```

```bash
결과
{t1=null, t2=hello world}
```

예를 들자면 마이바티스는 String에 필드명을 넣고, Object에는 value를 넣는다.

위와 같이 결과가 나와야하지만 실제로는 마이바티스에 아무 setting 값을 주지않으면

아래처럼 나온다

```bash
결과
{t2=hello world}
```

보통 리턴타입이 리스트인 경우에 마이바티스는 resultType을 보통 HashMap으로 구성하는데 문제는 Null인 결과인 컬럼은 Map의 키에 저장이 되지 않는다.

그래서 객체를 가지고 타임리프에서 html 렌더링 해줄때 필요한 필드 자체가 없으니 Exception 을 날리는거였다.

결론은 Null 일 경우에 타임리프에서 특정경우에 예외처리를 하는줄 알았는데 그게 아니라 "" 빈값으로 처리되는거였는데 착각하고있었다.

이걸 해결하려면 해당 필드가 null일경우에도 map에 저장하도록 해야하는데 마이바티스 설정에 아래와같이 넣어주면된다.

```xml
<setting name="callSettersOnNulls" value="true"/>
```

```html
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd" >

<configuration>
    <settings>
        <setting name="callSettersOnNulls" value="true"/>
    </settings>
</configuration>
```

참고로 application.propertis 에는 아래와 같이 mybatis-config에 대한 경로설정을 당연히 해줘야한다.

```bash
mybatis.config-location=classpath:mybatis-config.xml
```
