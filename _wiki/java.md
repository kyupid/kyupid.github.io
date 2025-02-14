---
layout  : wiki
title   : java
summary : 
date    : 2025-01-23 12:24:43 +09:00
updated : 2025-01-23 12:24:43 +09:00
tag     : 
toc     : true
public  : true
parent  : index
latex   : false
resource: 
---
* TOC
{:toc}

## 비동기 메소드 호출시 세션 정보

```java
class Main {
    @GetMapping("/logout")
    void logout(HttpServletRequest request) {

	... 생략 // logout 내에서는 request 세션 정보가 있음
    Test t = new Test();
    
    // 비동기 메소드 안에서는 해당 request 세션 정보가 사라짐
    // t 정보는 남아 있음.
    System.out.println(request.getSession(false))
    asyncMethod(request, t)
    }
    
    static class Test {
        String foo;
    }
}

class TestService {
    @Async
    asyncMethod(HttpServeletRequest request, Test t) {
	    System.out.println(request.getSession(false))
    }
}
```
위 코드에서 asyncMethod() 들여다보면, `request.getSession(false)` 는 null 이다.

왜 그럴까? HTTP 요청 객체와 일반 객체 간의 처리 방식의 차이 때문이다.

비동기 메소드는 새로운 스레드에서 실행되고, 새로운 스레드가 시작되면 기존의 HTTP 요청이 처리되던 스레드 컨텍스트와 독립적이기 때문에 기존 요청 정보 (HttpServletRequest)와 세션 정보는 새로운 스레드에서 사용할 수 없다.

이를 해결하기 위해선 레디스 같은 외부 세션 관리 저장소를 사용하던가 새로운 객체에 할당해서 사용해야하지 않나 싶다.

## mac 자바 설정

특정 자바 버전 사용하도록 변경하고 싶을때가 있다.  
예를 들면 자바 22 를 사용하고 있는데, gradle 로 빌드할때 17 버전이하가 필요하다던지 할때가 있다.   

아래와 같이 자바 버전들이 설치되어 있다고 해보자.
❯ /usr/libexec/java_home -V

Matching Java Virtual Machines (5):

    22.0.1 (arm64) "Oracle Corporation" - "OpenJDK 22.0.1" /Users/kyw/Library/Java/JavaVirtualMachines/openjdk-22.0.1/Contents/Home

    17.0.12 (arm64) "JetBrains s.r.o." - "JBR-17.0.12+1-1087.25-nomod 17.0.12" /Users/kyw/Library/Java/JavaVirtualMachines/jbr-17.0.12/Contents/Home

    17.0.9 (arm64) "Oracle Corporation" - "Java SE 17.0.9" /Users/kyw/Library/Java/JavaVirtualMachines/jdk-17.0.9.jdk/Contents/Home

    11.0.17 (arm64) "Amazon.com Inc." - "Amazon Corretto 11" /Users/kyw/Library/Java/JavaVirtualMachines/corretto-11.0.17/Contents/Home

    1.8.0_292 (x86_64) "AdoptOpenJDK" - "AdoptOpenJDK 8" /Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home

/Users/kyw/Library/Java/JavaVirtualMachines/openjdk-22.0.1/Contents/Home
```

JAVA_HOME 설정을 위해 아래를 입력해보자.
```
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

java -version
```

예시 출력:
```
openjdk version "17.0.9"
OpenJDK Runtime Environment (build 17.0.9+7)
OpenJDK 64-Bit Server VM (build 17.0.9+7, mixed mode)
```


**변경 사항을 영구적으로 적용**

매번 터미널을 열 때마다 Java 버전을 설정하지 않으려면, ~/.zshrc 또는 ~/.bashrc 파일에 해당 설정을 추가한다

```
vi ~/.zshrc
```

파일에 다음 내용을 추가

```
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

source ~/.zshrc
```
