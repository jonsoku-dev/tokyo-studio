# House Ads Seed Data Summary

## 📊 Statistics (v2.0)

**Total Ads: 24**
- Feed Placement: 17 ads
- Sidebar Placement: 6 ads
- Inline Placement: 1 ad

## 🗂️ Categories

### Platform Services (11 ads)
1. **Mentoring** - Feed & Sidebar
   - 1:1 멘토링으로 일본 취업 성공
2. **Settlement** - Feed & Sidebar
   - 일본 정착 체크리스트
3. **Community** - Feed
   - 일본 IT 개발자 커뮤니티
4. **Japanese Learning** - Feed & Sidebar
   - 비즈니스 일본어 마스터
5. **Housing** - Feed
   - 일본 주거 매칭 서비스
6. **Tech Meetup** - Feed
   - 도쿄 IT 개발자 밋업
7. **Bootcamp** - Feed
   - 3개월 완성 - 일본 기업 기술 스택
8. **Interview Prep** - Feed
   - 일본 기업 면접 완벽 대비
9. **Life Tips** - Feed
   - 일본 생활 꿀팁 200선
10. **Salary Guide** - Feed
    - 연봉 협상 전략
11. **Visa Consulting** - Feed
    - 일본 취업비자 완벽 가이드

### Corporate Hiring (7 ads)
1. **Mercari** - Feed & Sidebar
   - Backend Engineer (Go, K8s, Microservices)
2. **Rakuten** - Feed
   - Frontend Engineer (React, TypeScript, AWS)
3. **LINE** - Feed & Sidebar
   - Full Stack Developer (Node.js, Kotlin, Spring Boot)
4. **CyberAgent** - Feed
   - DevOps Engineer (Docker, K8s, Terraform)
5. **DeNA** - Feed
   - Game Backend Engineer (Unity, C#, PostgreSQL)

### Generic Platform (3 ads - Text Only)
1. Welcome Message
2. Pipeline Feature
3. Roadmap Feature

## 📍 Placement Distribution

### Feed (feed-top, feed-middle, feed-bottom)
- **Images Used**: 16 different images
- **Targeting**: 
  - Categories: community, dashboard, pipeline, settlement
  - Pages: explore, home, roadmap, detail

### Sidebar
- **Images Used**: 5 different images
- **Targeting**:
  - Categories: community, dashboard
  - Pages: detail, home

### Inline
- **Images Used**: 0 (text-only)
- **Targeting**:
  - Categories: community
  - Pages: explore, detail

## 🎯 Targeting Strategy

### By Category
- **community**: 14 ads (Most targeted)
- **dashboard**: 9 ads
- **settlement**: 4 ads
- **pipeline**: 3 ads

### By Page
- **explore**: 10 ads
- **detail**: 11 ads
- **home**: 7 ads
- **roadmap**: 4 ads

### Weight Distribution
- **Weight 5**: 4 ads (Highest priority - Mercari, Rakuten, Mentor)
- **Weight 4**: 7 ads
- **Weight 3**: 7 ads
- **Weight 2**: 6 ads (Lowest priority)

## 🖼️ Image Assets Used

### Feed Images (1280×720, 16:9)
```
/images/ads/feed/
├── mentor.png
├── settlement.png
├── community.png
├── japanese-learning.png
├── tech-meetup.png
├── interview-prep.png
├── mercari.png
├── rakuten.png
├── line.png
├── housing_search_ad_*_feed.png
├── skill_bootcamp_ad_*_16-9.png
├── life_tips_ad_*_16-9.png
├── salary_negotiation_ad_*_16-9.png
├── visa_immigration_ad_*_16-9.png
├── cyberagent_hiring_*_16-9.png
└── dena_hiring_*_16-9.png
```

### Sidebar Images (500×500, 1:1)
```
/images/ads/sidebar/
├── mentor.png
├── settlement.png
├── japanese-learning.png
├── mercari.png
└── line.png
```

## 🔄 Rotation Logic

Ads are selected based on:
1. **Placement match** (feed-middle, sidebar, etc.)
2. **Category targeting** (community, dashboard, etc.)
3. **Page targeting** (explore, detail, home, roadmap)
4. **Weight** (higher weight = higher probability)

### Example Scenarios

**Scenario 1**: User on `/communities` page
- Eligible ads: All "community" category ads
- Weighted random selection from ~14 ads

**Scenario 2**: User on community detail page (e.g., `/communities/tech-react`)
- Feed ads: Platform services + Corporate hiring (11 ads)
- Sidebar ads: Mentor, Mercari, LINE, etc. (6 ads total)

**Scenario 3**: User on `/dashboard`
- Feed ads: Mentor, Interview Prep, Bootcamp, etc.
- Focus on career development services

## 📈 Next Steps

1. **A/B Testing**: Track CTR for each ad
2. **Admin Panel**: Build UI to manage ads
3. **Analytics**: Integrate impression/click tracking
4. **Dynamic Pricing**: Add CPM/CPC models for paid ads
5. **Frequency Capping**: Prevent ad fatigue

## 🛠️ Maintenance

To add new ads:
```typescript
// 1. Add image to /public/images/ads/feed or /sidebar
// 2. Update seeds/house-ads.ts
// 3. Run: pnpm run db:seed
```

To modify existing ads:
```sql
-- Update via SQL or re-run seed with new values
UPDATE house_ads SET weight = 5 WHERE id = 'ad000000-...';
```

---

**Last Updated**: 2026-01-02  
**Version**: 2.0 (Major expansion - 24 ads)
