# 🎓 LMS 게이미피케이션 플랫폼 - 프로젝트 개요

## 📖 목차
- [프로젝트 소개](#프로젝트-소개)
- [핵심 기능](#핵심-기능)
- [기술 스택](#기술-스택)
- [파일 구조](#파일-구조)
- [데이터베이스 구조](#데이터베이스-구조)
- [API 설계](#api-설계)
- [다음 개발 단계](#다음-개발-단계)

---

## 프로젝트 소개

삼성헬스의 게이미피케이션 UX를 교육 분야에 적용한 **학습 관리 시스템(LMS)**입니다.

### 🎯 목표
- 학생들의 **능동적 학습 참여** 유도
- **친구들과 함께하는 재미있는 학습** 경험 제공
- 교수자의 **학생 이해도 파악 및 맞춤형 피드백** 지원

### 💡 핵심 컨셉
> "학습을 게임처럼 재미있게!"

삼성헬스의 걸음 수, 순위, 도전 시스템을 학습 활동(출석, 퀴즈, 과제)에 적용

---

## 핵심 기능

### 1. 📊 학습 포인트(XP) 시스템
- **활동별 XP 획득**
  - 출석: 50 XP
  - 퀴즈: 100 XP
  - 과제: 200 XP
  - 토론 참여: 75 XP
  
- **레벨 시스템**
  - XP 누적으로 자동 레벨업
  - Lv. 1 ~ Lv. 100+
  - 레벨별 뱃지 획득

### 2. 🏆 실시간 순위판
- **전체 순위**: 전체 학생 대상
- **친구 순위**: 친구들과의 경쟁
- **실시간 업데이트**: 활동 즉시 반영
- **시각화**: 삼성헬스 스타일의 그래프

### 3. 🎯 도전과제 시스템
- **도전 유형**
  - 일일 도전 (Daily)
  - 주간 도전 (Weekly)
  - 과목별 도전 (Course)
  
- **참여 및 보상**
  - 도전 참여/완료
  - 보상 XP 지급
  - 진행률 추적

### 4. 👥 소셜 기능
- **친구 시스템**
  - QR 코드로 친구 추가
  - 친구 활동 확인
  - 친구 순위 비교

### 5. 📈 학습 분석
- **개인 통계**
  - 주간/월간 학습 시간
  - 평균 일일 XP
  - 활동 패턴 분석
  
- **교수자 대시보드** (향후 개발)
  - 학급 전체 현황
  - 학생별 이해도
  - 맞춤형 피드백

---

## 기술 스택

### Backend
```
- Node.js v18+ (서버 런타임)
- Express v4.18 (웹 프레임워크)
- SQLite3 v5.1 (데이터베이스)
- CORS (Cross-Origin 지원)
```

### Frontend
```
- React v18.2 (UI 프레임워크)
- CSS3 (스타일링)
- Fetch API (백엔드 통신)
```

### 향후 확장
```
- Socket.io (실시간 알림)
- OpenAI API (AI 맞춤형 학습)
- React Native (모바일 앱)
- PostgreSQL (대규모 DB)
- Redis (캐싱/순위 처리)
```

---

## 파일 구조

### 📁 전체 구조
```
lms-gamification/
├── 📂 backend/                    # 백엔드 서버
│   ├── server.js                 # 메인 서버 (Express)
│   ├── database_schema.sql       # DB 스키마
│   ├── package.json              # 의존성 관리
│   └── lms_gamification.db       # SQLite DB (자동생성)
│
├── 📂 frontend/                   # 프론트엔드 앱
│   ├── 📂 public/
│   ├── 📂 src/
│   │   ├── App.js               # 메인 앱
│   │   ├── App.css
│   │   ├── ProfilePage.jsx      # 프로필 페이지
│   │   ├── ProfilePage.css
│   │   ├── LeaderboardPage.jsx  # 순위판
│   │   ├── LeaderboardPage.css
│   │   ├── ChallengePage.jsx    # 도전과제
│   │   └── ChallengePage.css
│   └── package.json
│
├── README.md                     # 설치 가이드
├── quick-start.sh               # Linux/Mac 자동설치
└── quick-start.bat              # Windows 자동설치
```

### 📝 주요 파일 설명

| 파일 | 역할 | 주요 내용 |
|------|------|-----------|
| `server.js` | 백엔드 API 서버 | 10개 REST API 엔드포인트 |
| `database_schema.sql` | DB 스키마 | 7개 테이블 + 뷰 + 샘플 데이터 |
| `App.js` | 메인 앱 컴포넌트 | 페이지 라우팅, 네비게이션 |
| `ProfilePage.jsx` | 프로필 화면 | 레벨, XP, 통계 표시 |
| `LeaderboardPage.jsx` | 순위판 화면 | 전체/친구 순위 |
| `ChallengePage.jsx` | 도전과제 화면 | 참여 가능/진행중 도전 |

---

## 데이터베이스 구조

### 📊 ERD (Entity Relationship Diagram)

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    users    │────1:N──│ learning_        │         │ challenges  │
│             │         │ activities       │         │             │
│ * user_id   │         │                  │         │* challenge_ │
│   name      │         │ * activity_id    │         │  id         │
│   email     │         │   user_id (FK)   │         │  title      │
│   total_xp  │         │   course_id      │         │  type       │
│   level     │         │   activity_type  │         │  reward_xp  │
└─────────────┘         │   xp_earned      │         └─────────────┘
       │                │   details        │                │
       │                └──────────────────┘                │
       │                                                     │
       │                ┌──────────────────┐                │
       └────────1:N─────│ user_challenges  │────N:1─────────┘
                        │                  │
                        │* user_challenge_ │
                        │  id              │
                        │  user_id (FK)    │
                        │  challenge_id    │
                        │  (FK)            │
                        │  progress        │
                        │  is_completed    │
                        └──────────────────┘
```

### 🗃️ 주요 테이블

#### 1. users (사용자)
```sql
- user_id: 사용자 고유 ID
- student_id: 학번
- name: 이름
- email: 이메일
- total_xp: 총 획득 XP
- level: 현재 레벨
```

#### 2. learning_activities (학습 활동)
```sql
- activity_id: 활동 고유 ID
- user_id: 사용자 ID (FK)
- course_id: 과목 ID
- activity_type: 활동 유형
  (attendance/quiz/assignment/discussion)
- xp_earned: 획득 XP
- details: 상세 정보 (JSON)
```

#### 3. challenges (도전과제)
```sql
- challenge_id: 도전 고유 ID
- title: 제목
- description: 설명
- challenge_type: 유형 (daily/weekly/course)
- target_value: 목표 값
- reward_xp: 보상 XP
- start_date / end_date: 기간
```

#### 4. user_challenges (사용자 도전)
```sql
- user_challenge_id: 고유 ID
- user_id: 사용자 ID (FK)
- challenge_id: 도전 ID (FK)
- current_progress: 현재 진행도
- is_completed: 완료 여부
```

---

## API 설계

### 🔌 REST API 엔드포인트

#### 사용자 관리
```
GET    /api/users/:userId
       → 사용자 정보 조회

POST   /api/users/:userId/check-badges
       → 뱃지 획득 체크
```

#### 학습 활동
```
POST   /api/activities
       → 학습 활동 기록 (XP 획득)
       Body: {
         userId, courseId, activityType, 
         xpEarned, details
       }

GET    /api/users/:userId/statistics?period=week
       → 학습 통계 조회
```

#### 순위
```
GET    /api/leaderboard/:userId?type=all|friends
       → 순위판 조회
       - all: 전체 순위
       - friends: 친구 순위
```

#### 도전과제
```
GET    /api/challenges?courseId=CS101&isActive=1
       → 도전과제 목록

POST   /api/challenges/:challengeId/join
       → 도전 참여
       Body: { userId }

GET    /api/users/:userId/challenges
       → 내 도전과제
```

#### 친구
```
POST   /api/friends
       → 친구 추가
       Body: { userId, friendId }

GET    /api/users/:userId/friends
       → 친구 목록
```

### 📡 API 응답 예시

**사용자 정보 조회**
```json
{
  "user_id": 1,
  "name": "김철수",
  "email": "kim@university.ac.kr",
  "total_xp": 114092,
  "level": 37,
  "friend_count": 429
}
```

**순위판 조회**
```json
[
  {
    "rank": 1,
    "user_id": 1,
    "name": "김철수",
    "total_xp": 114092,
    "level": 37
  },
  {
    "rank": 2,
    "user_id": 2,
    "name": "이영희",
    "total_xp": 83696,
    "level": 28
  }
]
```

---

## 다음 개발 단계

### Phase 1: 핵심 기능 안정화 (현재)
- ✅ 학습 포인트 시스템
- ✅ 레벨 & 프로필
- ✅ 순위판
- ✅ 도전과제
- 🔄 버그 수정 및 최적화

### Phase 2: AI 통합 (예정)
- 🔲 OpenAI API 연동
- 🔲 개인별 맞춤 문제 생성
- 🔲 학습 패턴 분석
- 🔲 AI 학습 도우미

### Phase 3: 실시간 기능 (예정)
- 🔲 Socket.io 통합
- 🔲 실시간 알림
- 🔲 라이브 순위 업데이트
- 🔲 친구 활동 피드

### Phase 4: 교수자 도구 (예정)
- 🔲 교수자 대시보드
- 🔲 학급 분석 리포트
- 🔲 맞춤형 과제 생성
- 🔲 학생별 피드백 시스템

### Phase 5: 모바일 앱 (예정)
- 🔲 React Native 포팅
- 🔲 푸시 알림
- 🔲 오프라인 지원
- 🔲 앱스토어 배포

### Phase 6: 고급 기능 (예정)
- 🔲 그룹 스터디룸
- 🔲 화상 학습
- 🔲 AR/VR 학습 콘텐츠
- 🔲 블록체인 학위 인증

---

## 🚀 시작하기

### 빠른 설치

**Mac / Linux:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

**Windows:**
```
quick-start.bat 더블클릭
```

### 수동 설치

상세한 설치 방법은 [README.md](README.md)를 참고하세요.

---

## 📚 참고 자료

### 학습 자료
- [React 공식 문서](https://react.dev)
- [Node.js 가이드](https://nodejs.org/docs)
- [Express 튜토리얼](https://expressjs.com)
- [SQLite 문서](https://www.sqlite.org/docs.html)

### 디자인 영감
- 삼성헬스 앱 UX
- Duolingo 게이미피케이션
- Khan Academy 학습 시스템

---

## 🎯 프로젝트 비전

> "모든 학생이 즐겁게 배우고,  
> 모든 교수자가 효과적으로 가르치는 세상"

이 플랫폼은 단순한 LMS를 넘어,  
**학습의 즐거움**을 재발견하게 하는  
혁신적인 교육 도구입니다.

---

## 📞 문의 및 기여

- 이슈 제보: GitHub Issues
- 기능 제안: Discussions
- 기여 가이드: CONTRIBUTING.md

---

**함께 만들어가는 교육의 미래! 🌟**

Made with ❤️ for Education
