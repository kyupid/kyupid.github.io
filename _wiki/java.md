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

## mac 자바 설정

특정 자바 버전 사용하도록 변경하고 싶을때가 있다.  
예를 들면 자바 22 를 사용하고 있는데, gradle 로 빌드할때 17 버전이하가 필요하다던지 할때가 있다.   

아래와 같이 자바 버전들이 설치되어 있다고 해보자.
```
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
