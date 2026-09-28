# IWTC Frontend

IWTC는 공개된 후보 중 하나를 선택하며 우승자를 결정하는 이상형 월드컵 서비스입니다.

- 운영 주소: [https://iwtc.ddongmy.com](https://iwtc.ddongmy.com)
- 현재 기준 버전: `2.0.0`
- 데스크톱과 모바일을 지원하는 반응형 UI
- Next.js App Router 기반 프론트엔드와 서버 Route Handler 구성

## 운영 정책

IWTC의 월드컵과 후보는 운영자가 관리하는 자동화 경로로만 등록합니다. 일반 사용자에게 월드컵 생성, 수정, 삭제 또는 이미지 업로드 기능을 제공하지 않습니다.

이 정책은 임의 이미지 업로드에 따른 저작권, 출처, 신고 처리 및 저장 공간 악용 위험을 줄이기 위한 현재 운영 기준입니다. 기존 관리 화면과 관련 코드는 이전 데이터 관리와 점진적인 전환을 위해 일부 남아 있지만 공개 사용자 기능으로 간주하지 않습니다.

- 공개 사용자: 월드컵 탐색, 게임 플레이, 결과·랭킹 확인, 댓글 이용
- 운영 자동화: 월드컵과 후보 데이터 등록 및 관리
- 프론트엔드: 자동화 API의 인증 정보나 외부 콘텐츠 API 비밀 키를 포함하지 않음
- 백엔드: 자동화 요청의 인증과 콘텐츠 출처 데이터 검증 담당

## 주요 기능

- 공개 월드컵 검색, 정렬 및 기간별 조회
- 참가 라운드 선택과 고정 토너먼트 진행
- 이미지, MP4, YouTube 후보 콘텐츠 재생
- 선택 피드백, 진행률 표시와 반응형 전환 애니메이션
- 게임 종료 후 최종 결과와 누적 인기 순위 확인
- 결과 콘텐츠 댓글 조회 및 등록
- 회원가입, 로그인, 로그아웃과 토큰 갱신
- Pexels 이미지의 작가·사진 출처 링크 표시
- Cloudflare Analytics 기반 오늘·최근 7일 방문 통계

## 기술 구성

| 구분 | 기술 |
| --- | --- |
| Framework | Next.js 13 App Router, React 18, TypeScript 5 |
| Data | TanStack React Query 4, Axios |
| Form | React Hook Form, Yup |
| UI | Tailwind CSS, React Spring |
| Test | Node.js `node:test`, TypeScript |
| Container | Docker, GHCR |
| Deployment | Kubernetes, Traefik Ingress, GitHub Actions |

## 프로젝트 구조

```text
src/
├── app/                 # App Router 페이지와 서버 Route Handler
├── components/          # 화면 및 공통 UI 컴포넌트
├── domain/              # 게임·홈·관리 영역의 순수 로직
├── features/traffic/    # Cloudflare 방문 통계 서버 로직
├── hooks/               # 화면 상태와 애니메이션 훅
├── interfaces/          # API 요청·응답 및 화면 모델
├── lib/react-query/     # Query Client와 Query Key
├── providers/           # 인증, 팝업, React Query 컨텍스트
├── services/            # Axios 기반 API 호출
├── stores/              # 브라우저 저장소 접근
└── utils/               # 토큰과 미디어 관련 공통 유틸리티

.github/workflows/
└── deploy.yml           # 검증, 이미지 빌드·푸시, 배포 이미지 태그 갱신

k8s/
├── deployment.yaml
├── service.yaml
├── ingress.yaml
└── certificate.yaml
```

## 로컬 개발

### 요구 사항

- Node.js 20 이상
- npm
- 실행 가능한 IWTC 백엔드 API

### 설치 및 실행

```bash
git clone https://github.com/dongmin3891/iwtc-frontend-new.git
cd iwtc-frontend-new
npm ci
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

### 환경 변수

개발 서버는 `.env.development`, 프로덕션 빌드는 `.env.production`을 사용합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/
NEXT_PUBLIC_API_MEMBER_URL=http://localhost:3001/
```

- 두 값은 `api/`가 붙기 전의 기본 URL이며 마지막 `/`를 포함합니다.
- `NEXT_PUBLIC_` 변수는 브라우저 번들에 포함되므로 비밀 값을 넣지 않습니다.

방문 통계 Route Handler를 사용하려면 서버 실행 환경에 다음 값을 설정합니다.

```dotenv
CLOUDFLARE_ANALYTICS_API_TOKEN=...
CLOUDFLARE_ZONE_ID=...
```

- 두 값에는 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.
- 토큰은 Cloudflare Analytics 읽기 전용 권한만 사용합니다.
- 값이 없거나 조회에 실패하면 방문 통계 UI는 표시되지 않습니다.

## 주요 경로

| 경로 | 설명 | 로그인 |
| --- | --- | --- |
| `/` | 월드컵 목록, 검색, 정렬 및 기간 필터 | 불필요 |
| `/play-game/[id]` | 라운드 선택 및 월드컵 플레이 | 불필요 |
| `/play-clear/[...id]` | 게임 결과, 랭킹 및 댓글 | 불필요 |
| `/sign-in` | 로그인 | 불필요 |
| `/sign-up` | 회원가입 | 불필요 |
| `/updates` | 저장소의 `CHANGELOG.md`로 생성되는 서비스 업데이트 | 불필요 |
| `/api/health` | Kubernetes 상태 확인 | 불필요 |
| `/api/traffic` | 서버 전용 Cloudflare 방문 통계 중계 | 불필요 |

`/manage`, `/manage/[id]`, `/members/[id]/games`는 공개 사용자 기능이 아닙니다. 자동화가 사용하는 백엔드 API와 프론트엔드의 레거시 관리 코드를 동일한 기능으로 해석하지 않습니다.

## 인증 동작

- 로그인 성공 시 access token은 기존 API 호환을 위해 브라우저의 `ACCESS_TOKEN` 쿠키에 저장하고 `access-token` 요청 헤더로 전송합니다.
- refresh token은 백엔드가 설정하는 HttpOnly 쿠키이므로 프론트엔드 JavaScript에서 읽거나 저장하지 않습니다.
- access token 만료 시 refresh 요청을 한 번만 실행하고 실패했던 요청을 재시도합니다.
- 로그인과 회원가입의 401 응답은 자동 갱신 대상으로 처리하지 않습니다.
- 로그아웃 후 access token과 로컬 회원 정보를 정리합니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | `.env.development`로 개발 서버 실행 |
| `npm run prod` | `.env.production`으로 개발 서버 실행 |
| `npm run build` | `.env.production`으로 프로덕션 빌드 |
| `npm run start` | 빌드 결과를 8080 포트에서 실행 |
| `npm run lint` | Next.js ESLint 검사 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm test` | 테스트용 TypeScript 컴파일 후 전체 테스트 실행 |

## 검증

변경 후 다음 검사를 모두 실행합니다.

```bash
npm run lint
npm run typecheck
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
npm test
npm run build
```

현재 기준선은 85개 테스트, 29개 suite입니다. 관리 화면 미리보기의 기존 `<img>` 린트 경고 2건과 Browserslist 데이터 갱신 안내가 남아 있습니다.

## 배포

`refactor/full-project` 브랜치의 애플리케이션 변경이 push되면 GitHub Actions가 다음 작업을 수행합니다.

1. 타입 검사, 테스트, 린트와 프로덕션 빌드
2. Docker 이미지 빌드
3. GHCR에 `latest`와 commit SHA 태그 push
4. `k8s/deployment.yaml`의 이미지 태그 갱신
5. 변경된 배포 매니페스트를 저장소에 commit

Kubernetes 리소스는 `iwtc` namespace에서 실행되며 Traefik Ingress를 통해 `iwtc.ddongmy.com`을 제공합니다. Cloudflare 방문 통계용 Secret 이름은 `web-app-cloudflare`입니다.

## 버전과 패치노트

`2.0.0`을 현재 운영 방향의 새 기준 버전으로 사용합니다. 사용자 제작 중심의 이전 버전 번호는 더 이상 이어서 해석하지 않습니다.

버전 변경 시 아래 값을 함께 갱신합니다.

- `package.json`
- `package-lock.json`의 루트 패키지 버전
- `src/consts/Version.ts`

기존 Notion 패치노트 대신 저장소의 `CHANGELOG.md`를 사용합니다. 빌드 시 `/updates` 정적 페이지로 생성되며 헤더의 `업데이트` 링크에서 확인할 수 있습니다.

## 개발 시 주의사항

- 일반 사용자용 생성·수정·이미지 업로드 UI를 다시 노출하지 않습니다.
- 자동화 인증 정보, Cloudflare Token과 외부 API 비밀 키를 클라이언트 코드에 넣지 않습니다.
- API 계약을 변경할 때 서비스 타입과 관련 테스트를 함께 수정합니다.
- 게임 후보 선택, 고정 대진, 진행률 및 순위 누적 규칙은 `src/domain/game` 테스트로 보호합니다.
- Pexels 출처 필드는 이미지와 함께 유지하고 공개 화면에서 작가·사진 링크를 표시합니다.
- 상세한 변경 이력과 남은 운영 검증은 [REFACTOR_HANDOFF.md](./REFACTOR_HANDOFF.md)를 참고합니다.
