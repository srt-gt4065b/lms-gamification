@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: LMS 게이미피케이션 플랫폼 빠른 설치 스크립트 (Windows)
:: 사용법: quick-start.bat 더블클릭

title LMS 게이미피케이션 플랫폼 설치

echo.
echo ========================================
echo   🎓 LMS 게이미피케이션 플랫폼 설치
echo ========================================
echo.

:: Node.js 확인
echo [1/7] Node.js 버전 확인 중...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 Node.js를 먼저 설치해주세요.
    pause
    exit /b 1
)

for /f "tokens=1" %%v in ('node -v') do set NODE_VERSION=%%v
echo ✅ Node.js %NODE_VERSION% 확인 완료
echo.

:: 프로젝트 폴더 생성
echo [2/7] 프로젝트 폴더 생성 중...
if not exist "lms-gamification" mkdir lms-gamification
cd lms-gamification
if not exist "backend" mkdir backend
echo ✅ 폴더 생성 완료
echo.

:: 백엔드 파일 확인
echo [3/7] 백엔드 파일 확인 중...
if not exist "backend\server.js" (
    echo ❌ backend\server.js 파일이 없습니다.
    echo.
    echo 제공된 파일들을 backend 폴더에 복사해주세요:
    echo   - server.js
    echo   - database_schema.sql
    echo   - package.json
    echo.
    pause
    exit /b 1
)
echo ✅ 파일 확인 완료
echo.

:: 백엔드 설치
echo [4/7] 백엔드 의존성 설치 중...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 백엔드 설치 실패
    pause
    exit /b 1
)
echo ✅ 백엔드 설치 완료
echo.

:: 데이터베이스 초기화
echo [5/7] 데이터베이스 초기화 중...
node -e "const fs=require('fs');const sqlite3=require('sqlite3').verbose();const db=new sqlite3.Database('./lms_gamification.db');const schema=fs.readFileSync('./database_schema.sql','utf8');db.exec(schema,(err)=>{if(err){console.error('DB 초기화 실패:',err);process.exit(1);}else{console.log('✅ 데이터베이스 초기화 완료');db.close();}});"
if %errorlevel% neq 0 (
    echo ❌ 데이터베이스 초기화 실패
    pause
    exit /b 1
)
echo.

:: 프론트엔드 설정
echo [6/7] 프론트엔드 설정 중...
cd ..
if not exist "frontend" (
    echo React 앱을 생성합니다 (시간이 걸릴 수 있습니다)...
    call npx create-react-app frontend
    if %errorlevel% neq 0 (
        echo ❌ 프론트엔드 생성 실패
        pause
        exit /b 1
    )
)
echo.

:: 완료 메시지
echo [7/7] 설치 완료!
echo.
echo ========================================
echo   ✅ 기본 설치가 완료되었습니다!
echo ========================================
echo.
echo 📝 다음 단계를 진행해주세요:
echo.
echo 1. 프론트엔드 파일 복사:
echo    다음 파일들을 frontend\src\ 폴더에 복사하세요:
echo    - App.jsx 를 App.js 로 복사
echo    - App.css
echo    - ProfilePage.jsx
echo    - ProfilePage.css
echo    - LeaderboardPage.jsx
echo    - LeaderboardPage.css
echo    - ChallengePage.jsx
echo    - ChallengePage.css
echo.
echo 2. 백엔드 서버 실행 (새 명령 프롬프트):
echo    cd lms-gamification\backend
echo    npm start
echo.
echo 3. 프론트엔드 앱 실행 (또 다른 새 명령 프롬프트):
echo    cd lms-gamification\frontend
echo    npm start
echo.
echo ========================================
echo   🎉 설치 완료! 즐거운 학습 되세요!
echo ========================================
echo.

:: 백엔드 자동 실행 옵션
echo.
set /p AUTO_START="백엔드 서버를 지금 실행하시겠습니까? (Y/N): "
if /i "%AUTO_START%"=="Y" (
    echo.
    echo 백엔드 서버를 시작합니다...
    cd backend
    start cmd /k "title LMS Backend Server && npm start"
    cd ..
    echo.
    echo 백엔드 서버가 새 창에서 실행되었습니다.
    echo 이제 frontend 폴더의 파일들을 복사한 후,
    echo 새 명령 프롬프트에서 frontend를 실행하세요.
)

echo.
pause
