#!/bin/bash

# LMS 게이미피케이션 플랫폼 빠른 설치 스크립트
# 사용법: chmod +x quick-start.sh && ./quick-start.sh

echo "🎓 LMS 게이미피케이션 플랫폼 설치를 시작합니다..."
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Node.js 확인
echo -e "${BLUE}[1/7]${NC} Node.js 버전 확인 중..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    echo "https://nodejs.org 에서 Node.js를 먼저 설치해주세요."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js 버전이 너무 낮습니다 (현재: v$(node -v), 필요: v16+)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) 확인 완료${NC}"
echo ""

# 프로젝트 폴더 생성
echo -e "${BLUE}[2/7]${NC} 프로젝트 폴더 생성 중..."
mkdir -p lms-gamification/backend
cd lms-gamification

# 백엔드 파일 복사 확인
echo -e "${BLUE}[3/7]${NC} 백엔드 파일 확인 중..."
if [ ! -f "backend/server.js" ]; then
    echo -e "${RED}❌ backend/server.js 파일이 없습니다.${NC}"
    echo "제공된 파일들을 backend 폴더에 복사해주세요:"
    echo "  - server.js"
    echo "  - database_schema.sql"
    echo "  - package.json"
    exit 1
fi

# 백엔드 설치
echo -e "${BLUE}[4/7]${NC} 백엔드 의존성 설치 중..."
cd backend
npm install
echo -e "${GREEN}✅ 백엔드 설치 완료${NC}"
echo ""

# 데이터베이스 초기화
echo -e "${BLUE}[5/7]${NC} 데이터베이스 초기화 중..."
node -e "
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lms_gamification.db');
const schema = fs.readFileSync('./database_schema.sql', 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('데이터베이스 초기화 실패:', err);
        process.exit(1);
    } else {
        console.log('✅ 데이터베이스 초기화 완료');
        db.close();
    }
});
"
echo ""

# 프론트엔드 설정
echo -e "${BLUE}[6/7]${NC} 프론트엔드 설정 중..."
cd ..

if [ ! -d "frontend" ]; then
    echo "React 앱을 생성합니다 (시간이 걸릴 수 있습니다)..."
    npx create-react-app frontend --template minimal
fi

# 프론트엔드 파일 복사 안내
echo -e "${BLUE}[7/7]${NC} 프론트엔드 파일 설정..."
echo ""
echo -e "${GREEN}✅ 기본 설치가 완료되었습니다!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📝 다음 단계를 진행해주세요:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 프론트엔드 파일 복사:"
echo "   다음 파일들을 frontend/src/ 폴더에 복사하세요:"
echo "   - App.jsx → App.js"
echo "   - App.css"
echo "   - ProfilePage.jsx"
echo "   - ProfilePage.css"
echo "   - LeaderboardPage.jsx"
echo "   - LeaderboardPage.css"
echo "   - ChallengePage.jsx"
echo "   - ChallengePage.css"
echo ""
echo "2. 백엔드 서버 실행 (새 터미널):"
echo "   cd lms-gamification/backend"
echo "   npm start"
echo ""
echo "3. 프론트엔드 앱 실행 (또 다른 새 터미널):"
echo "   cd lms-gamification/frontend"
echo "   npm start"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 설치 완료! 즐거운 학습 되세요!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
