---
layout  : wiki
title   : Tibero
summary : tibero
date    : 2025-01-08 10:29:24 +0900
updated : 2025-01-08 16:14:14 +0900
tag     : 
toc     : true
public  : true
parent  : 
latex   : false
resource: 6C8552CD-C600-45B1-8B93-29D5D154D6A2
---
* TOC
{:toc}

# tibero

접속 정보
```bash
# id: sys, pw: tibero
tbsql sys/tibero
```

버전 확인
```bash
tbboot -version
```

라이센스 확인
```bash
tbboot -k;
```

시작/종료
```bash
tbboot

tbdown immediate
```

```bash
 cd $TB_HOME/scripts
 system.sh -h
 sh system.sh -p1 tibero -p2 syscat -a1 y -a2 y -a3 y -a4 y
```
