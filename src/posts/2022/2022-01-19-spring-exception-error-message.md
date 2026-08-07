---
title: "스프링에서 예외처리 동시에 에러메시지 담아 클라이언트에 응답 관련 고민"
description: "들어가기 처음에 예외처리하여(Exception) 클라이언트에게 원하는 데이터를 내보낼수 있다는 사실을 몰랐다. 그때 해결하려했던 생각은 ErrorMessage라는 객체를 만들어서 서비스층에서 조건에 걸리지 않으면 ErrorMessage 를 return 하려고 했다."
tags: [스프링]
---

## 들어가기

처음에 예외처리하여(Exception) 클라이언트에게 원하는 데이터를 내보낼수 있다는 사실을 몰랐다.

그때 해결하려했던 생각은 `ErrorMessage`라는 객체를 만들어서 서비스층에서 조건에 걸리지 않으면 `ErrorMessage` 를 return 하려고 했다.

그렇게 하려고 했던건 다시 말하지만 단순히 예외처리를 하였을 땐 따로 JSON 데이터로 사용자에게 응답을 주지 못할 것이라고 생각하였기 때문이다.

그래서 아래와 같은 방법으로 해결하려고 했다.

## 첫번째 방향

하고 싶었던 것은 아래 코드처럼 예외를 throw 하되 클라이언트에 데이터를 같이 응답해주고 싶었다.

```java
    public String sendAuthMail(String userId) throws Exception {
        String authKey;
        if (!hasMember(userId)) {
            authKey = mss.sendAuthMail(userId);
        } else {
            throw new Exception("중복된 이메일이 존재합니다");
        }
        return authKey;
    }
```

하지만 이렇게 단순히 예외처리를 한다면 클라이언트에게는 500에러밖에 받지 못하기 때문이라고 생각해서 다른 방법을 찾았다.

그래서 처음 말한거처럼 객체로 다음과 같이 응답을 하고 싶었다.

```java
    public String sendAuthMail(String userId) {
        String authKey;
        if (!hasMember(userId)) {
            authKey = mss.sendAuthMail(userId);
        } else {
            return ErrorMessageResponseDto.builder()
                    .result(false)
                    .message("중복된 이메일이 존재합니다")
                    .build();
        }
        return authKey;
    }
```

이렇게 응답하려면 타입을 수도코드로 한다면 `public String|ErrorMessageResponseDto sendAuthMail(String userId) {` 처럼 했어야했다.

근데 자바는 리턴타입이 하나이니까 다른 방법이 필요했다.

처음엔 원래 있던 객체에 `result`, `message`라는 필드를 넣어서 아래와 같이 해결하려고 했다.

```java
public class MemberMailAuthInfoDto {
    private String email;
    private String authKey;

    private boolean result;
    private String message;

    // Getter, Setter, Constructor ...
}

public MemberMailAuthInfoDto sendAuthMail(String userId, MemberMailAuthInfoDto dto) {
    String authKey;
    if (!hasMember(userId)) {
        authKey = mss.sendAuthMail(userId);
        dto.setAuthKey(authKey);
    } else {
        dto.setResult(false);
        dto.setMessage("중복된 이메일이 존재합니다")
        return dto;
    }
    return dto;
}
```

위 방법은 타입 하나로 풀려는 문제를 해결했지만 딱 봐도 지저분해보이고 뭔가 문제같았다.

1. 일단 클래스 이름에서 나오는 책임과 달리 result와 message가 추가되면서 관계없는 책임이 이 클래스에 부가 되었다.

2. 책임이 하나이고 특정 상황을 위한 객체이기 때문에 광범위하게 쓰일거같은 result와 message가 여기에 종속되어 또 필요할때 다른 객체도 똑같이 넣어줘서 문제이다.

그러므로 위 방법은 하지 않기로 했다.

그래서 택한 방법이 아래와 같은 방법이다.

```java
public class ApiResult<T> {

    private T data;
    private String errorMessage;

    private ApiResult(T data, String errorMessage) {
        this.data = data;
        this.errorMessage = errorMessage;
    }

    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(data, null);
    }

    public static ApiResult<?> fail(String errorMessage) {
        return new ApiResult<>(null, errorMessage);
    }

    public T getData() {
        return data;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
```

같은 메소드에서 리턴타입에 상관없이 `ApiResult<?>`를 응답해주면 되므로 매우 좋았다.

예외 사항이 생겼을 경우에 메시지를 보내고 싶으면 `fail(errorMessage)`를 사용하면 되고,

기대하는 로직에 따라 데이터를 응답하고 싶으면 `ok(data)`를 호출하면 되었다.

그래서 아래와 같은 서비스 로직으로 바뀌었다.

```java
    public ApiResult<?> sendAuthMailToMember(String userId) {
        String authKey;
        if (hasMember(userId)) {
            authKey = mss.sendAuthMail(userId);
        } else {
            return ApiResult.fail("존재하지 않는 이메일입니다.");
        }
        return ApiResult.ok(authKey);
    }
```

에러메시지는 이넘 클래스 한 곳에 모아 관리하면 유지보수도 괜찮을거 같고,

사실 이거 말곤 더이상 해결할 수 있는 방법은 보이지 않았기 때문에 이 방법에 정말 만족하고 있었다.

그러다가 우연치 않게 더 낫고, 합리적이라고 생각드는 방법을 찾았다.

## 두번째 방향

처음에 컨트롤러에서 `@Valid` 로 dto를 validate 해주면서 예외가 터졌을때 JSON에 에러메시지를 담아서 응답해주고 싶었는데 관련해서 찾다가 다른 방법을 발견했다.

연관되어지는 키워드는 `@ControllerAdvice` 이었다.

`@ControllerAdvice`를 사용하면 AOP 로 컨트롤러에 있는 메소드에서 예외가 발생할때 인터셉트해서 `@ControllerAdvice`가 붙은 클래스 내에 `@ExceptionHandler(발생한Exception.class)` 가 붙은 메소드를 실행시켜준다.

자세한 코드는 아래에 적겠다.

마음한구석에서 계속 개선하고 싶었던 `ApiResult<>`클래스를 `@Valid`관련 문제를 해결하려하면서 한번에 두 문제를 해결할 수 있었기 때문에 엄청 기뻤다.

일단 `ApiResult<>`로 감싸서 응답해줬던 모든 API 응답 객체들을 전부 풀었다. 리턴타입이 void 였던 것도 ApiResult로 내보내고 있었는데 `ResponseEntity` 로 변경해서 좀더 HTTP 응답상태에도 신경쓰기로 했다.

그다음은 메시지로 내보낼 객체와 `@ControllerAdvice` 사용을 위해 `ExceptionController`를 생성하고,

에러코드와 메시지 정보를 관리할 `ErrorInfo` enum, 실제 응답객체인 `ErrorResponse` 를 만들어줬다.

```java
@Getter
@Setter
public class ErrorResponse {

    private String code;
    private String description;

    public ErrorResponse(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
```

```java
@Getter
public enum ErrorInfo {

    NO_EMAIL("ERROR_CODE_0001","존재하지 않는 이메일입니다."),
    DUPLICATED_EMAIL("ERROR_CODE_0002","중복된 이메일이 존재합니다"),
    NO_CHANGEABLE_NICKNAME("ERROR_CODE_0003", "닉네임 변경 후 30일간 변경 불가능합니다.")
    ;

    private String code;
    private String description;

    ErrorInfo(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
```

```java
@ControllerAdvice
public class ErrorController {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(EmailNotFoundException.class)
    @ResponseBody
    public ErrorResponse emailNotfoundException() {
        return new ErrorResponse(
                ErrorInfo.NO_EMAIL.getCode(),
                ErrorInfo.NO_EMAIL.getDescription()
        );
    }
}
```

그리고 기존 서비스 코드는 아래와 같이 깔끔하게 예외터지도록 해주고 위 예시로 말을 하면 `EmailNotFoundException` 를 발생시키면 `ControllrAdvice`에서 인터셉트해서 해당 메소드로 바꿔 실행한다.

여기에 `ResponseBody`로 `ErrorResponse`를 응답해주면 되는것이다.

이렇게 하면 책임분리가 확실하다.

1. `@Valid` 시에 발생하는 Exception 도 컨트롤러로 가져와서 처리하여 예외처리에 대한 일관성이 생긴다

2. 따지자면 기존 서비스에서 `ApiResult<>`에 메시지를 담아 예외처리를 한거나 마찬가지인데 이제 스프링에서 제공해주는 기능과 자바에서 이미 제공하는 Exception 을 활용하여 백엔드와 프론트엔드 둘다 합리적인 빙법으로 데이터를 응답하고 에러를 관리할 수 있게 됐다

## 마무리

당시에 나는 예를 들어서 프론트에서 응답은 무조건 Http응답을 200대로 나오도록 하고,

즉 ajax에서는 `success(result)` 콜백함수가 터지도록 하고 `result.data`를 null체크를 하여 data가 있냐없냐에 따라 예외처리를 하려고 했는데

이렇게 생각했던 근본은 HTTP 응답 코드에 대한 이해와 ajax에서 통신시 `error()` 와 `success()` 콜백함수가 발생하는 그 기준을 몰라서였다.

근데 지금도 사실 어떤 기준으로 200대 에러와 400대 에러를 구분해서 보내야할지 모르겠다.

"중복된 이메일이 존재합니다" 혹은 "존재하지 않는 이메일입니다" 같은 게 400대 에러를 보내야할 프로세스들인가?

잘못된 요청은 아닌거 같지만 지금 드는 생각은 "예상이 되는 예외"와 "예상이 안되는 예외"를 나누는 것이다.

"예상이 될때 예외"가 지금 내가 처리하려는 예외이기 때문에 정상적인 응답으로 보고 200으로 내보낸다.

하지만 "예상이 안되는 에러"는, 예를 들어서 외부자가 데이터를 조작해서 서버에 접근하여 그게 필터되어 예외가 발생했다?

이건 예상이 안되는 예외라고 봐서 400에러를 내보내야할것 같다.

꼬리에 꼬리를 무는 고민들이 많이 생겨 아직까지도 확실한 근거에 의해서 문제를 해결한 것은 아니지만

처음 아무것도 몰랐을 때 내가 접근하려했던 방식과 우연치않게 합리적이라 생각드는 방법을 찾아 어찌됐던간에 문제를 해결했기 때문에 만족한다.

## 참고자료

[https://github.com/swing-park/issue-tracker](https://github.com/swing-park/issue-tracker)

[https://cchoimin.tistory.com/entry/Valid-%EC%99%80-ControllerAdvice%EB%A1%9C-DTO-%EC%98%88%EC%99%B8%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0](https://cchoimin.tistory.com/entry/Valid-%EC%99%80-ControllerAdvice%EB%A1%9C-DTO-%EC%98%88%EC%99%B8%EC%B2%98%EB%A6%AC%ED%95%98%EA%B8%B0)

## 관련해서 했던 고민들

[https://github.com/kyupid/java-chess-again/issues/80](https://github.com/kyupid/java-chess-again/issues/80)

---
