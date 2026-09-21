# iwtc-frontend 리팩터링 인수인계

작성일: 2026-09-02
최종 업데이트: 2026-09-21

## 시작 지점

- 기준 브랜치: `prod/v1.0`
- 작업 브랜치: `refactor/full-project`
- 마지막 코드 커밋: `3ce19d7 perf: reuse embedded media responses`
- 자동 배포 커밋: `dbfc557 ops: deploy 3ce19d70910ad736c64bcfbc5e13f5d2a8c3b208`
- 현재 작업 브랜치는 원격과 동기화되어 있다. 정확한 상태는 `git status --short --branch`로 확인한다.
- 기존 커밋 인수 검수는 다시 하지 않는다. 현재 작업 브랜치 HEAD부터 이어서 작업한다.

다른 환경에서 시작할 때:

```bash
git fetch origin
git switch refactor/full-project
git pull --ff-only
npm ci
```

## 반드시 지킬 제약사항

1. 기존 서비스 기능과 사용자 동작을 변경하지 않는다.
2. API endpoint와 request/response contract를 변경하지 않는다.
3. UI/UX와 디자인을 변경하지 않는다.
4. 리팩터링과 무관한 기능을 추가하지 않는다.
5. 기존 의존성의 major version을 올리지 않는다.
6. 명확한 필요성이 없는 신규 라이브러리를 추가하지 않는다.
7. 수정할 영역의 기존 구조와 호출 흐름을 먼저 확인한다.
8. 영역·도메인 단위로 나누어 점진적으로 수정한다.
9. 공통화가 복잡도를 높이면 억지로 추상화하지 않는다.
10. dead code와 unused dependency는 실제 참조 여부를 확인한 뒤 제거한다.
11. `any`, 불필요한 type assertion, `@ts-ignore`, `eslint-disable`로 오류를 우회하지 않는다.
12. 각 단계마다 lint, typecheck, test, build를 모두 실행한다.
13. 변경 범위가 크면 문제와 개선 방향을 먼저 정리한다.
14. 하나의 커밋에는 가능한 한 하나의 리팩터링 목적만 담는다.

Pexels 출처 표시 보완은 별도로 합의된 후속 기능 개선이다. 위 3·4번의 초기 리팩터링 제약에 적용하지 않되, 기존 화면의 핵심 이동·조작 흐름은 유지한다.

## 현재 검증 기준선

아래 명령 전체는 2026-09-03 통합 검수 기준으로 통과했다. 최신 HEAD의 재검증 범위는 아래 `2026-09-17 최신 검증`을 따른다.

```bash
npm run lint
npm run typecheck
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
npm test
npm run build
```

- 테스트: 65개, 22 suites
- 테스트 도구: 별도 라이브러리 없이 Node.js `node:test`
- production build는 `.env.production`을 사용한다.
- `prod/v1.0` 대비 107개 파일, 원격 작업 브랜치 대비 69개 파일의 변경과 로컬 커밋 35개의 목적을 최종 검토했다.
- lint에는 기존 `@next/next/no-img-element` 경고 2건이 남아 있다.
  - `src/components/manage/ImageTypeLayout.tsx`: 1건
  - `src/components/manage/contentsListCard/StaticMediaFileTypeCard.tsx`: 1건
- build에는 기존 `caniuse-lite is outdated` 안내가 나온다. 의존성 갱신은 이번 리팩터링 범위에 포함하지 않았다.

### 2026-09-17 최신 검증

- `0ceb297` 기준 `npm run typecheck`, `npm run lint`, `npm test`를 통과했다.
- 실제 브라우저에서 수정 화면의 제목·설명 표시, 비공개 선택, 빈 설명 저장, 저장 후 상단 제목 갱신을 확인했다.
- 저장 후 관리 상세·내 월드컵 목록·홈 목록 캐시를 무효화한다.
- Pexels 공통 제공 링크 추가 후 `npm run typecheck`, `npm run lint`, 65개 테스트, `npm run build`를 통과했다.
- 데스크톱·모바일 브라우저에서 footer 노출을 확인했고, Pexels 링크는 `https://www.pexels.com/`을 새 탭으로 열며 `noopener noreferrer`를 사용한다.
- 일반 사용자 제작 진입 중단 후에도 동일한 전체 검증을 통과했다. 브라우저에서 데스크톱·모바일 제작 메뉴 제거, `/manage` → `/` 이동, `/manage/[id]` 수정 경로 유지를 확인했다.
- Pexels 사진 URL·작가 URL을 홈 목록, 결과 화면의 우승자·최종 순위·누적 인기 순위, 관리·수정 미리보기까지 연결했다. 최신 변경 기준 `npm run typecheck`, `npm run lint`, 65개 테스트, `npm run build`를 통과했다.
- 브라우저 모킹 검증에서 홈 카드 시작 링크와 작가·사진 링크가 중첩되지 않고 각각 올바른 URL을 가리키는 것을 확인했다. 결과 화면에서도 우승자·최종 순위·누적 인기 순위 링크를 확인했다.
- 모바일 결과 화면의 우승 이미지에 `min-height: 300px`와 `16:10` 비율이 동시에 적용되어 390px 뷰포트에서 이미지 영역이 480px로 늘어나던 문제를 수정했다. 모바일은 `7:6`, `sm` 이상은 기존 `16:9` 비율을 사용하며, 출처 배지는 명시적인 좌우 위치와 화면 폭 기준 최대 너비를 갖는다. 390px 브라우저에서 이미지와 긴 작가명 배지가 모두 카드 경계 안에 들어오는 것을 확인했다.

### 월드컵 삭제 요청 오류 해결 완료

- 2026-09-17 운영의 내 월드컵 목록에서 삭제 요청 본문으로 JSON 문자열 `null`이 전송되어, NestJS JSON parser가 컨트롤러 진입 전에 HTTP 400과 `Unexpected token 'n', "null" is not valid JSON`을 반환했다. 운영 요청에 포함됐던 인증 토큰 값은 문서나 Git에 기록하지 않는다.
- 직접 원인은 `src/services/BaseService.ts`의 `ajaxDelete`가 Axios `data` 옵션을 항상 만들고, `ManageWorldCupService`의 월드컵·후보 삭제 호출이 `null`을 넘긴 것이다.
- `ajaxDelete`가 DELETE 본문을 보내지 않도록 시그니처를 바꾸고, `ManageWorldCupService`와 `ReplyService` 호출부에서 `null`·빈 객체 본문을 제거했다. 타입 검사, 린트, 테스트 65개와 프로덕션 빌드를 통과했으며 린트·빌드에는 기존 `<img>` 경고 2건만 남아 있다.
- NestJS 백엔드의 소유자 전용 월드컵 영구 삭제 endpoint와 프론트 DELETE 본문 제거가 모두 운영 배포되었다. 성공 계약은 본문 없는 HTTP 204이고 다른 소유자·없는 ID는 HTTP 404다.
- 운영의 실제 월드컵은 파괴하지 않았으며, 미인증 요청의 HTTP 401과 Swagger DELETE 노출까지만 확인했다.

### 2026-09-20 공개 화면 미디어 N+1 제거

- 백엔드가 월드컵 목록·게임 후보·게임 결과·누적 랭킹 응답에 연결된 미디어 데이터를 함께 반환한다.
- `mappingMediaFile`과 홈 목록 매핑은 포함된 `mediaFile`을 우선 사용하며, 구버전 응답에만 `/api/media-files/{id}` fallback 요청을 보낸다.
- 홈 목록은 최대 20개 카드에서 발생하던 최대 40회의 추가 미디어 메타 요청을 제거했다. 운영 목록 10개의 미디어 20개가 한 응답에 포함되고 홈에서 모두 정상 표시되는 것을 확인했다.
- 타입 검사, 테스트 66개, 린트와 프로덕션 빌드가 통과했다. 기존 관리 화면 `<img>` 경고 2건과 `caniuse-lite` 안내만 남아 있다.
- 이미지 후속 작업은 업로드 시 1920px 제한 원본과 640px WebP 썸네일 생성, 기존 이미지 썸네일 backfill, UUID 객체와 Next 이미지 캐시 강화다. 이후 홈·랭킹의 YouTube iframe을 정적 썸네일로 바꾼다. 일반 사용자 제작 기능이 중단된 현재는 아래 게임 화면 애니메이션 성능 개선보다 우선순위가 낮다.

## 현재 다음 작업 우선순위

### 1. 게임 화면 선택 애니메이션 성능 개선 (완료)

- `src/app/play-game/[id]/page.tsx`의 고정 1초 `setTimeout`을 제거하고, 두 카드의 실제 spring 완료 Promise를 기다린 직후 다음 대결 또는 결과 화면으로 진행하도록 변경했다.
- `src/hooks/useGameSelectionAnimation.ts`의 무한 `loop` 설정을 제거했다. 선택 카드와 탈락 카드는 기존 좌우 방향을 유지하면서 최대 400px/2000px 대신 32px/120px만 이동하고, opacity와 scale을 함께 사용해 합성 이동 비용과 대기 시간을 줄였다.
- 기본 전환 duration은 320ms다. `prefers-reduced-motion: reduce`에서는 이동·확대 효과와 duration을 제거해 다음 대결을 즉시 표시한다.
- 순수 함수 `src/domain/game/selectionAnimation.ts`로 좌·우 선택과 reduced-motion target을 분리하고 테스트 3개를 추가했다.
- 운영 배포본의 기존 동작을 먼저 Playwright trace로 재현했다. 로컬 수정본은 모의 API를 사용해 실제 게임 결과를 만들지 않고 390px 모바일과 1440px 데스크톱에서 좌·우 선택을 확인했다.
- 실제 DOM 교체 기준 전환 시간은 모바일 약 342ms, 데스크톱 약 336ms, reduced-motion 약 12ms였다. 브라우저 콘솔 오류는 없었다.
- 타입 검사, 린트, 테스트 69개와 프로덕션 빌드가 통과했다. 기존 관리 화면 `<img>` 경고 2건과 `caniuse-lite` 안내만 남아 있다.
- 기능 커밋의 자동 배포가 끝난 뒤 실제 운영 모바일에서 한 번 더 체감 확인한다.

#### 운영 회귀 오류와 수정

- `651696f` 배포 후 후보 데이터와 접근성 이름은 다음 후보로 바뀌지만, 탈락 카드에 적용한 `opacity: 0`과 transform이 초기화되지 않아 다음 후보가 DOM에만 있고 화면에서는 보이지 않는 회귀 오류를 확인했다.
- 초기 검증이 후보명 교체만 확인하고 실제 computed style과 픽셀 렌더링을 확인하지 않아 이 문제를 놓쳤다.
- 원인은 `SpringRef.set(RESTING_STYLE)` 호출이 실행 중인 spring target을 초기 상태로 되돌리지 못한 것이다. reset도 `start({ to: RESTING_STYLE, immediate: true })`의 완료 Promise를 기다리도록 변경하고, 후보 목록 교체는 두 카드 reset이 끝난 뒤 실행한다.
- 운영 Chromium 데스크톱·모바일에서는 후보 데이터와 이미지 URL 교체를 확인했고, iPhone 15 WebKit 실제 캡처에서 오른쪽 카드가 사라지는 렌더링 오류를 재현했다. 사라진 카드의 computed style은 `opacity: 0`, `transform: matrix(0.98, 0, 0, 0.98, 120, 0)`이었다.
- 로컬 수정본은 WebKit iPhone 15과 서로 다른 이미지 4개의 모의 API로 재검증했다. 선택 후 다음 두 카드는 모두 `opacity: 1`, `transform: none`이며 실제 캡처에서도 두 이미지가 표시된다.
- 타입 검사, 린트, 테스트 69개와 프로덕션 빌드가 다시 통과했다. 회귀 수정 커밋의 자동 배포가 끝난 뒤 운영 WebKit에서 실제 픽셀과 computed style을 다시 확인한다.

### 2. 이미지 저장·전달 최적화 (보류)

- 신규 업로드 원본 제한·WebP 썸네일 생성과 기존 이미지 backfill은 일반 사용자 제작 기능을 다시 공개하거나 이미지 전송량이 실제 병목으로 확인될 때 진행한다.
- 현재 공개 화면은 내장 미디어 응답으로 메타데이터 N+1이 제거됐고 Next 이미지 최적화도 동작하므로 즉시 구현하지 않는다.

### 2026-09-21 Cloudflare 방문 통계

- 홈 Hero에 `오늘 방문`과 오늘을 포함한 `최근 7일 방문`을 표시한다. 값은 Cloudflare GraphQL Analytics의 `httpRequestsAdaptiveGroups.sum.visits`이며 `clientRequestHTTPHost: "iwtc.ddongmy.com"`, `requestSource: "eyeball"`로 제한한다.
- KST 자정을 UTC 시각으로 변환하고 하나의 GraphQL 요청에서 `today`, `lastSevenDays` alias를 함께 조회한다.
- Cloudflare Token과 Zone ID는 `/api/traffic` 서버 Route에서만 읽는다. Kubernetes Deployment는 `web-app-cloudflare` Secret의 `CLOUDFLARE_ANALYTICS_API_TOKEN`, `CLOUDFLARE_ZONE_ID` key를 선택적으로 연결하며 값 자체는 Git에 저장하지 않는다.
- 외부 응답과 공개 API 응답은 기존 Yup으로 런타임 검증한다. 성공 결과만 pod별 메모리에 10분간 저장하고 동시 최초 요청은 하나로 합친다. 오류 응답은 원문이나 토큰 없이 `503 unavailable`로 반환하며 화면은 통계를 숨긴다.
- 로딩 카드와 unavailable 자리의 높이를 동일하게 유지해 레이아웃 이동을 막는다. 390px 모바일에서 모의 성공 응답으로 숫자·CTA 배치를 확인했다.
- `npm run typecheck`, 76개 단위 테스트, `npm run lint`, `npm run build`가 통과했다. 린트·빌드에는 기존 관리 화면 `<img>` 경고 2건과 Browserslist 갱신 안내만 남아 있다.

## Pexels 출처 표시 보완 (완료)

### 일반 사용자 제작 기능 운영 정책

- 이미지 권리·출처·신고·검수 체계가 준비될 때까지 일반 사용자의 신규 월드컵 제작 진입을 중단한다.
- 헤더와 `내 월드컵` 화면의 제작 링크를 제거했고, `/manage` 직접 접근은 홈으로 임시 이동한다.
- 기존 소유자의 `/manage/[id]` 수정 화면, 월드컵·후보 생성 API, 자동화 경로는 유지한다.
- 새 월드컵 제작을 다시 공개할 때는 `/manage` 페이지를 Git 이력에서 복구하고, 업로드 권리 확인·신고 처리·공개 전 검수 정책을 함께 적용한다.

### 판단 기준

- Pexels API 가이드는 API 요청을 사용할 때 눈에 띄는 Pexels 링크를 표시하도록 요구한다. 공통 footer의 `Photos provided by Pexels` 링크는 이 조건을 만족시키는 가장 안전한 방법이지만, footer 위치 자체가 명시적 필수 조건은 아니다.
- 일반 Pexels 라이선스는 API를 통하지 않은 사진 사용의 출처 표기를 필수로 요구하지 않는다. 따라서 일반 사용자 업로드에 Pexels 메타데이터를 일괄 강제하는 것은 API 준수의 필수 작업이 아니다.
- `60~70% 준수`처럼 수치로 표현하지 않는다. 외부 자동화가 실제 Pexels API를 호출하는지 확인한 뒤 조건부로 판단한다.

### 현재 소스 확인 결과

- 게임 플레이 화면은 `src/components/game/MediaAttribution.tsx`에서 작가 프로필과 사진 페이지 링크를 표시한다.
- 홈 목록은 사진 URL·작가 URL을 화면 모델까지 전달하며, 카드 전체 이동 링크와 출처 링크를 형제 요소로 분리해 중첩 anchor 없이 표시한다.
- `src/app/play-clear/[...id]/page.tsx`의 우승자·최종 순위와 `RankListWrapper`/`RankList` 누적 인기 순위에 공통 출처 표시를 연결했다.
- 관리·수정 화면은 기존 Pexels 후보의 출처 메타데이터를 조회 모델과 편집 상태에 보존하고 미리보기에 표시한다.
- 프론트엔드 저장소에는 Pexels API 클라이언트가 없다. API를 사용하는 외부 자동화의 실제 호출 여부와 운영 위치를 확인해야 한다.
- NestJS 백엔드는 5개 출처 필드의 저장·존재 여부와 함께 `sourceUrl`의 Pexels 사진 경로, `sourceAuthorUrl`의 Pexels 작가 경로를 검증한다.
- 관리 화면에서 기존 Pexels 이미지를 일반 업로드 이미지로 교체하면 프론트 상태에서 출처를 즉시 제거하고, 백엔드도 기존 출처 5개 필드를 `null`로 초기화한다. 파일을 교체하지 않는 후보명·공개 여부 수정은 기존 출처를 유지한다.
- 일반 이미지 업로드는 출처 필드를 받지 않는다. 이는 Pexels API 미준수로 단정하지 않고, 일반 콘텐츠 권리·신고 정책으로 분리한다.

### 권장 구현 순서

1. 외부 자동화의 Pexels API 사용 여부를 확정하고 공통 제공 링크를 추가한다. (프론트엔드·백엔드·인접 프로젝트에서 API 직접 호출은 확인되지 않았고 호출 주체는 외부 자동화로 남아 있다. 백엔드 자동화 경로가 Pexels 출처를 전제로 하므로 `PexelsCreditFooter`를 추가해 서비스 전체에서 노출했다. 완료)
2. 홈 목록 화면 모델에 `sourceUrl`, `sourceAuthorUrl`을 연결하고 카드 전체 링크와 출처 링크가 중첩되지 않도록 마크업을 조정한다. (완료)
3. 결과 화면의 우승자·최종 순위와 누적 인기 순위에 출처 표시를 연결한다. (완료)
4. 관리·수정 화면의 기존 Pexels 후보 미리보기에 출처 표시를 추가한다. (완료)
5. NestJS 백엔드에서 Pexels 사진 URL·작가 URL의 호스트와 형식을 검증한다. (백엔드 작업 완료, 프론트엔드 표시 변경과 별도 커밋 예정)
6. 기존 Pexels 이미지를 일반 업로드로 교체할 때 백엔드가 이전 출처 메타데이터를 제거하도록 수정한다. (완료)

### 완료 기준

- Pexels 출처가 있는 사진은 게임·홈·결과·누적 순위·관리 미리보기에서 작가와 사진 페이지로 이동할 수 있다.
- Pexels 출처가 없는 일반 업로드·YouTube·MP4는 빈 크레딧 영역을 표시하지 않는다.
- 홈 카드에 중첩된 anchor가 없고 카드 이동과 외부 출처 링크가 각각 정상 동작한다.
- 모바일·데스크톱에서 출처가 이미지·후보명·순위 표시를 가리지 않는다.
- lint, typecheck, test, production build와 핵심 화면 브라우저 검증을 통과한다.

## 완료된 주요 범위

### 검증·React Query 기반

- lint/typecheck/test/build 스크립트와 테스트 실행 기준선을 확보했다.
- React Query Key를 `src/lib/react-query/queryKeys.ts`에서 관리한다.
- 랭킹 Query Key에 월드컵 ID가 포함되어 서로 다른 월드컵 캐시가 공유되지 않는다.
- 댓글 목록 무효화는 React Query v4 정식 API를 사용하며 타입 우회가 없다.

### API·도메인 타입 경계

- 월드컵 목록, 내 월드컵 목록·상세, 관리 콘텐츠, 댓글 API 응답 타입을 연결했다.
- 월드컵 생성·삭제와 관리 콘텐츠 생성·수정 요청 payload 타입을 연결했다.
- 게임 라운드·진행·종료·랭킹 API DTO를 `src/interfaces/models/world-cup/WcGameData.ts`에 분리했다.
- endpoint와 실제 요청 payload는 변경하지 않았다.

### 관리 도메인

- 기존 관리 콘텐츠와 신규 콘텐츠 모델을 `src/domain/manage/persistedContent.ts`에 정리했다.
- 관리 콘텐츠 조회·저장·편집 상태와 카드 래퍼의 활성 `any`를 제거했다.
- YouTube 카드와 정적 미디어 카드의 props, 상태, 이벤트, 수정·삭제 목록 타입을 연결했다.
- 신규 콘텐츠와 기존 콘텐츠의 `newList`, `modifyList`, `deleteList` 분기는 그대로 유지했다.
- 과거 주석 코드에서만 쓰이던 카드 내부 직접 API 호출 import와 `worldCupId` 전달 체인은 참조 확인 후 제거했다.

### 게임 도메인

- 게임 요청, 종료 요청, 라운드 진행률·라벨 계산을 순수 함수로 분리하고 테스트를 추가했다.
- 미디어 파일 결합 규칙을 `src/domain/game/mediaFile.ts`로 분리했다.
- 미디어 조회 실패 시 `/images/default.png`를 사용하는 기존 동작과 객체 참조 유지 동작을 테스트로 고정했다.
- 게임 진행 화면, 종료 화면, 랭킹 목록, 라운드 팝업의 상태 타입을 API DTO부터 연결했다.
- YouTube 플레이어 두 종류의 활성 `any`를 제거했다.
- 후보 선택 시 승자·패자 ID와 다음 제외 목록을 계산하는 로직을 순수 함수로 분리했다.
- 결승 종료·다음 라운드 요청·같은 라운드의 다음 후보 표시를 상태 전이로 분리했다.
- 1~4위 누적 규칙과 결과 페이지 경로 생성을 순수 함수로 분리했다.
- 선택 애니메이션, 후보 미디어 렌더링, 진행률 상태를 각각 훅과 컴포넌트로 분리했다.

### 홈 목록·공통 타입 경계

- 월드컵 목록 API 모델과 미디어가 결합된 화면 모델을 분리했다.
- `mappingMediaFile2`, Infinite Query, 목록 카드 props의 활성 `any`를 제거했다.
- 홈 목록 미디어 좌·우 요청의 4가지 성공/실패 조합을 테스트로 고정했다.
- `BaseService` 메서드의 기본 응답 타입을 `any`에서 `unknown`으로 축소하고, 제네릭을 생략했던 활성 호출부에 응답·요청 타입을 연결했다.
- 인증 폼, 헤더, 관리 폼, 검증 메시지, 댓글 Popper의 활성 `any`를 제거했다.
- 관리 컨텐츠 생성 폼의 공통·YouTube·파일 검증 규칙을 순수 함수로 분리했다.
- 관리 컨텐츠 생성 폼과 미디어 입력 UI를 목록 관리 컴포넌트에서 분리했다.
- 신규·수정 컨텐츠의 API 요청 payload 구성 규칙을 도메인 함수로 분리했다.
- 삭제·수정·신규 생성 API를 병렬로 실행하는 저장 요청 조합을 분리하고 실패 전파를 테스트했다.
- 이미지 파일 선택 시 FileReader 결과와 파일 메타데이터를 초안에 결합하는 변환을 분리했다.
- 2024년 1월부터 비활성 상태였던 GIF→MP4 변환 코드의 이력과 참조를 확인하고, FFmpeg 패키지 3개와 약 23MB의 public 런타임 파일을 제거했다.
- 관리 카드에서 상위 저장 방식으로 대체된 직접 API 호출 주석과 개발용 로그를 제거했다.
- 소스·설정·Git 이력을 대조해 사용 이력이 없는 `recoil`과 `@types/react`가 이미 제공하는 중복 직접 의존성 `@types/prop-types`를 제거했다.
- 서비스의 교체된 Query·endpoint·토큰 처리 주석과 인증 헤더·응답 디버그 로그를 제거했다.
- 화면 컴포넌트의 이전 SSR·수동 조회·모바일 버튼·게임 레이아웃·폼 마크업과 주석에서만 쓰이던 상태·import를 제거했다.
- 유틸리티의 과거 쿠키·localStorage 구현과 FFmpeg용 교차 출처 격리 설정을 포함한 잔여 코드형 주석을 제거했다.
- import 그래프와 Git 이력을 확인해 `HomeLoginForm`, `Sidebar`, `ReplyPopup`, `SessionStore`를 제거하고 Popper 패키지의 중복 직접 선언을 제거했다.
- 강화된 TypeScript 미사용 검사까지 통과하도록 빈 핸들러·미사용 import와 개발용 `console.log`를 제거했다.
- Axios 401 재시도 조건을 타입 가드로 분리해 응답·요청 설정이 모두 있을 때만 재발급하며, 응답 없는 네트워크 오류를 포함한 4개 경로를 테스트했다.

최근 작업 커밋:

```text
11ab4ab refactor: Axios 재시도 오류 조건 안전화
89a1114 refactor: 미사용 핸들러와 개발 로그 정리
7039141 refactor: 미참조 모듈 제거
c2136a3 refactor: 잔여 레거시 주석 정리
9d5fd22 refactor: 미사용 화면 마크업 정리
0de4967 refactor: 화면 과거 구현 정리
9aeaa4f refactor: 서비스 과거 구현 정리
6c539ae chore: 미사용 직접 의존성 제거
59e16e5 refactor: 관리 카드 과거 구현 정리
575d19b chore: 사용하지 않는 FFmpeg 의존성 제거
2b887cb refactor: 관리 이미지 입력 변환 분리
933a67d refactor: 관리 컨텐츠 저장 요청 조합 분리
b6afb78 refactor: 관리 컨텐츠 요청 데이터 구성 분리
6d8b64c refactor: 관리 컨텐츠 생성 폼 분리
e75daad refactor: 관리 컨텐츠 검증 로직 분리
441bc24 refactor: 게임 진행 상태 훅 분리
c258a20 refactor: 게임 순위 누적 로직 분리
3b5f371 refactor: 게임 후보 미디어 렌더링 분리
76252c4 refactor: 게임 선택 애니메이션 훅 분리
26d61fd refactor: 게임 라운드 상태 전이 분리
f97d3ce refactor: 게임 후보 선택 로직 분리
6b1ba50 refactor: 폼과 표시 컴포넌트 타입 연결
05bfd7a refactor: API 기본 응답 타입 축소
bf9a9c9 refactor: 홈 목록 미디어 타입 연결
1f155aa fix: 인증 폼 import 경로 대소문자 정정
5e97c52 refactor: 유튜브 iframe 컴포넌트 타입 연결
bada21a refactor: 게임 결과 화면 상태 타입 연결
9c5ce0d refactor: 게임 화면 상태 타입 연결
5fbbbd4 refactor: 게임 미디어 파일 매핑 타입 연결
f4b9d7e refactor: 월드컵 게임 API 응답 타입 연결
71ca770 refactor: 정적 미디어 콘텐츠 카드 타입 연결
002b928 refactor: 유튜브 콘텐츠 카드 타입 연결
7dc694a refactor: 관리 콘텐츠 카드 경계 타입 연결
74085b0 refactor: 관리 콘텐츠 편집 상태 타입 연결
fa7b523 refactor: 관리 콘텐츠 저장 타입 연결
a161087 refactor: 관리 콘텐츠 조회 타입 연결
5399ce6 refactor: 관리 월드컵 상세 타입 연결
```

## 작업 순서와 현재 상태

### 1. 홈 목록 미디어 매핑 타입 연결 (완료)

관련 파일:

- `src/utils/common.ts`의 `mappingMediaFile2`
- `src/interfaces/models/world-cup/WcListData.ts`
- `src/components/home/worldcup/WorldCupWrapper.tsx`
- `src/components/home/worldcup/WorldCupList.tsx`
- `src/components/home/HydratedWCList.tsx`

완료 전 문제:

- `mappingMediaFile2`, Infinite Query 응답, 목록 렌더 props에 `any`가 남아 있다.
- API의 숫자 media file ID를 화면용 미디어 문자열로 같은 필드에 덮어써 데이터 경계가 불명확하다.
- `Promise.allSettled` 결과에서 성공 항목만 필터링한 뒤 좌우 응답으로 다시 배치한다. 왼쪽 요청만 실패하면 오른쪽 응답이 왼쪽에 들어갈 가능성이 있다.
- 실패 경로에서 일부 필드만 변경된 객체가 반환될 수 있으므로, 타입만 맞추기 위해 동작을 임의 변경하면 안 된다.

완료 기준:

1. 좌/우 모두 성공, 왼쪽만 실패, 오른쪽만 실패, 모두 실패하는 조합의 기존 동작을 테스트로 먼저 고정한다.
2. 원본 API 목록 모델과 화면용 미디어가 결합된 모델을 구분한다.
3. `mappingMediaFile2`의 입력·반환 타입을 연결한다.
4. Infinite Query와 `WorldCupList` props의 `any`를 제거한다.
5. 실패 시 좌우 위치 문제를 실제 버그로 수정할 필요가 있다면 타입 정리와 별도 커밋으로 분리한다.

### 2. BaseService 기본 제네릭의 `any` 제거 (완료)

관련 파일: `src/services/BaseService.ts`

완료 전에는 `ajaxGet`, `ajaxPost`, `ajaxPut`, `ajaxDelete`의 기본 응답 타입이 `any`였다.

- 바로 `unknown`으로 일괄 변경하지 말고 아직 제네릭을 지정하지 않은 호출부를 먼저 찾는다.
- 각 서비스에서 실제 DTO를 연결한 뒤 기본 타입을 `unknown`으로 좁힌다.
- 타입 assertion으로 기존 호출부를 통과시키지 않는다.

검색 명령:

```bash
rg -n "ajax(Get|Post|Put|Delete)" src/services
rg -n "\\bany\\b" src --glob '*.{ts,tsx}'
```

### 3. 인증·폼·표시 컴포넌트의 잔여 `any` (완료)

정리한 주요 위치:

- `src/components/Register/HomeLoginForm.tsx`: 입력 이벤트 (후속 미참조 확인 후 파일 제거)
- `src/components/Register/LoginForm.tsx`: mutation 오류와 입력 이벤트
- `src/components/Register/RegisterForm.tsx`: 입력 이벤트
- `src/components/common/Header.tsx`: 클릭 이벤트
- `src/components/manage/WorldCupManageForm.tsx`: mutation 오류
- `src/components/ValidateMessage/index.tsx`: 검증 결과 구조
- `src/components/reply/ReplyPopup.tsx`: style 객체 (후속 미참조 확인 후 파일 제거)

적용한 타입:

- 입력: `ChangeEvent<HTMLInputElement>` 등 실제 DOM 이벤트 타입
- mutation 오류: 우선 `unknown`, 필요한 경우 Axios 오류 판별 함수 사용
- style 객체: `StylesConfig` 또는 라이브러리가 제공하는 공개 타입을 기존 설치 버전에서 확인
- 검증 결과: 실제 react-hook-form/yup 사용처를 확인한 뒤 필요한 필드만 모델링

### 4. 게임 페이지 책임 분리 (완료)

`src/app/play-game/[id]/page.tsx`는 타입 경계와 순수 계산 테스트는 확보됐지만 아직 크고 책임이 많다.

다음 후보:

- 후보 선택과 승자/패자 ID 계산 (완료)
- 다음 라운드 요청 시점과 제외 ID 누적 (완료)
- 애니메이션 제어 (완료)
- 후보 미디어 렌더링 (완료)
- 진행 상태 Hook (완료)

선택 로직을 순수 함수 테스트로 먼저 고정한 뒤 Hook과 UI를 분리한다. 현재 클릭 방향과 승자/패자 index 규칙을 임의로 바꾸지 않는다.

### 5. 관리 페이지 추가 분리 (완료)

- `WorldCupContentsManageList.tsx`의 검증 책임 분리 (완료)
- `WorldCupContentsManageList.tsx`의 생성 폼·미디어 입력 책임 분리 (완료)
- `WorldCupContentsManagerListWrapper.tsx`의 신규·수정 요청 payload 구성 분리 (완료)
- `WorldCupContentsManagerListWrapper.tsx`의 생성/수정/삭제 요청 실행 조합 분리 (완료)
- 활성 이미지 입력 변환 로직 분리 (완료)
- 비활성 GIF→MP4 변환 코드의 유지·제거 여부 확인 (제거 완료)
- Git 이력상 2024-01-15부터 YouTube 라이브러리와의 충돌로 비활성 상태였고, import·동적 import·설정 참조가 없어 관련 주석 코드와 의존성·런타임을 함께 제거했다.

### 6. dead code·unused dependency 확인 (완료)

- 관리 카드의 주석 처리된 직접 저장 구현과 개발용 로그는 제거했다.
- 직접 의존성의 소스·설정 참조를 점검했고, `recoil`과 중복 선언된 `@types/prop-types`를 제거했다.
- 서비스·화면·유틸리티·설정 파일의 코드형 주석은 Git 이력과 활성 흐름을 확인한 뒤 제거했다.
- 실제 import가 없는 모듈·컴포넌트는 문자열·동적 참조와 Git 이력을 확인한 뒤 제거했다. 삭제 후 import 그래프에 고립된 모듈이 없음을 재확인했다.
- 활성 `console.log`와 TypeScript 미사용 진단을 정리했다. 비동기 작업 실패를 알리는 `console.error` 2건은 유지했다.

### 7. 최종 안전성 점검 (완료)

- 활성 `any`, 타입 오류 억제 주석, 이중 assertion은 현재 검색 결과가 없다.
- `src/services/BaseService.ts`의 Axios 오류 처리에 있던 non-null assertion 2건을 제거했다.
- 응답 없는 네트워크 오류, 요청 설정 없는 401, 일반 서버 오류, 재시도 가능한 401을 테스트로 고정했다.
- 기존 `@next/next/no-img-element` 경고 3건은 동적 data URL·미디어 렌더 동작을 보존하기 위해 유지했다.

### 8. 최종 통합 검수 (완료)

- `prod/v1.0` 및 원격 작업 브랜치 대비 전체 변경 통계와 커밋 목적을 검토했다.
- 활성 API endpoint는 기존 문자열과 동일하며, 생성·수정·삭제·게임 진행 request payload 구성은 순수 함수 테스트로 기존 계약을 확인했다.
- Query Key는 기존 값을 유지한다. 유일한 의미 변경은 서로 다른 월드컵의 랭킹 캐시 공유를 막기 위해 랭킹 키에 월드컵 ID를 추가한 건이며 테스트로 고정했다.
- 게임 화면의 좌·우 선택 규칙과 애니메이션 방향, 미디어 렌더 속성, 관리 생성 폼의 입력·버튼·스타일이 추출 전과 동일함을 비교했다. 실제 UI에서는 주석 처리된 마크업만 제거됐다.
- 깨끗한 작업 트리에서 lint, typecheck, 강화된 미사용 검사, 55개 테스트, production build를 다시 실행해 모두 통과했다.
- 계획한 리팩터링과 최종 안전성 검수는 완료됐다. 원격 push는 사용자가 명시적으로 요청할 때만 진행한다.

## 작업 시 주의할 기존 동작

- Query Key 배열 값은 테스트로 고정되어 있다. 키 변경이 필요하면 캐시 영향과 테스트를 함께 검토한다.
- `mappingMediaFile`은 전달받은 항목 객체 자체를 갱신한다. 객체 참조 유지가 테스트에 포함되어 있다.
- 홈 목록 미디어 요청에서 왼쪽 Promise만 reject되면 오른쪽 응답이 왼쪽으로 이동하는 기존 동작이 테스트에 고정되어 있다. 이를 수정할 때는 타입 리팩터링과 분리한 버그 수정 커밋으로 진행한다.
- 관리 콘텐츠에서 `contentsId`가 없는 항목은 신규 목록, 있는 항목은 수정·삭제 목록으로 분기한다.
- `contentsId: 0`은 신규 콘텐츠 정규화 과정에서 `undefined`가 되는 기존 규칙이 테스트로 고정되어 있다.
- 관리 카드의 직접 저장 API 코드는 제거했으며, 실제 저장은 상위 wrapper가 목록을 모아 실행한다.
- 현재 UI 자동화 테스트는 없다. UI 구조를 변경하는 P3/P4 작업 전에는 핵심 사용자 흐름 테스트 도입 여부를 먼저 판단한다.

## 단계별 완료 체크리스트

```bash
git status --short --branch
git diff --check
npm run lint
npm run typecheck
npm test
npm run build
git diff
```

검증 후 하나의 목적만 담아 커밋하고 다음 영역으로 이동한다.
