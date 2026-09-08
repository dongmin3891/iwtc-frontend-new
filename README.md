# IWTC Frontend

사용자가 이상형 월드컵을 탐색하고 플레이하거나 직접 만들어 관리할 수 있는 웹 애플리케이션입니다. 이미지, MP4, YouTube 콘텐츠를 지원하며 게임 결과 순위와 댓글을 제공합니다.

현재 화면은 PC 환경을 대상으로 합니다. 모바일로 접속하면 PC 버전 이용 안내 화면이 표시됩니다.

## 주요 기능

- 공개된 이상형 월드컵 검색, 정렬 및 기간별 조회
- 참가 가능한 라운드 선택과 토너먼트 진행
- 이미지, MP4, YouTube 후보 콘텐츠 재생
- 게임 종료 후 1~4위 결과와 전체 랭킹 확인
- 결과 콘텐츠 댓글 조회 및 등록
- 회원가입, 로그인, 로그아웃 및 토큰 갱신
- 내 월드컵 생성, 조회 및 삭제
- 월드컵 후보 콘텐츠 생성, 수정 및 삭제

## 기술 구성

- Next.js 13 App Router
- React 18, TypeScript 5
- TanStack React Query 4
- Axios
- React Hook Form, Yup
- Tailwind CSS, TW Elements React
- React Spring
- Node.js `node:test`

## 시작하기

### 사전 준비

- Node.js 18 이상
- npm
- 월드컵 API와 회원 API 서버 주소

### 설치

```bash
git clone https://github.com/funnygameorg/iwtc-frontend.git
cd iwtc-frontend
npm ci
```

### 환경 변수

개발 실행은 `.env.development`, 프로덕션 빌드는 `.env.production`을 사용합니다. 각 환경 파일에 아래 값을 설정합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://example.com/
NEXT_PUBLIC_API_MEMBER_URL=https://member.example.com/
```

- 두 값 모두 API 경로인 `api/`가 붙기 전의 기본 URL입니다. URL 끝에 `/`를 포함합니다.
- 변수 이름에 `NEXT_PUBLIC_`이 있으므로 브라우저 번들에 포함됩니다. 비밀 키나 인증 정보를 저장하지 마세요.
- 일반 월드컵 요청은 `NEXT_PUBLIC_API_BASE_URL`, URL에 `member`가 포함된 회원 요청은 `NEXT_PUBLIC_API_MEMBER_URL`을 사용합니다.

### 인증 동작

- 로그인 성공 시 access token은 기존 API 호환을 위해 브라우저의 `ACCESS_TOKEN` 쿠키에 저장하고 요청의 `access-token` 헤더로 전송합니다.
- refresh token은 백엔드가 설정하는 HttpOnly 쿠키이므로 프론트 코드와 JavaScript에서 읽거나 저장하지 않습니다.
- access token이 만료되면 refresh 요청을 한 번만 실행하고 실패한 원래 요청을 재시도합니다. 여러 요청이 동시에 만료되어도 refresh 요청은 중복 실행하지 않습니다.
- 로그인과 회원가입의 401 응답은 자동 갱신 대상으로 처리하지 않습니다.
- 로그아웃은 `POST /api/members/sign-out`을 호출한 뒤 access token과 로컬 회원 정보를 정리합니다.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | `.env.development`로 개발 서버 실행 |
| `npm run prod` | `.env.production`으로 개발 서버 실행 |
| `npm run build` | `.env.production`으로 프로덕션 빌드 |
| `npm run build:prod` | 프로덕션 빌드 (`build`와 동일) |
| `npm run start` | 빌드 결과를 8080 포트에서 실행 |
| `npm run lint` | Next.js ESLint 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm test` | 테스트용 TypeScript 컴파일 후 전체 테스트 실행 |

프로덕션 빌드 실행 예시:

```bash
npm run build
npm run start
```

실행 주소는 [http://localhost:8080](http://localhost:8080)입니다.

## 주요 화면

| 경로 | 설명 | 로그인 |
| --- | --- | --- |
| `/` | 월드컵 목록, 검색, 정렬 및 기간 필터 | 불필요 |
| `/play-game/[id]` | 라운드 선택 및 월드컵 플레이 | 불필요 |
| `/play-clear/[...id]` | 게임 결과, 랭킹 및 댓글 | 불필요 |
| `/sign-in` | 로그인 | 불필요 |
| `/sign-up` | 회원가입 | 불필요 |
| `/manage` | 새 월드컵과 후보 콘텐츠 생성 | 필요 |
| `/manage/[id]` | 기존 월드컵 후보 콘텐츠 관리 | 필요 |
| `/members/[id]/games` | 내가 만든 월드컵 목록 | 필요 |

## 프로젝트 구조

```text
src/
├── app/                 # App Router 페이지와 전역 레이아웃
├── components/          # 화면 및 공통 UI 컴포넌트
├── domain/              # 게임·홈·관리 영역의 순수 로직
├── hooks/               # 화면 상태와 애니메이션 훅
├── interfaces/          # API 요청·응답 및 화면 모델
├── lib/react-query/     # Query Client와 Query Key
├── providers/           # 인증, 팝업, React Query 컨텍스트
├── services/            # Axios 기반 API 호출
├── stores/              # 브라우저 저장소 접근
└── utils/               # 토큰과 미디어 관련 공통 유틸리티
```

API 응답 타입은 `interfaces`에서 정의하고, 서버 요청은 `services`에 모읍니다. 화면에서 분리할 수 있는 계산과 데이터 변환은 `domain`의 순수 함수로 관리하며, React Query Key는 `src/lib/react-query/queryKeys.ts`에서 관리합니다.

## 검증

변경 후 아래 검사를 모두 실행합니다.

```bash
npm run lint
npm run typecheck
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
npm test
npm run build
```

현재 테스트 기준선은 55개 테스트, 21개 suite입니다. 별도의 테스트 프레임워크 없이 Node.js 내장 테스트 러너를 사용합니다.

린트에는 동적 data URL과 미디어 미리보기 동작을 유지하기 위한 `@next/next/no-img-element` 경고 3건이 남아 있습니다. 프로덕션 빌드에서 나오는 `caniuse-lite is outdated` 안내 역시 현재 알려진 경고입니다.

## 개발 시 주의사항

- API endpoint와 request/response 계약을 변경할 때는 서비스 타입과 관련 테스트를 함께 수정합니다.
- Query Key 변경은 캐시 공유와 무효화 범위에 영향을 주므로 `queryKeys.ts`와 테스트를 함께 확인합니다.
- 게임 후보 선택, 라운드 전환, 순위 누적 규칙은 `src/domain/game`의 테스트로 보호됩니다.
- 관리 콘텐츠의 생성·수정·삭제 요청 조합은 `src/domain/manage`의 테스트로 보호됩니다.
- 이미지와 영상은 API에서 받은 data URL을 직접 사용하는 경로가 있으므로 렌더링 방식을 바꿀 때 미디어별 동작을 확인합니다.
- 더 자세한 리팩터링 제약과 기존 동작은 [REFACTOR_HANDOFF.md](./REFACTOR_HANDOFF.md)를 참고하세요.
