---
layout  : wiki
title   : Bash
summary : About bash
date    : 2025-01-03 10:32:18 +0900
updated : 2025-01-03 22:27:47 +0900
tag     : 
toc     : true
public  : true
parent  : 
latex   : false
resource: A4AEB2BC-4B36-437A-BDD6-06A69DC52186
---

* TOC
{:toc}

# bash script

## if
```bash
if [ "$dbms" = "redis" ]; then
  echo "dbms is redis"
fi

if [ $dbms" != "redis" ]; then
  echo "dbms is not redis"
fi
```

### OR, AN

```bash
if [ "$dbms" != "redis"] && [ "$dbms" != "mongodb"]; then
  echo "something"
fi
```
