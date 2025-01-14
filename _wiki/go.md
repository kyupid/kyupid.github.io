---
layout  : wiki
title   : golang
summary : 
date    : 2025-01-12 11:16:09 +0900
updated : 2025-01-12 11:34:54 +0900
tag     : 
toc     : true
public  : true
parent  : 
latex   : false
resource: D997454B-B59C-49A1-98AF-CFDCF74425C2
---
* TOC
{:toc}

# golang

## channel 

채널은 FIFO 큐를 떠올리면 이해하기 쉽다.  
먼저 들어온 데이터를 순서대로 처리할 수 있다.  
만약 채널을 사용하지 않고 구현한다면, queue.push(data)나 queue.poll() 같은 메소드를 사용하는 식으로 직접 처리해야 한다.  
하지만 Go에서는 채널을 이용해 <-queue나 queue <- data 같은 직관적인 문법으로 데이터를 주고받을 수 있다.  

채널은 동기적으로 또는 비동기적으로 동작할 수 있다.  
동기적인 채널은 데이터를 보내는 쪽이 받는 쪽이 준비될 때까지 기다리지만, 비동기적인 채널은 버퍼를 설정하면 데이터를 일정량까지 보낼 수 있다.  

