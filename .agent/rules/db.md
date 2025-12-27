# 데이터베이스 규칙 (Database Rules)

## 기술 스택
*   **엔진**: PostgreSQL (로컬: Docker, 배포: Neon/AWS RDS).
*   **ORM**: **Drizzle ORM** (v0.30+).
*   **Driver**: `node-postgres` (`pg`).
*   **Migrations**: `drizzle-kit`.

## 1. 설치 및 설정 (Setup)

### 패키지 설치
```bash
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

### 환경 변수 (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### 설정 파일 (drizzle.config.ts)
루트 디렉토리에 위치합니다.
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/shared/db/schema.ts", // 스키마 위치
  out: "./drizzle",                    // 마이그레이션 파일 위치
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### DB 연결 (Client)
`app/shared/db/client.server.ts` 위치 (반드시 `.server.ts` 확장자 사용).
```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
```

## 2. 스키마 관리 (Schema Definition)
스키마는 `app/shared/db/schema.ts`에 정의합니다.

```typescript
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## 3. 마이그레이션 워크플로우 (Migrations)
스키마 변경 시 다음 절차를 따릅니다. **수동 SQL 작성을 지양합니다.**

1.  `app/shared/db/schema.ts` 수정.
2.  마이그레이션 생성:
    ```bash
    npx drizzle-kit generate
    ```
3.  마이그레이션 적용:
    ```bash
    npx drizzle-kit migrate
    ```
4.  (선택) 스튜디오 실행:
    ```bash
    npx drizzle-kit studio
    ```

## 4. React Router v7 연동 규칙 (Framework Mode)
*   **Server-Side Only**: DB 연결 및 쿼리는 **반드시** `loader` 또는 `action` 내부에서만 실행되어야 합니다.
*   **File Separation**: DB 클라이언트 파일은 `*.server.ts` 확장자를 사용하여 클라이언트 번들에 포함되지 않도록 강제합니다.
*   **Connection Pooling**: `node-postgres`의 `Pool`을 사용하여 연결을 관리합니다. Serverless 환경(Vercel 등) 배포 시에는 `Neon HTTP` 드라이버 등으로 교체해야 할 수 있습니다(배포 단계에서 고려).

## 5. Docker 개발 환경
로컬 개발 시 `docker-compose.yml`을 통해 DB를 실행합니다.
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: itcom_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```
