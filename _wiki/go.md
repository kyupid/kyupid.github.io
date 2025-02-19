---
layout  : wiki
title   : golang
summary : 
date    : 2025-01-12 11:16:09 +0900
updated : 2025-02-04 10:00:54 +0900
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

## 로그



## 애플리케이션 백그라운드 실행 방식에 대한 논의

### 개요  

Gophers 슬랙에서 Golang으로 메트릭 수집 에이전트를 개발할 때, 애플리케이션을 포그라운드 또는 백그라운드에서 실행할 수 있도록 하는 방법에 대해 논의했다. `-bg` 또는 `--background` 같은 플래그를 추가하는 것이 좋은 방식인지, 혹은 다른 접근 방식이 더 적절한지에 대한 의견을 들었다.  

![](/resource/img/kyupid-2025-02-04-001085-e3Fg0BSh.png)
### 주요 의견  

#### 1. 애플리케이션 자체적으로 백그라운드 실행을 처리할 필요가 없다  
- 백그라운드 실행은 운영 환경(Systemd, Docker, Kubernetes, 사용자 셸 등)에서 관리하는 것이 더 자연스럽다.  
- 예를 들어, 사용자는 `nohup ./myapp &` 또는 `./myapp &`와 같은 방식으로 백그라운드 실행을 직접 처리할 수 있다.  

#### 2. 운영 환경이 제공하는 기능 활용  
- **Systemd**: 서비스로 등록하여 관리 (`systemctl start myapp`)  
- **Docker**: `docker run -d myapp` (detach 모드)  
- **Kubernetes**: Pod/Deployment 형태로 실행하여 자동 백그라운드 실행  
- **사용자 셸**: `nohup ./myapp &` 또는 `./myapp &` 사용  

#### 3. UNIX 전통에서의 백그라운드 실행 논의  
- 과거 UNIX 환경에서는 프로그램이 스스로 백그라운드 실행을 처리하는 최적의 방법에 대한 논의가 많았다.  
- 하지만 오늘날에는 Systemd 같은 서비스 매니저가 등장하면서 자체적으로 백그라운드 실행을 처리할 필요가 거의 없어졌다.  
- 과거에는 `/etc` 폴더 어딘가의 셸 스크립트에서 `foo -d`, `bar --background` 같은 명령을 직접 실행하는 방식이 일반적이었지만, 이제는 운영 환경이 더 좋은 해결책을 제공한다.  
- Noah Stride 라는 사람의 의견도 요즘에 flag 로 데몬을 저런식으로 띄운다면 굉장히 놀랄거라고 한다.
![](/resource/img/kyupid-2025-02-04-001087-VjQFT9Me.png)
![](/resource/img/kyupid-2025-02-04-001086-l0h4vBiR.png)
### 결론  

애플리케이션 자체에서 `-bg` 또는 `--background` 같은 옵션을 추가하기보다는, 운영 환경이 제공하는 기능을 활용하는 것이 더 일반적이고 적절한 방법이다.

## reference와 dereference

![](/resource/img/kyupid-2025-01-24-001069-SwbzJSg3.png)

## 메모리 누수

net/http/pprof 패키지 사용하면 쉽게 메모리, cpu, goroutine, 스레드 프로파일링 및 추적 가능하다  

```go
import (
    "log"
    "net/http"
    _ "net/http/pprof"
)

func main() {
    go func() {
        log.Println(http.ListenAndServe("localhost:6060", nil))
    }()
    // 애플리케이션 코드
}
```

애플리케이션 실행 후 pprof 툴을 실행시킨다
```
go tool pprof http://localhost:6060/debug/pprof/heap
```

top 명령어로 메모리 사용량 상위 함수 확인 가능하다
```
(pprof) top
```

시각화해서 볼 수도 있다.
```
(pprof) web
```
![](/resource/img/kyupid-2025-01-23-001063-iJL3DArv.png)
## channel 

채널은 FIFO 큐를 떠올리면 이해하기 쉽다.  
먼저 들어온 데이터를 순서대로 처리할 수 있다.  
만약 채널을 사용하지 않고 구현한다면, queue.push(data)나 queue.poll() 같은 메소드를 사용하는 식으로 직접 처리해야 한다.  
하지만 Go에서는 채널을 이용해 <-queue나 queue <- data 같은 직관적인 문법으로 데이터를 주고받을 수 있다.  

채널은 동기적으로 또는 비동기적으로 동작할 수 있다.  
동기적인 채널은 데이터를 보내는 쪽이 받는 쪽이 준비될 때까지 기다리지만, 비동기적인 채널은 버퍼를 설정하면 데이터를 일정량까지 보낼 수 있다.  

## Zero Value

초기값을 말한다.  
primitive type 들은 전부 초기화된다.  
단, 포인터로 초기화하면 nil 로 초기화된다.
```go
package main

import "fmt"

func main() {
	var num int       
    var str string    
    var flag bool     
    
    fmt.Println(num)   // 출력: 0
    fmt.Println(str)   // 출력: ""
    fmt.Println(flag)  // 출력: false
    
    var numPtr *int       // 초기화되지 않은 포인터
    var strPtr *string    // 초기화되지 않은 문자열 포인터
    var flagPtr *bool     // 초기화되지 않은 불리언 포인터

    fmt.Println(numPtr)   // 출력: <nil>
    fmt.Println(strPtr)   // 출력: <nil>
    fmt.Println(flagPtr)  // 출력: <nil>

    // nil 체크
    if numPtr == nil {
        fmt.Println("numPtr is nil")
    }
}
```
구조체도 다 초기화된다.  
따라서 따로 자바처럼 new 로 명시적으로 객체를 메모리에 할당하지않아도  
go는 알아서 초기화한다.
```go
type Counter struct {
    value int
}

func (c *Counter) Increment() {
    c.value++
}

func (c *Counter) Value() int {
    return c.value
}

func main() {
    var c Counter // Zero Value 상태: value == 0
    c.Increment() // Zero Value 상태에서도 메서드 호출 가능
    fmt.Println(c.Value()) // 출력: 1
}
```