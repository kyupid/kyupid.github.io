---
layout  : wiki
title   : YugabyteDB
summary : 
date    : 2025-01-14 20:42:52 +0900
updated : 2025-01-14 20:43:19 +0900
tag     : 
toc     : true
public  : true
parent  : 
latex   : false
resource: 0DE1DD56-276C-492D-81AE-B71916977934
---
* TOC
{:toc}

## 분산 SQL 데이터베이스
- 분산 SQL?
	- 장애 복원력
	- 높은 가용성
	- 노드를 추가하는식으로 수평 확장
- 유가바이트?
	- 유가바이트는 분산 SQL 데이터베이스이다.
	- 클라우드 네이티브에 초점
		- Kube, VM, Bare metal[^bare-metal]
	- 완전 오픈소스 (Apache 2.0)
	- PostgreSQL 와 매우 유사
	- 지리적 분산 기능 (Geo ...)
		- 멀티 존 배포
		- 멀티 리전 배포
		- 클라우드 간 배포

### 단일(monolithic) vs 분산(distributed)

![](/resource/img/kyupid-2025-01-14-000995-qtU19Kha.png)
- 단일
	- 단일 노드에서 read write
	- 리소스가 더 필요하면 단순 확장[^question1]
	- but, if 장애, 데이터 제공 할수없음
	- 대기중인 데이터베이스(replica)로 장애조치 
	- *단일노드의 저장공간이 부족하면 확장 과정이 매우 복잡해진다고 한다.*
	- *더이상 확장할수없는 경우 비용이 많이 든다*
	- *더이상 확장할수 없는 경우 애플리케이션 전체를 다시 작성해서 여러 노드로 분산하는 어려움 발생*
- 분산
	- 여러 노드에 걸쳐 쓰기 처리 가능
	- 클러스터의 여러 노드가 하나의 논리적 디비처럼 작동[^question2]
	- 단순히 노드를 추가하는 식으로 확장가능
	- 데이터를 다른 노드로 재분배하거나 복제함으로써 노드가 장애나도 괜찮
	- *단순히 일관성을 위해 데이터를 정규화하는 것이 아니라 성능, 특히 처리량과 대기 시간을 향상시키기 위해 데이터를 비정규화할 수도 있다*

### 분산 SQL 데이터 분할 방식 및 장애 복구 메커니즘
- 단일 노드가 모든 데이터를 저장하지 않는다
- 하나의 테이블을 여러 row 그룹으루 나누고, 각 행그룹을 샤드(shard)라고 부름
- 샤드들을 여러 노드에 분산 및 저장
- 이런 샤드들을 다른 노드에 또 저장해둔다 (replica)
	- 예를 들어 shard1 이 node2,node3 에 복제되었다면, shard1 이 포함된 node1이 장애발생하더라도 node2 또는 node3에서 shard1 을 즉시 제공한다.
- 시간이 지나도 node1 이 장애 복구안되면, 샤드 데이터를 다른 노드로 재복제한다
	- node1 더이상  사용못하니까 node4에 저장하는 등
	- 이런 방식으로 최대 2개의 노드를 잃더라도 정상동작

### 네트워크 분할(network partition)
- 네트워크 분할은 일부 노드가 다른 노드와 통신할 수 없는 상황을 말함
	- 예를 들어, 클러스터에있떤 일부 노드가 떨어져 나가 다른 노드와 연결이 끊어질수 있는 상황
	- *모놀리식 경우, 단일 노드만 존재하므로 네트워크 분할상황에서는 클라이언트가 노드에 접근할수있는지 여부만 문제된다*
	- *이 경우 "가용성(availability)"을 선택하여 양쪽에서 데이터를 제공할지, 또는 "일관성(consistency)"을 선택하여 데이터 제공을 중단할지 결정해야 한다.*
	- CAP[^cap] 정리에 따르면, 일관성, 가용성, 네트워크 분할 허용(partition tolerance) 중에서 세 가지를 모두 만족시킬 수는 없으며, 이 중 두 가지만 선택할 수 있음
	- 유가바이트는 일관성을 우선시하고 가용성을 낮추는 방향을 선택
	- *하지만 클라우드 환경에서 다중 존 배포와 같은 방식으로 몇초내에 장애 복구를 처리하여 높은 가용성을 유지*
	- *시스템은 자동으로 이런 네트워크 분할문제를 복구하며, 이는 일시적인 지연이나 짧은 실패로만 나타남*

### 분산 트랜잭션
- 분산 SQL 데이터베이스에서는 데이터를 여러 노드에 분할하고 복제하기 떄문에 단일 row 업데이트는 해당 데이터를 포함하는 샤드(또는 태블릿)에서 처리
	- 이 과정은 Raft[^raft]와 같은 프로토콜을 사용하여 일관성을 보장

```
하지만 여러 행을 업데이트해야 하는 분산 트랜잭션의 경우에는 어떻게 처리될까요? YugabyteDB 및 대부분의 분산 SQL 데이터베이스는 트랜잭션 내에서 개별 작업을 처리한 뒤 이를 "모두 수행하거나 전혀 수행하지 않는 방식"으로 처리합니다. 이를 원자성(atomicity)이라고 하며, 일관성(consistency)도 유지됩니다.

이 작업은 내부적으로 2단계 커밋(two-phase commit) 메커니즘을 사용하여 이루어집니다. 트랜잭션은 각 태블릿에 임시 쓰기를 수행한 다음, 모든 임시 쓰기가 성공하면 트랜잭션 전체를 커밋 상태로 전환하여 데이터를 가시적으로 만듭니다. 이 과정은 스냅샷 격리(snapshot isolation) 및 직렬화(serializable)를 지원합니다.

YugabyteDB는 두 가지 주요 API를 제공합니다. 첫 번째는 PostgreSQL에서 파생된 YSQL API로, 스냅샷 격리와 직렬화를 모두 지원합니다. 두 번째는 Apache Cassandra에서 파생된 YCQL API로, 스냅샷 격리만 지원합니다.
```

## YugabyteDB 

### 리더리스 아키텍쳐
- 유가바이트 아키텍쳐는 노드간에 특정 reader 나 master 가 없는 리더리스 구조임. 몽고db의 클러스터 구성방식이랑 비슷함.
- 각 노드는 동일한 역할을 가지고 데이터 분산 복제하는데 참여함.
- 클라이언트는 어떤 노드에 연결하든 동일하게 클러스터 데이터를 읽고 쓸수있음

### 클러스터와 유니버스(universe)
- 복제 계수가 3이라면 최소 3개 노드가 필요
	- 복제 계수가 5라면 최소 5개 노드가 필요
- 이 노드들은 vm, container, bare metal 등 다양한 형태로 존재할수있고, 이 모든 노드가 모여 유니버스를 구성
	- 다시 말해서, 유니버스는 내부적으로 하나 이상의 논리적 클러스터로 구성될수잇음
	- 예를 들어, 기본 클러스터는 유저 테이블 데이터를 샤드 및 복제하여 읽기 쓰기 처리하면서 비동기적으로 데이터를 복제해서 읽기 전용의 복제 클러스터를 사용. 

### YB-TServer와 YB-Master
- 기본 클러스터에 두가지 주요 서비스가 있음
	- YB-TServer
		- *사용자의 데이터를 호스팅하고 제공*
		- 클러스터의 각 노드에는 YB-TServer 프로세스가 실행됨
		- 이 프로세스들이 모여 YB-TServer 서비스 구성
	- YB-Master
		- 클러스터 관리 계층
		- 시스템 전체의 메타데이터를 저장하고 클러스터 저반ㄴ의 작업을 관리
		- 데이터베이스 스키마, 노드 배치, 복제 설정 등 관리
		- 장애 발생시 데이터 재복제하여 복제 계수를 복구하는 역할도 함 (아까전에 node4 말했던)
		- YB-Master 도 고가용성. 시스템 내 단일 장애점 X

### 데이터 샤딩
- 분산 SQL 데이터베이스는 데이터를 샤딩하여 여러 노드에 분산함
- PK의 일부를 기준으로 데이터를 샤딩
	- 예를들어 다중컬럼PK 인 경우, *일부 컬럼 선택해여 데이터 분배를 결정*
- 샤딩 전략에는 해시샤딩과 범위 샤딩이 있음
	- 해시샤딩
		- 테이블에서 임의의 데이터를 선택해 노드에 분배.
		- 데이터가 고르게 분산되고 hotspot[^hotspot] 이 제거됨
	- 범위 샤딩
		- 데이터 정렬된 순서대로 연속적인 행 그룹으로 분배
		- 범위 기반의 쿼리에 적합

### 데이터 복제
- 샤드는 복제되어 여러 노드에 저장됨
- 이 복제본들은 Raft[^raft] 합의 프로토콜로 동기화 됨
- *샤드 리더는 쓰기 요청을 자신과 복제본 노드에 전달하며, 다수의 노드가 데이터를 커밋하면 요청을 완료 상태로 표시합니다. 이 방식은 장애 발생 시 데이터를 복구할 수 있도록 보장*
- 복제본은 rack, region, cloud provider 간에 분산될수있어 대규모 장애에도 견딜수있는 안정성 제공

### 데이터 저장
- *유가바이트는 SSD 환경에 최적화되어 있음*
- 데이터는 문서(document) 형태로 저장
- 저장 계층은 RocksDB를 확장하여 키-문서 store로 변환
- SQL 테이블의 pk 는 문서 키로 매핑되고, 값 컬럼은 문서 속성 값으로 저장됨
- *이 방식이 물리적으로 어떻게 저장되고, SQL 쿼리가 데이터에 접근하는 방식의 효율성을 높암*

### 보조 인덱스 (Secondary Index)
- 유가바이트는 보조 인덱스 지원
- 보조 인덱스는 분산 및 복제된 내부 테이블로 구현
- 기본 테이블에 행을 삽입하거나 업데이트하면 보조인덱스 테이블에도 해당 데이터가 업데이트 됨

### 쿼리 계층 (Query Layer)
- 유가바이트 쿼리 계층은 확장성을 염두해두고 설계됨
- 여러 API 를 지원하고 대표적으로 YSQL API, YCQL API 두가지가 있음
	- YSQL API
		- PostgreSQL 호환 API
		- 완전한 ANSI SQL 기능 제공
		- 관계형 무결성 제약조건(외래키, 체크제약 등), 조인 트리거, 저장 프로시저
	- YCQL API
		- Apache Cassandra 에서 파생된 API로 대규모 애플리케이션에서 매우 낮은 대기시간을 요구하는 경우 적합
		- 단순 SLQ 세트 지원하여 높은 성능 유지
		- 관계형 무결성 제약 조건, 조인, 트리거 지원 안함 X

### 클라이언트
- Java, Python, Node.js, Go  등 지원
- YSQL API 는 일반적인 postgresql 드라이버 사용
- YCQL API 는 클러스터 지향적이고 노드 토폴로지와 가까운 데이터 센터의 읽기를 지원하므로 로드 밸런서 없이도 효율적인 데이터베이스 상호작용

### PostgreSQL 재사용
- YSQL API 는 PostgreSQL 상단 계층 재사용하여 구현됨
	- 쿼리 플랜 생성 및 실행 같은 작업을 처리하는 상단 계층은 변경하지 않음
- 저장 계층은 분산된 문서 스토어(DocDB)로 대체
- 이를 통해 PostgreSQL 의 익숙한 사용자 경험을 유지하면서 분산환경에 동작하도록 설계


### YSQL vs YCQL

| 특징     | YSQL                     | YCQL[^ycql]                     |
| ------ | ------------------------ | ------------------------------- |
| 목적     | PostgresSQL 호환 SQL      | Apache Cassandra 호환 CQL         |
| 데이터 모델 | 관계형 모델 (테이블, 행, 열)       | Wide-Column 모델                 |
| 트랜잭션  | 완전한 ACID 트랜잭션 지원        | 단일 키 트랜잭션, eventual consistency |
| 쿼리 언어  | SQL                      | CQL (Cassandra Query Language)  |
| 사용 사례  | 전통적인 관계형 DB 애플리케이션, OLTP | 실시간 데이터 처리, 분산 애플리케이션           |
|        |                          |                                 |

YSQL, YCQL 둘다 사용하거나 하나만 사용할 수 있다.

#### YSQL 만 사용하는 경우
- SQL 쿼리를 필수로 사용해야할 때
- 트랜잭션이 중요하거나 기존 pg 애플리케이션을 마이그레이션하는 경우

#### YCQL 만 사용하는 경우
- 실시간 처리나 카산드라랑 호환해야할때
- 빠른 데이터 쓰기가 중요하고 완벽한 트랜잭션이 필요하지 않은 경우
- 예) IoT, 로그 분석, 메세지 처리

#### 둘다 사용할 수 있는 경우
- 같은 클러스터에서 동시에 사용 가능하다
- 같은 데이터에 접근할때는 사용할 인터페이스 분리하는 것이 좋음
	- 데이터 모델과 쿼리 언어의 차이로 인해 혼동이 발생할 수 있음
	- *데이터 일관성에 영향 줄 수 있음*

##### 둘다 동시에 사용이 가능한 이유
![](/resource/img/kyupid-2025-01-16-001010-QM9ZjX3r.png)
- 유가바이트 핵심은 **DocDB**라는 분산 스토리지 엔진
- DocDB는 단일 물리적 데이터 스토리지 계층에 동작하고 쿼리 계층과는 아예 분리되어 있다
- 데이터가 저장되는 방식은 YSQL이든 YCQL 이든 동일한 물리적 저장소를 공유함
- 하지만 데이터를 질의하는 방식이 달라서 데이터 처리와 일관성에 차이가 있을수있다
- 예를 들어, YSQL 에서 작성된 테이블과 YCQL 에서 작성된 테이블은 내부적으로 DocDB에 키-값 쌍으로 저장되지만, API 계층에서의 데이터모델과 쿼리 방식은 다르다.

### 결론

YugabyteDB는 고가용성, 확장성, 낮은 대기 시간을 제공하기 위해 설계된 분산 SQL 데이터베이스ㅇ다. 클라우드 네이티브 환경에서 작동하며, PostgreSQL과 유사한 기능과 분산 데이터 저장의 장점을 결합한 아키텍처를 갖추고 있다.

## demo

```bash
#!/bin/bash

docker rm -f yugabytedb-node1
docker rm -f yugabytedb-node2
docker rm -f yugabytedb-node3

rm -rf ~/yugabyte-volume
mkdir ~/yugabyte-volume

docker network rm yugaplus-network
docker network create yugaplus-network

docker run -d --name yugabytedb-node1 --net yugaplus-network \
  -p 15433:15433 -p 5433:5433 \
  -v ~/yugabyte-volume/node1:/home/yugabyte/yb_data --restart unless-stopped \
  yugabytedb/yugabyte:latest \
  bin/yugabyted start --base_dir=/home/yugabyte/yb_data --background=false

while ! docker exec -it yugabytedb-node1 postgres/bin/pg_isready -U yugabyte -h yugabytedb-node1; do sleep 1; done

docker run -d --name yugabytedb-node2 --net yugaplus-network \
  -p 15434:15433 -p 5434:5433 \
  -v ~/yugabyte-volume/node2:/home/yugabyte/yb_data --restart unless-stopped \
  yugabytedb/yugabyte:latest \
  bin/yugabyted start --join=yugabytedb-node1 --base_dir=/home/yugabyte/yb_data --background=false

docker run -d --name yugabytedb-node3 --net yugaplus-network \
  -p 15435:15433 -p 5435:5433 \
  -v ~/yugabyte-volume/node3:/home/yugabyte/yb_data --restart unless-stopped \
  yugabytedb/yugabyte:latest \
  bin/yugabyted start --join=yugabytedb-node1 --base_dir=/home/yugabyte/yb_data --background=false
```

## 모니터링 키워드

- YugabyteDB Aeon: full managed db..YugabyteDB-as-a-Service
- https://api-docs.yugabyte.com/

---
[^bare-metal]:  그냥 쌩 머신
[^question1]: 단순 확장이라는게 scale out? up? 
[^question2]: OracleRAC 처럼 데이터베이스가 하나인건가 아니면, 정말 디비가 분산되어 있어 샤딩된 구조인가?
[^cap]: cap 가 무엇인가
[^raft]: raft 가 무엇인가
[^hotspot]: hotspot?
[^ycql]: CQL = Cassandra Query Language