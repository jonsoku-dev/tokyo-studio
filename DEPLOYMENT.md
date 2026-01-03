# Vercel 배포 가이드

이 문서는 GitHub Actions를 사용하여 `web`과 `admin` 앱을 Vercel에 배포하는 방법을 설명합니다.

---

## 📋 사전 요구사항

- **Node.js**: v22.17.1
- **pnpm**: 10.4.1
- **Vercel CLI**: `brew install vercel-cli`

---

## 🔧 초기 설정

### 1. Vercel 프로젝트 연결

각 앱 디렉토리에서 Vercel 프로젝트를 생성하고 연결합니다.

```bash
# Web 앱 연결
cd web
vercel link

# Admin 앱 연결
cd ../admin
vercel link
```

> [!NOTE]
> `vercel link` 실행 시 Vercel 로그인이 필요합니다. 브라우저가 열리면 로그인을 완료해주세요.

### 2. 프로젝트 ID 확인

연결 완료 후 각 디렉토리에 `.vercel/project.json` 파일이 생성됩니다:

```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxx"
}
```

---

## 🔐 GitHub Secrets 설정

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름 | 설명 | 확인 방법 |
|------------|------|----------|
| `VERCEL_TOKEN` | Vercel API 인증 토큰 | [Vercel Token 페이지](https://vercel.com/account/tokens)에서 생성 |
| `VERCEL_ORG_ID` | 조직/팀 ID | `web/.vercel/project.json`의 `orgId` 값 |
| `VERCEL_WEB_PROJECT_ID` | Web 프로젝트 ID | `web/.vercel/project.json`의 `projectId` 값 |
| `VERCEL_ADMIN_PROJECT_ID` | Admin 프로젝트 ID | `admin/.vercel/project.json`의 `projectId` 값 |

### Vercel Token 생성 방법

1. [Vercel Dashboard](https://vercel.com/account/tokens) 접속
2. **Create** 버튼 클릭
3. Token 이름 입력 (예: `github-actions`)
4. Scope: **Full Account** 선택
5. **Create Token** 클릭 후 토큰 복사

> [!CAUTION]
> 토큰은 한 번만 표시됩니다. 반드시 안전한 곳에 저장해두세요.

---

## 📁 워크플로우 파일 구조

```
.github/
└── workflows/
    ├── deploy-web.yml    # Web 앱 배포
    └── deploy-admin.yml  # Admin 앱 배포
```

---

## 🚀 배포 방법

### 자동 배포 (Push 트리거)

`main` 브랜치에 push하면 변경된 앱만 자동 배포됩니다.

| 변경된 경로 | 배포되는 앱 |
|------------|-----------|
| `web/**` | Web |
| `admin/**` | Admin |
| `packages/**` | Web + Admin |
| `pnpm-lock.yaml` | Web + Admin |

### 수동 배포 (Manual Trigger)

1. GitHub 저장소 → **Actions** 탭
2. 원하는 워크플로우 선택 (`Deploy Web to Vercel` 또는 `Deploy Admin to Vercel`)
3. **Run workflow** 버튼 클릭
4. 배포 환경 선택:
   - `preview`: 미리보기 환경
   - `production`: 프로덕션 환경
5. **Run workflow** 실행

---

## 🗄️ Vercel PostgreSQL 설정

### Vercel Storage에서 PostgreSQL 생성

1. [Vercel Dashboard](https://vercel.com) 접속
2. 해당 프로젝트(tokyo-studio-web) 선택
3. **Storage** 탭 클릭
4. **Create Database** → **Postgres** 선택
5. 데이터베이스 이름 입력 (예: `tokyo-studio-db`)
6. Region 선택 (Tokyo - ap-northeast-1 권장)
7. **Create** 클릭

### 환경 변수 자동 연결

Vercel PostgreSQL을 생성하면 다음 환경 변수가 자동으로 프로젝트에 추가됩니다:

| 변수명 | 설명 |
|--------|------|
| `POSTGRES_URL` | 풀링된 연결 URL (serverless 권장) |
| `POSTGRES_URL_NON_POOLING` | 직접 연결 URL |
| `POSTGRES_USER` | 데이터베이스 사용자 |
| `POSTGRES_PASSWORD` | 데이터베이스 비밀번호 |
| `POSTGRES_DATABASE` | 데이터베이스 이름 |
| `POSTGRES_HOST` | 호스트 주소 |

### DATABASE_URL 환경 변수 설정

우리 앱은 `DATABASE_URL`을 사용하므로 수동으로 추가해야 합니다:

1. **Settings** → **Environment Variables**
2. **Add New** 클릭
3. Key: `DATABASE_URL`
4. Value: `POSTGRES_URL`의 값 복사하여 붙여넣기
5. Environment: **Production**, **Preview** 모두 선택
6. **Save** 클릭

> [!TIP]
> `POSTGRES_URL`을 사용하면 Connection Pooling이 적용되어 serverless 환경에 최적화됩니다.

### Admin 프로젝트에 데이터베이스 연결

Admin 프로젝트도 같은 DB를 사용하려면:

1. Admin 프로젝트(tokyo-studio-admin) 선택
2. **Storage** 탭 → **Connect Store**
3. 생성한 PostgreSQL 선택
4. 동일하게 `DATABASE_URL` 환경 변수 추가

### 스키마 마이그레이션 (처음 배포 시)

로컬에서 Vercel PostgreSQL에 스키마를 푸시합니다:

```bash
# 1. Vercel 환경변수 가져오기
cd web
vercel env pull .env.production

# 2. 환경변수 로드하여 스키마 푸시
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) pnpm db:push

# 3. .env.production 파일 삭제 (보안)
rm .env.production
```

또는 직접 연결:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require" pnpm db:push
```

> [!CAUTION]
> Vercel PostgreSQL은 SSL이 필수입니다. 연결 URL에 `?sslmode=require`가 포함되어 있는지 확인하세요.

---

## 🌍 환경 변수 설정

Vercel 프로젝트에 필요한 환경 변수를 설정해야 합니다.

### Vercel Dashboard에서 설정

1. [Vercel Dashboard](https://vercel.com) 접속
2. 해당 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 필요한 환경 변수 추가

### 필수 환경 변수

| 변수명 | 설명 | 환경 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | Production, Preview |
| `SESSION_SECRET` | 세션 암호화 키 (32자 이상 랜덤 문자열) | Production, Preview |
| `NODE_ENV` | 환경 구분 (`production`) | Production |

### OAuth 환경 변수 (소셜 로그인 사용 시)

| 변수명 | 설명 |
|--------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret |

> [!IMPORTANT]
> OAuth 콜백 URL을 Vercel 도메인으로 업데이트해야 합니다.
> 예: `https://tokyo-studio-web.vercel.app/api/auth/google/callback`

---

## 🔍 배포 상태 확인

### GitHub Actions에서 확인

1. GitHub 저장소 → **Actions** 탭
2. 최근 워크플로우 실행 기록 확인
3. 각 단계별 로그 확인 가능

### Vercel Dashboard에서 확인

1. [Vercel Dashboard](https://vercel.com) 접속
2. 해당 프로젝트 선택
3. **Deployments** 탭에서 배포 기록 확인

---

## ⚙️ 워크플로우 상세 설명

### deploy-web.yml

```yaml
name: Deploy Web to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'web/**'
      - 'packages/**'
      - 'pnpm-lock.yaml'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        type: choice
        options:
          - preview
          - production
```

**주요 단계:**
1. 코드 체크아웃
2. pnpm 10.4.1 설정
3. Node.js 22.17.1 설정
4. Vercel CLI 설치
5. 환경 정보 가져오기
6. 의존성 설치
7. 빌드 및 배포

---

## 🛠️ 트러블슈팅

### 빌드 실패 시

```bash
# 로컬에서 빌드 테스트
cd web
pnpm install
pnpm build
```

### Vercel 연결 문제

```bash
# 프로젝트 재연결
cd web
rm -rf .vercel
vercel link
```

### pnpm 버전 불일치

```bash
# 정확한 버전 설치
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

---

## 📚 참고 링크

- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [pnpm Monorepo 가이드](https://pnpm.io/workspaces)
