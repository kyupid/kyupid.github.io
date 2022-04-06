---
layout  : wiki
title   : @GenerateValue strategy 전략
summary : 디비에서 생성할꺼면 IDENTITY를 써라
date    : 2022-04-06 11:58:05 +0900 
updated : 2022-04-06 11:58:07 +0900
tag     : jpa
toc     : true
public  : true
parent  : [[jpa]]
latex   : false
---
* TOC
{:toc}

## 개요

```java
    @Id
    @GeneratedValue
    private Long id;
```
- 위처럼 기본으로 넣어주면 전략이 AUTO 로 설정이 되는데 JPA가 만들어 주는 모양임
- 때문에 아래와 같이 insert 할 때 이미 있는 데이터와 Duplicate 될 가능성이 있음
```
2022-04-06 23:34:46.809  WARN 72048 --- [io-8080-exec-10] o.h.engine.jdbc.spi.SqlExceptionHelper   : SQL Error: 1062, SQLState: 23000
2022-04-06 23:34:46.809 ERROR 72048 --- [io-8080-exec-10] o.h.engine.jdbc.spi.SqlExceptionHelper   : Duplicate entry '31' for key 'PRIMARY'
...
...
java.sql.SQLIntegrityConstraintViolationException: Duplicate entry '31' for key 'PRIMARY'
```