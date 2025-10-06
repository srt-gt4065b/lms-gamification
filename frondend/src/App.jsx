// 메인 App 컴포넌트
import React, { useState } from 'react';
import ProfilePage from './ProfilePage';
import LeaderboardPage from './LeaderboardPage';
import ChallengePage from './ChallengePage';
import './App.css';

function App() {
    const [currentPage, setCurrentPage] = useState('profile');
    const [currentUserId] = useState(1); // 실제로는 로그인 시스템에서 가져옴

    const renderPage = () => {
        switch(currentPage) {
            case 'profile':
                return <ProfilePage userId={currentUserId} />;
            case 'leaderboard':
                return <LeaderboardPage currentUserId={currentUserId} />;
            case 'challenge':
                return <ChallengePage userId={currentUserId} courseId="CS101" />;
            default:
                return <ProfilePage userId={currentUserId} />;
        }
    };

    return (
        <div className="app">
            <div className="app-container">
                {/* 메인 콘텐츠 */}
                <main className="main-content">
                    {renderPage()}
                </main>

                {/* 하단 네비게이션 바 */}
                <nav className="bottom-nav">
                    <button 
                        className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('profile')}
                    >
                        <span className="nav-icon">🏠</span>
                        <span className="nav-label">홈</span>
                    </button>

                    <button 
                        className={`nav-item ${currentPage === 'challenge' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('challenge')}
                    >
                        <span className="nav-icon">🎯</span>
                        <span className="nav-label">투게더</span>
                    </button>

                    <button 
                        className={`nav-item ${currentPage === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('leaderboard')}
                    >
                        <span className="nav-icon">🏆</span>
                        <span className="nav-label">발견</span>
                    </button>

                    <button 
                        className={`nav-item ${currentPage === 'fitness' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('fitness')}
                    >
                        <span className="nav-icon">💪</span>
                        <span className="nav-label">피트니스</span>
                    </button>

                    <button 
                        className={`nav-item ${currentPage === 'mypage' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('mypage')}
                    >
                        <span className="nav-icon">👤</span>
                        <span className="nav-label">내 페이지</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default App;
