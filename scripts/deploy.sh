#!/bin/bash

# Vercel Deployment Scripts for pnpm Monorepo
# Usage: ./scripts/deploy.sh [web|admin|all] [--preview]

set -e

# Ensure VERCEL environment variable is set for the build process (if local) or context
export VERCEL=1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project mappings
WEB_PROJECT="tokyo-studio-web"
ADMIN_PROJECT="tokyo-studio-admin"

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

deploy_project() {
    local project_name=$1
    local prod_flag=$2
    
    log_info "Linking to project: $project_name"
    cd "$ROOT_DIR"
    vercel link --yes --project "$project_name"
    
    log_info "Deploying $project_name..."
    if [ "$prod_flag" = "--prod" ]; then
        vercel --prod
    else
        vercel
    fi
    
    log_info "✅ $project_name deployment complete!"
}

deploy_web() {
    local prod_flag=$1
    log_info "🌐 Deploying Web..."
    deploy_project "$WEB_PROJECT" "$prod_flag"
}

deploy_admin() {
    local prod_flag=$1
    log_info "🔧 Deploying Admin..."
    deploy_project "$ADMIN_PROJECT" "$prod_flag"
}

show_usage() {
    echo "Usage: $0 [web|admin|all] [--preview]"
    echo ""
    echo "Commands:"
    echo "  web      Deploy web app only"
    echo "  admin    Deploy admin app only"
    echo "  all      Deploy both web and admin"
    echo ""
    echo "Options:"
    echo "  --preview    Deploy to preview environment (default: production)"
    echo ""
    echo "Examples:"
    echo "  $0 web              # Deploy web to production"
    echo "  $0 admin --preview  # Deploy admin to preview"
    echo "  $0 all              # Deploy both to production"
}

# Parse arguments
TARGET="${1:-}"
PROD_FLAG="--prod"

if [ "$2" = "--preview" ]; then
    PROD_FLAG=""
    log_info "📦 Deploying to PREVIEW environment"
else
    log_info "🚀 Deploying to PRODUCTION environment"
fi

case "$TARGET" in
    web)
        deploy_web "$PROD_FLAG"
        ;;
    admin)
        deploy_admin "$PROD_FLAG"
        ;;
    all)
        deploy_web "$PROD_FLAG"
        echo ""
        deploy_admin "$PROD_FLAG"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

log_info "🎉 Deployment complete!"
