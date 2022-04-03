---
layout  : wiki
title   : missing table[hibernate_sequence] 에러
summary : 
date    : 2022-04-03 11:22:46 +0900
updated : 2022-04-03 11:22:46 +0900
tag     : jpa
toc     : true
public  : true
parent  : [[jpa]]
latex   : false
---
* TOC
{:toc}

## 개요

- Entity 객체들을 만들고 매핑이 마친 상황
- 빌드하면 hibernate_sequence 테이블을 찾을수 없다고함

## 해결

`spring.jpa.hibernate.ddl-auto=update` 를 설정하지 않아서임
`@GeneratedValue`를 쓸때 필요한 테이블 중 하나가 ID를 생성하는 시퀀스 테이블인데 그걸 만들지 못해서 에러가 발생함
update 해주고 validate하면 정상 작동하는 것을 확인 가능
