// 내 페이지 - 삼성헬스 스타일
import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

function ProfilePage({ userId }) {
    const [userData, setUserData] = useState(null);
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchStatistics();
    }, [userId]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}/statistics?period=week`);
            const data = await response.json();
            setStatistics(data);
            setLoading(false);
        } catch (error) {
            console.error('통계 조회 실패:', error);
            setLoading(false);
        }
    };

    if (loading || !userData) {
        return <div className="loading">로딩중...</div>;
    }

    // 다음 레벨까지 필요한 XP 계산
    const nextLevelXP = (userData.level + 1) * 500;
    const currentLevelXP = userData.level * 500;
    const progressXP = userData.total_xp - currentLevelXP;
    const progressPercent = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

    return (
        <div className="profile-page">
            {/* 헤더 */}
            <div className="header">
                <h1>내 페이지</h1>
            </div>

            {/* 프로필 카드 */}
            <div className="profile-card">
                <div className="profile-image-container">
                    <img 
                        src={userData.profile_image || '/default-avatar.png'} 
                        alt="프로필" 
                        className="profile-image"
                    />
                    <div className="level-badge">🏃</div>
                </div>

                <h2 className="profile-name">{userData.name}</h2>
                
                <div className="profile-stats">
                    <div className="stat-item">
                        <span className="stat-label">리더 레벨{userData.level}</span>
                        <span className="stat-value">{userData.total_xp}/{nextLevelXP} XP</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="btn-secondary">
                        친구 <span className="count">{userData.friend_count}명</span>
                    </button>
                    <button className="btn-secondary">내 QR 코드</button>
                    <button className="btn-primary">편집</button>
                </div>
            </div>

            {/* 헬스 데이터 공유 섹션 (수정) */}
            <div className="data-share-section">
                <h3>학습 데이터 공유</h3>
                <p>저장된 학습 데이터를 가족이나 친구와 안전하게 공유하세요.</p>
            </div>

            {/* 주별 분석 */}
            <div className="weekly-analysis">
                <h3>주별 분석</h3>
                <p className="date-range">
                    {statistics.length > 0 
                        ? `${statistics[0].date} - ${statistics[statistics.length - 1].date}`
                        : '데이터 없음'}
                </p>

                <div className="weekly-stats">
                    <div className="stat-box">
                        <div className="stat-icon">📚</div>
                        <div className="stat-info">
                            <div className="stat-title">총 학습 시간</div>
                            <div className="stat-number">
                                {statistics.reduce((sum, day) => sum + (day.activity_count * 15), 0)}분
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-box">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-info">
                            <div className="stat-title">평균 일일 XP</div>
                            <div className="stat-number">
                                {Math.round(statistics.reduce((sum, day) => sum + day.daily_xp, 0) / 7)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 일별 그래프 */}
                <div className="daily-chart">
                    {statistics.map((day, index) => {
                        const maxXP = Math.max(...statistics.map(d => d.daily_xp));
                        const height = (day.daily_xp / maxXP) * 100;
                        const date = new Date(day.date);
                        const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
                        
                        return (
                            <div key={index} className="chart-bar-container">
                                <div className="chart-bar" style={{ height: `${height}%` }}>
                                    <span className="xp-value">{day.daily_xp}</span>
                                </div>
                                <div className="chart-label">{dayName}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
