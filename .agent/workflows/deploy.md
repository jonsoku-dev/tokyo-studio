# 배포 워크플로우 (Deploy Workflow)

## 1. 로컬 배포 (Docker Local)
로컬 개발 환경을 Docker로 구성하는 방법입니다.

### 요구사항
*   Docker & Docker Compose 설치.

### 실행 (Run)
```bash
# 전체 서비스 실행 (App + DB + Redis)
docker-compose up --build

# 백그라운드 실행
docker-compose up -d
```

### 디버깅
*   로그 확인: `docker-compose logs -f web`
*   컨테이너 쉘 접속: `docker-compose exec web /bin/sh`

## 2. 프로덕션 배포 (Production Deploy)
React Router v7 앱을 Docker 이미지로 빌드하여 배포합니다.

### Dockerfile (Multi-stage Build)
1.  **Base**: `node:20-alpine` (또는 프로젝트 버전).
2.  **Dependencies**: `pnpm install --prod=false` (빌드 도구 포함).
3.  **Build**: `pnpm build` (RRv7 빌드 -> `build/` 생성).
4.  **Runner**:
    *   `pnpm install --prod` (런타임 의존성만).
    *   `build/` 카피.
    *   `CMD ["pnpm", "start"]` (React Router 서버 실행).

### 주의사항
*   **환경변수**: 프로덕션에서는 `.env` 파일 대신 CI/CD 파이프라인이나 컨테이너 오케스트레이터(K8s, ECS)에서 주입해야 합니다.
*   **DB 마이그레이션**: 배포 파이프라인에서 앱 실행 직전에 `drizzle-kit migrate`를 수행하는 잡(Job)을 별도로 두는 것을 권장합니다.
