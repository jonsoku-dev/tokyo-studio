# 도쿄 지도 통합 (SPEC 020)

## 개요

신규 정착자를 위한 대화형 도쿄 지도. 구청, 은행, 이민국, 이동통신사, 주택 지역, 편의점 등 필수 위치를 지도에서 확인하고 길안내를 받을 수 있습니다.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 지도 라이브러리 | Google Maps API v3 |
| 상태 관리 | Zustand |
| 데이터 관리 | Drizzle ORM + PostgreSQL |
| UI 프레임워크 | React + TailwindCSS |

## 주요 기능

### P1 (초기 출시)
- ✅ 지도 표시 (도쿄 중심)
- ✅ 마커 카테고리 (정부, 은행, 이민, 이동통신, 주택, 쇼핑)
- ✅ 다국어 지원 (영/일/한)
- ✅ 카테고리 필터링 (복수 선택)
- ✅ 위치 검색 + 자동완성
- ✅ 마커 클러스터링
- ✅ 길안내 (Google Maps 연동)
- ✅ 모바일 최적화

### P2 (2차 개선)
- 🔄 즐겨찾기 (인증 필요)
- 🔄 커스텀 마커 (사용자 추가)
- 🔄 주소 클립보드 복사

### P3 (향후)
- ⏳ 도쿄 외 지역 지원
- ⏳ 위치 신고 기능

## 파일 구조

```
features/map/
├── apis/
│   ├── api.map.locations.ts       # 위치 조회/검색 로직
│   ├── api.map.get.ts             # P1 API 엔드포인트
│   ├── api.favorites.ts           # 즐겨찾기 로직
│   ├── api.favorites.get.ts       # 즐겨찾기 API 엔드포인트
│   ├── api.custom-markers.ts      # 커스텀 마커 로직
│   └── api.custom-markers.get.ts  # 커스텀 마커 API 엔드포인트
├── components/
│   ├── Map.client.tsx             # Google Maps 통합
│   ├── MapControls.client.tsx     # 필터/검색 UI
│   ├── LocationPopup.tsx          # 마커 정보 팝업
│   └── MapPage.client.tsx         # 페이지 메인 컴포넌트
├── store/
│   └── map.store.ts               # Zustand 상태 관리
├── routes/
│   └── index.tsx                  # 페이지 라우트
└── scripts/
    └── seed-locations.ts          # 시드 데이터
```

## 설정

### 1. 환경 변수 설정

`.env` 파일에 Google Maps API 키를 추가하세요:

```env
VITE_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

**API 키 생성:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. "Maps JavaScript API" 활성화
4. API 키 생성
5. 키 제한: HTTP referrer, 도메인 지정

**필요 API:**
- Maps JavaScript API
- Distance Matrix API (길안내 옵션)

### 2. 데이터베이스 스키마

스키마는 자동으로 적용됩니다:

```sql
-- 위치 데이터
CREATE TABLE map_locations (
  id UUID PRIMARY KEY,
  category TEXT,              -- government|immigration|banking|mobile|housing|shopping
  name_en/ja/ko TEXT,
  address TEXT,
  latitude/longitude NUMERIC,
  phone TEXT,
  hours TEXT,
  station TEXT,
  area TEXT,                  -- tokyo (기본값)
  is_verified BOOLEAN,
  created_at/updated_at TIMESTAMP
);

-- 즐겨찾기
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  location_id UUID REFERENCES map_locations,
  created_at TIMESTAMP
);

-- 커스텀 마커
CREATE TABLE custom_markers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  name TEXT,
  category TEXT,
  latitude/longitude NUMERIC,
  notes TEXT,
  created_at/updated_at TIMESTAMP
);
```

### 3. 시드 데이터 로드

초기 위치 데이터를 로드하려면:

```bash
pnpm tsx app/features/map/scripts/seed-locations.ts
```

이렇게 하면 도쿄의 주요 기관 15개가 자동으로 추가됩니다.

## 사용 방법

### 페이지 접속

```
/map
```

### API 엔드포인트

#### 위치 조회
```
GET /api/map?categories=government,banking&search=shibuya&area=tokyo
```

**쿼리 파라미터:**
- `categories` (optional): 카테고리 필터 (쉼표로 구분)
- `search` (optional): 위치명/주소 검색어
- `area` (default: tokyo): 지역
- `suggest=true` (optional): 자동완성 모드

#### 즐겨찾기
```
GET /api/map/favorites                  # 조회
POST /api/map/favorites                 # 추가 { locationId }
DELETE /api/map/favorites               # 삭제 { locationId }
```

#### 커스텀 마커
```
GET /api/map/custom-markers             # 조회
POST /api/map/custom-markers            # 생성 { name, category, latitude, longitude, notes }
PUT /api/map/custom-markers             # 수정 { id, ...fields }
DELETE /api/map/custom-markers          # 삭제 { id }
```

## 상태 관리

### Zustand Store (map.store.ts)

```typescript
// 위치 데이터
locations: MapLocationData[]            // 필터링된 위치들
isLoading: boolean
error: string | null

// 필터 상태
selectedCategories: Set<string>         // 선택된 카테고리
searchQuery: string

// 선택 상태
selectedLocationId: string | null       // 클릭한 마커

// 자동완성
suggestions: Array<{id, name, category}>
showSuggestions: boolean
```

**사용 예:**

```typescript
import { useMapStore } from "../store/map.store";

function MyComponent() {
  const { locations, selectedCategories, toggleCategory } = useMapStore();

  return (
    <div>
      {locations.map(loc => (
        <div key={loc.id}>{loc.nameEn}</div>
      ))}
      <button onClick={() => toggleCategory("banking")}>
        필터: 은행
      </button>
    </div>
  );
}
```

## 성능 최적화

### 1. API 캐싱
- 위치 데이터: 5분 캐시 (`Cache-Control: max-age=300`)
- 요청 최소화: 클라이언트 사이드 필터링

### 2. 마커 렌더링
- 클러스터링: 동일 영역 마커를 그룹으로 표시
- 가상화: 스크롤 시 필요한 마커만 렌더
- 이미지 최적화: 아이콘 SVG 포맷

### 3. 검색 성능
- 자동완성: 3자 이상만 요청
- 클라이언트 사이드 인덱싱 가능

## 모바일 최적화

- 터치 제스처: 핀치-줌, 스와이프
- 반응형: 모바일/태블릿/데스크톱
- 하단 드로어: 필터 패널 모바일 레이아웃
- 터치 친화: 44px 이상 탭 영역

## 개발 팁

### 1. 새로운 마커 카테고리 추가

`LocationPopup.tsx`의 `CATEGORY_NAMES`에 추가:
```typescript
const CATEGORY_NAMES = {
  mynewcategory: { en: "...", ja: "...", ko: "..." },
};
```

### 2. 데이터 마이그레이션

```bash
# 새 위치 추가
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 3. 디버깅

브라우저 콘솔에서:
```javascript
// Zustand 상태 확인
window.store?.getState?.()

// 지도 객체 확인
window.googleMap
```

## 주의사항

### useEffect 최소화
- 지도 초기화: 1회만 실행 (empty dependency)
- 필터/검색: Zustand 상태 변경으로 처리
- 부수 효과 최소화

### 타입 안전성
- 모든 numeric은 `Number()` 변환 필요 (DB numeric 타입)
- 좌표는 `latitude: number`, `longitude: number`

### 에러 처리
- Google Maps API 실패 시 폴백 (정적 지도)
- 네트워크 오류 재시도 로직
- 권한 거부 시 대체 기능 제공

## 트러블슈팅

### Google Maps 로드 실패
```
원인: API 키 없음/유효하지 않음
해결: .env에 VITE_GOOGLE_MAPS_API_KEY 설정 확인
```

### 마커 안 나타남
```
원인: 좌표 유형 오류
해결: latitude/longitude을 Number()로 변환
```

### 검색 느림
```
원인: 대규모 데이터셋
해결: 클라이언트 사이드 인덱싱 추가, DB 쿼리 최적화
```

## 참고자료

- [Google Maps Platform Docs](https://developers.google.com/maps/documentation)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Drizzle ORM](https://orm.drizzle.team/)
