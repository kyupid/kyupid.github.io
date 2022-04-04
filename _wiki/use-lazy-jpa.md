---
layout  : wiki
title   : JPA N+1 문제
summary : 지연 로딩 전략을 써라
date    : 2022-04-05 00:27:46 +0900
updated : 2022-04-05 00:27:46 +0900
tag     : jpa
toc     : true
public  : true
parent  : [[jpa]]
latex   : false
---
* TOC
{:toc}

## 개요

- 엔티티 일대다 관계에서 기본적으로 즉시로딩(EAGER) 전략을 사용
- 이렇게 사용하면 아래 이미지처럼 외래키 하나하나 가지고 쿼리 실행
- 때문에 지연로딩(LAZY) 전략을 사용해라

![Apr-05-2022 00-26-28](https://user-images.githubusercontent.com/59721293/161578831-f2eb0bb3-f5df-48ba-86c8-302e0b795dea.gif)
