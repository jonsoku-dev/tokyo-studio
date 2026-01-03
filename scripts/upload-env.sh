#!/bin/bash

# Vercel 환경변수 업로드 스크립트
# 사용법: ./scripts/upload-env.sh <project> <environment> <env-file>
# 예시: ./scripts/upload-env.sh web production web/.env

set -e

# Ensure VERCEL environment variable is set for the build process (if local) or context
export VERCEL=1

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 도움말
show_help() {
    echo ""
    echo "📦 Vercel 환경변수 업로드 스크립트"
    echo ""
    echo "사용법:"
    echo "  ./scripts/upload-env.sh <project> <environment> [env-file]"
    echo ""
    echo "인자:"
    echo "  project      - 프로젝트 이름 (web 또는 admin)"
    echo "  environment  - 환경 (production, preview, development)"
    echo "  env-file     - .env 파일 경로 (선택, 기본값: <project>/.env)"
    echo ""
    echo "예시:"
    echo "  ./scripts/upload-env.sh web production"
    echo "  ./scripts/upload-env.sh admin production admin/.env.local"
    echo ""
}

# 인자 확인
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}❌ 오류: project와 environment는 필수입니다.${NC}"
    show_help
    exit 1
fi

PROJECT=$1
ENVIRONMENT=$2
ENV_FILE=${3:-"$PROJECT/.env"}

# 프로젝트 유효성 검사
if [ "$PROJECT" != "web" ] && [ "$PROJECT" != "admin" ]; then
    echo -e "${RED}❌ 오류: project는 'web' 또는 'admin'이어야 합니다.${NC}"
    exit 1
fi

# 환경 유효성 검사
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "preview" ] && [ "$ENVIRONMENT" != "development" ]; then
    echo -e "${RED}❌ 오류: environment는 'production', 'preview', 또는 'development'이어야 합니다.${NC}"
    exit 1
fi

# .env 파일 존재 확인
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ 오류: $ENV_FILE 파일이 존재하지 않습니다.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Vercel 환경변수 업로드${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "프로젝트: ${GREEN}$PROJECT${NC}"
echo -e "환경: ${GREEN}$ENVIRONMENT${NC}"
echo -e "파일: ${GREEN}$ENV_FILE${NC}"
echo ""

# 디렉토리 이동
cd "$PROJECT"

# 업로드할 변수 미리보기
echo -e "${YELLOW}📋 업로드할 환경변수:${NC}"
echo ""

count=0
while IFS= read -r line || [ -n "$line" ]; do
    # 빈 줄과 주석 무시
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # KEY=VALUE 형식인지 확인
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        # 공백 제거
        key=$(echo "$key" | xargs)
        echo "  - $key"
        ((count++))
    fi
done < "../$ENV_FILE"

echo ""
echo -e "총 ${GREEN}$count${NC}개의 환경변수"
echo ""

# 확인
read -p "계속하시겠습니까? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo -e "${YELLOW}취소되었습니다.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🚀 업로드 시작...${NC}"
echo ""

# 환경변수 업로드
success=0
failed=0

while IFS= read -r line || [ -n "$line" ]; do
    # 빈 줄과 주석 무시
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    
    # KEY=VALUE 형식인지 확인
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # 공백 제거
        key=$(echo "$key" | xargs)
        
        # 따옴표 제거 (있는 경우)
        value="${value#\"}"
        value="${value%\"}"
        value="${value#\'}"
        value="${value%\'}"
        
        echo -n "  $key ... "
        
        # 기존 변수 삭제 (오류 무시)
        vercel env rm "$key" "$ENVIRONMENT" -y 2>/dev/null || true
        
        # 새 변수 추가
        if echo "$value" | vercel env add "$key" "$ENVIRONMENT" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            ((success++))
        else
            echo -e "${RED}✗${NC}"
            ((failed++))
        fi
    fi
done < "../$ENV_FILE"

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✓ 성공: $success${NC}"
if [ $failed -gt 0 ]; then
    echo -e "${RED}✗ 실패: $failed${NC}"
fi
echo ""
echo -e "${GREEN}🎉 완료!${NC}"
echo ""
