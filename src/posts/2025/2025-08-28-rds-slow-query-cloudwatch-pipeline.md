---
id: 18
title: "RDS Slow Query, CloudWatch Logs 수집 파이프라인 구축기"
description: "클라우드 환경에서 데이터베이스를 운영하다 보면, 단순히 개별 지표만 모니터링하는 것으로는 충분하지 않을 때가 있습니다."
tags: [경험, AWS]
---

클라우드 환경에서 데이터베이스를 운영하다 보면, 단순히 개별 지표만 모니터링하는 것으로는 충분하지 않을 때가 있습니다. CPU 사용량이나 메모리 지표처럼 시스템 리소스 상황을 보면서도, 동시에 데이터베이스 내부에서 발생하는 쿼리의 성능 문제를 함께 파악해야 진짜 원인을 좁혀갈 수 있기 때문입니다. 특히 AWS RDS를 사용할 경우, 제공되는 모니터링 도구만으로는 세부적인 쿼리 성능 분석이 아쉽다고 느껴질 때가 많습니다.

RDS를 사용하면 AWS 콘솔에서 Slow Query 로그를 내려받거나 텍스트로 확인할 수 있습니다. 하지만 텍스트 로그만으로는 운영 환경에서 곧바로 활용하기 어렵습니다. 차트 기반 분석이나 다른 모니터링 시스템과의 통합이 쉽지 않기 때문입니다. 저는 Slow Query 데이터 역시 CPU, 메모리, 트랜잭션 지표처럼 다른 성능 지표와 함께 한 화면에서 차트로 모니터링할 수 있어야 한다고 생각했습니다. 그래서 "Slow Query 로그 수집"은 단순한 선택이 아니라 기본 기능에 가깝다고 보았고, 이번 글에서는 이를 위해 구축한  수집 파이프라인을 정리해 보려 합니다.

## Slow Query 로그 처리 방식과 RDS의 제약

RDS에서 제공하는 데이터베이스 엔진 중 슬로우 쿼리를 옵션으로 지원하는 것은 PostgreSQL과 MySQL입니다. PostgreSQL은 별도의 슬로우 쿼리 로그 기능이 있는 것은 아니며, log_min_duration_statement 설정을 통해 일정 시간 이상 실행된 쿼리를 일반 로그에 기록하는 방식을 사용합니다. 이때 로그는 항상 파일 기반으로 남게 됩니다.

MySQL은 slow_query_log 옵션을 통해 슬로우 쿼리를 기록할 수 있으며, log_output 파라미터를 통해 FILE 또는 TABLE 모드 중 하나를 선택할 수 있습니다. TABLE 모드는 로그를 데이터베이스 테이블에 기록하므로 SQL로 즉시 조회할 수 있어 개발 및 디버깅 단계에서 편리합니다. 하지만 슬로우 쿼리가 발생할 때마다 INSERT 연산이 발생하기 때문에 운영 환경에서는 성능에 부담을 줄 수 있습니다. 반면 FILE 모드는 PostgreSQL과 마찬가지로 로그를 운영체제 파일에 직접 기록하므로 성능 부담이 적고, ELK나 Fluentd 같은 외부 로그 수집 시스템과도 쉽게 연동할 수 있어 운영 환경에서는 주로 FILE 모드가 선호되지 않을까 합니다.

RDS MySQL은 서비스 유형에 따라 기본 로그 모드가 달라지는데요. RDS 인스턴스는 TABLE, Aurora 클러스터는 FILE 모드가 기본입니다. 운영자가 별도로 변경하지 않는 한 이 기본 설정을 따릅니다. 다만 FILE 모드의 경우 관리형 서비스 특성상 파일 시스템에 직접 접근할 수 없습니다. 따라서 로그를 보려면 AWS 콘솔을 통해 다운로드하거나 CLI에서 DownloadDBLogFilePortion API를 호출해야 합니다. 로그 파일은 시간 또는 크기 단위로 log.1, log.2와 같이 순차적으로 분할 저장되며, 비실시간 수집에는 무리가 없지만 실시간 수집에는 여러 제약이 따릅니다.

![AWS 콘솔창에서 RDS 슬로우 쿼리 로그 확인](/images/rds-slow-query-cloudwatch-pipeline/01.png)

## RDS API 직접 호출

FILE 모드에서 실시간 로그 수집을 구현하는 가장 단순한 방법은 DownloadDBLogFilePortion API를 주기적으로 호출하여 증분 데이터를 가져오는 Polling 방식입니다. 이론적으로는 실시간에 가까운 수집이 가능하지만 실제 운영 수준으로 구현하려면 복잡한 처리가 필요합니다.

- API는 전체 로그가 아닌 오프셋(marker) 기반 페이징을 요구하므로 수집 위치를 추적해야 합니다.
- 응답 경계에서 SQL이 분할되는 경우가 있어 이를 재조립하는 파싱 로직이 필요합니다.
- 로그 로테이션 시점에 새로운 파일로 원활히 전환하지 않으면 중복 또는 누락이 발생합니다.

결국 단순한 API 호출을 넘어 상태 관리와 예외 처리를 포함한 복잡한 구현이 필요하며, 안정성을 보장하기에는 부담이 큽니다.

## CloudWatch Logs 활용

이러한 복잡성을 해소할 수 있는 대안은 RDS 로그를 CloudWatch Logs로 Export하는 기능입니다. 설정만으로 Slow Query 로그를 지정한 로그 그룹에 실시간 전송할 수 있으며, CloudWatch를 통해 오프셋 관리, 쿼리 재조립, 로그 로테이션 같은 문제들이 모두 해소됩니다. 로그 이벤트에는 eventId와 timestamp가 포함되어 있어 이를 기준으로 증분 수집을 안정적으로 구현할 수 있습니다.

따라서 운영 환경에서 안정성을 보장하려면 log_output을 FILE로 설정하고 Slow Query 로그를 CloudWatch Logs로 Export하도록 권장하는 것이 가장 현실적이라고 생각했습니다. 초기 설정의 번거로움은 있지만 장기적으로 훨씬 안정적인 운영이 가능합니다.

> **Datadog의 접근 방식?**
>
> Datadog Database Monitoring(DBM)은 Slow Query 로그를 직접 메트릭화하진 않는 것으로 확인됩니다. [공식 문서에서도 먼저 로그를](https://docs.datadoghq.com/ko/integrations/amazon-web-services/#log-collection)[**CloudWatch Logs**](https://docs.datadoghq.com/ko/integrations/amazon-web-services/#log-collection)[로 Export한 뒤](https://docs.datadoghq.com/ko/integrations/amazon-web-services/#log-collection), [Datadog Forwarder(Lambda)](https://docs.datadoghq.com/ko/logs/guide/forwarder/?tab=cloudformation)를 통해 Datadog으로 전달하는 방식을 권장합니다.

![Datadog DBM(MySQL) 로그 셋업 화면](/images/rds-slow-query-cloudwatch-pipeline/02.png)

결론적으로, DownloadDBLogFilePortion API 기반 Polling은 실시간성은 뛰어나지만 상태 관리와 장애 대응이 어렵습니다. 반대로 CloudWatch Logs 방식은 Export 설정과 FILE 모드 전환이 필요하지만 안정성과 데이터 정합성 측면에서 훨씬 유리합니다. 따라서 CloudWatch Logs를 기본 수집 경로로 삼고, 필요 시 Polling을 보조적으로 활용하는 구조가 합리적이라고 생각했습니다.

## 수집 파이프라인 개발

처음에는 CloudWatch Logs의 **구독(subscription) 방식**을 활용하는 방안을 검토했습니다. RDS Slow Query 로그를 CloudWatch Logs로 Export한 뒤 이를 구독하면 로그 이벤트가 발생할 때마다 실시간으로 전달되므로 구현 자체는 단순합니다. 그러나 이 방식에는 몇 가지 제약이 존재합니다.

우선 AWS의 제약으로 인해 하나의 로그 그룹에는 최대 2개의 구독(subscription)만 설정할 수 있어 활용 범위가 제한됩니다. 내부 전용으로 운영한다면 이 정도 제약은 크게 문제가 되지 않을 수 있습니다. 하지만 이 수집기는 단일 조직이 아니라 여러 고객이 동시에 모니터링 SaaS를 통해 사용하는 환경을 전제로 합니다. 그렇다 보니 저희 서비스가 고객 환경에서 구독 슬롯 두 개 중 하나를 차지하게 되고, 고객에 따라서는 이를 부담스럽게 느낄 수도 있다는 점이 신경 쓰였습니다.

또한 구독을 적용하려면 코드를 Lambda 함수로 배포해야 하는데, 저희는 이미 설치형 바이너리 에이전트를 중심으로 다양한 클라우드 메트릭을 수집하는 방식을 제공하고 있었습니다. 추가 기능 역시 이 에이전트에 통합하여 개발하는 편이 자연스러웠기 때문에, 고객 환경에 별도의 리소스인 Lambda를 추가하도록 만드는 것은 부담을 드리는 일이라 선호되지 않았습니다.

따라서 구독 방식에 의존하기보다는 기존 설치형 에이전트에 기능을 확장하는 방향을 주요 전략으로 삼았습니다. 다만 고객에게 선택지를 제공하기 위해 CloudFormation 템플릿을 마련하여 Lambda 함수를 간편하게 설치할 수 있는 옵션도 함께 지원했으며, 결과적으로 Polling 기반 수집 방식을 병행 제공하는 것을 목표로 했습니다.

## Polling 기반 수집

처음 고려했던 DownloadDBLogFilePortion API는 위에서 언급한 것처럼 오프셋 관리, 잘린 쿼리 복원, 로그 로테이션 처리 등 복잡한 문제가 있어 운영 환경에서 안정적으로 사용하기 어려웠습니다. 이에 대신 CloudWatch Logs의 FilterLogEvents API를 활용했습니다. 이 API는 특정 시점 이후의 이벤트만 필터링해 가져올 수 있어 증분 수집에 적합하며, Polling 방식임에도 안정성을 확보할 수 있었습니다.

Go 기반 수집 에이전트는 다음과 같은 방식으로 동작합니다.

- FilterLogEvents API 호출 시 마지막으로 수집한 이벤트의 timestamp를 startTime으로 지정하여 증분 수집을 구현했습니다.
- 각 이벤트의 eventId를 기준으로 중복을 제거해 데이터 정합성을 보장했습니다.
- 고루틴을 활용하여 단일 수집기가 여러 DB 인스턴스와 로그 그룹을 동시에 처리할 수 있도록 설계했습니다.

마지막 단계에서는 SQL 텍스트와 실행 시간 같은 핵심 필드를 추출해 공통 데이터 구조(key-value 기반 패킷 포맷)로 표준화했습니다. 이후 직렬화된 패킷을 TCP를 통해 수집 서버로 전송하여 서로 다른 소스에서 들어오는 로그 데이터도 일관된 스키마로 처리할 수 있도록 했습니다.

```go
// MySQL, PostgreSQL 로그 파싱 로직 생략
// ... 

pack := map[string]interface{}{
    "category": "slow_query",
    "tags": map[string]string{
        "db_instance": instanceID,
    },
    "fields": map[string]interface{}{
        "sql": queryText,
        "elapsed_time": elapsed,
    },
}
sendPacket(pack)
```

## 정리

최종적으로는 CloudWatch Logs를 중심 경로로 삼고, Go 에이전트가 이를 표준 포맷으로 가공 및 전송하는 파이프라인을 완성했습니다. 이를 통해 RDS Slow Query 로그 역시 CPU, 메모리, 트랜잭션 지표와 함께 한 화면에서 모니터링할 수 있게 되었습니다.

![와탭랩스 슬로우 쿼리 로그를 차트로 표현](/images/rds-slow-query-cloudwatch-pipeline/03.png)

설계 과정에서 고객 환경의 편의성과 안정성을 최우선으로 두었고, 필요에 따라 CloudFormation 기반 구독(subscription) 방식을 선택할 수 있는 옵션도 제공했습니다. 덕분에 고객은 상황에 따라 구독 기반의 실시간 수집과 Polling 기반의 안정적 수집 중에서 자유롭게 선택할 수 있게 됐습니다.

## 다음 과제

무엇보다 이 구조는 특정 로그에 한정되지 않고, Error Log, Audit Log 등 다른 로그 유형으로도 확장 가능한 공통 수집 기반을 마련했다는 점에서 의미가 있었습니다. 앞으로는 고객이 더 직관적이고 효과적으로 로그 데이터를 활용할 수 있도록 에이전트가 클라우드 메트릭 수집이라는 단순 역할에서 벗어나, 슬로우 쿼리 뿐만 아니라 다른 로그들도 통합적으로 제공하는 것이 다음 과제가 되었습니다.
