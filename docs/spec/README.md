# Specification Commands for Japan IT Job Platform

이 디렉토리에는 개발해야 할 모든 기능의 `/speckit.specify` 명령어가 포함되어 있습니다.

## 사용 방법

1. 각 `.txt` 파일을 열고 내용을 복사합니다
2. 터미널에서 해당 명령어를 실행합니다
3. SpecKit이 자동으로 `/specs/[feature-name]/spec.md`를 생성합니다
4. 생성된 spec을 리뷰하고 필요시 수정합니다
5. `/speckit.plan`으로 구현 계획을 수립합니다

## 우선순위별 실행 순서

### 🔴 Phase 1 - High Priority (즉시 시작)

**인증 & 프로필**
1. `01-oauth-social-login.txt` - Google/GitHub 소셜 로그인
2. `02-email-verification.txt` - 이메일 인증
3. `03-password-reset.txt` - 비밀번호 재설정
4. `04-profile-avatar-upload.txt` - 프로필 사진 업로드
5. `05-public-profile-pages.txt` - 공개 프로필 페이지

**파일 스토리지**
6. `06-s3-file-storage.txt` - S3 클라우드 스토리지
7. `07-document-management-ui.txt` - 문서 관리 UI & PDF 뷰어

**커뮤니티 고급 기능**
8. `08-community-threaded-comments.txt` - 중첩 댓글 시스템
9. `09-community-image-upload.txt` - 이미지 업로드
10. `10-community-search.txt` - 전체 텍스트 검색
11. `11-community-voting-system.txt` - 투표 시스템 (upvote/downvote)

### 🟡 Phase 2 - Medium Priority (Phase 1 완료 후)

**멘토링 고급 기능**
12. `12-mentor-booking-system.txt` - 멘토 예약 시스템
13. `13-mentor-video-links.txt` - 비디오 링크 자동 생성
14. `14-mentor-review-system.txt` - 리뷰 시스템
15. `15-mentor-application.txt` - 멘토 신청 워크플로우

**커리어 도구**
16. `16-roadmap-diagnosis-integration.txt` - 로드맵 & 진단 통합
17. `17-calendar-sync.txt` - Google Calendar 동기화
18. `18-pipeline-og-parser.txt` - 채용공고 URL 파싱

### 🟢 Phase 3 - Low Priority (Phase 2 완료 후)

**도쿄 정착 가이드**
19. `19-tokyo-settlement-checklist.txt` - 정착 체크리스트
20. `20-tokyo-map-integration.txt` - 지도 통합

**인프라**
21. `21-seo-optimization.txt` - SEO 최적화
22. `22-push-notifications.txt` - 푸시 알림

## 빠른 실행 (Phase 1만)

```bash
# 1. OAuth 소셜 로그인
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/01-oauth-social-login.txt

# 2. 이메일 인증
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/02-email-verification.txt

# 3. 비밀번호 재설정
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/03-password-reset.txt

# 4. 프로필 사진 업로드
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/04-profile-avatar-upload.txt

# 5. 공개 프로필 페이지
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/05-public-profile-pages.txt

# 6. S3 파일 스토리지
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/06-s3-file-storage.txt

# 7. 문서 관리 UI
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/07-document-management-ui.txt

# 8. 중첩 댓글
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/08-community-threaded-comments.txt

# 9. 이미지 업로드
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/09-community-image-upload.txt

# 10. 전체 검색
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/10-community-search.txt

# 11. 투표 시스템
cat /Users/jongseoklee/Documents/GitHub/itcom/docs/spec/11-community-voting-system.txt
```

## 참고사항

- 모든 spec은 **Constitution v1.2.0**의 5가지 원칙을 준수합니다
- Spec에서는 **"what/why"**만 설명하고, 기술 스택은 plan 단계에서 결정됩니다
- **Test-First Development** 원칙에 따라 모든 spec에 테스트 시나리오가 포함됩니다
- 각 기능은 독립적으로 개발/테스트/배포 가능하도록 설계되었습니다

## Constitution 참조

자세한 개발 기준은 다음을 참조하세요:
- `/Users/jongseoklee/Documents/GitHub/itcom/.specify/memory/constitution.md`
