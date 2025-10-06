// 순위판 페이지 - 삼성헬스 걸음 순위 스타일
import React, { useState, useEffect } from 'react';
import './LeaderboardPage.css';

function LeaderboardPage({ currentUserId }) {
    const [leaderboardType, setLeaderboardType] = useState('friends'); // 'friends' or 'all'
    const [rankings, setRankings] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [leaderboardType, currentUserId]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/leaderboard/${currentUserId}?type=${leaderboardType}`
            );
            const data = await response.json();
            
            setRankings(data);
            
            // 내 순위 찾기
            const myRanking = data.find(user => user.user_id === currentUserId);
            setMyRank(myRanking);
            
            setLoading(false);
        } catch (error) {
            console.error('순위 조회 실패:', error);
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    const getMedalColor = (rank) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return 'normal';
    };

    if (loading) {
        return <div className="loading">로딩중...</div>;
    }

    return (
        <div className="leaderboard-page">
            {/* 탭 전환 */}
            <div className="tabs">
                <button 
                    className={`tab ${leaderboardType === 'friends' ? 'active' : ''}`}
                    onClick={() => setLeaderboardType('friends')}
                >
                    순위판
                </button>
                <button 
                    className={`tab ${leaderboardType === 'all' ? 'active' : ''}`}
                    onClick={() => setLeaderboardType('all')}
                >
                    친구
                </button>
            </div>

            {/* 최종 업데이트 시간 */}
            <div className="last-update">
                마지막 업데이트 오후 {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}
            </div>

            {/* 내 순위 표시 */}
            {myRank && (
                <div className="my-rank-card">
                    <h3>순위: {myRank.rank}위</h3>
                    <p className="rank-message">
                        {myRank.rank === 1 
                            ? '우와! 친구들 중에서 일등입니다.' 
                            : '친구들과 함께 더 열심히 학습해보세요!'}
                    </p>
                    
                    {/* 상위 5명 미니 차트 */}
                    <div className="top-mini-chart">
                        {rankings.slice(0, 5).map((user, index) => (
                            <div key={user.user_id} className="mini-chart-item">
                                <div className="mini-avatar">
                                    <img src={user.profile_image || '/default-avatar.png'} alt={user.name} />
                                    {user.user_id === currentUserId && <div className="highlight-badge">나</div>}
                                </div>
                                <div className="mini-name">{user.name.substring(0, 6)}</div>
                                <div className={`mini-bar rank-${index + 1}`}>
                                    <span className="rank-number">{index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 전체 순위 리스트 */}
            <div className="ranking-list">
                {rankings.map((user, index) => {
                    const isCurrentUser = user.user_id === currentUserId;
                    const rankIcon = getRankIcon(user.rank);
                    const medalClass = getMedalColor(user.rank);
                    
                    return (
                        <div 
                            key={user.user_id} 
                            className={`ranking-item ${isCurrentUser ? 'current-user' : ''} ${medalClass}`}
                        >
                            {/* 순위 */}
                            <div className="rank-number">
                                {rankIcon || user.rank}
                            </div>
                            
                            {/* 프로필 이미지 */}
                            <div className="user-avatar">
                                <img src={user.profile_image || '/default-avatar.png'} alt={user.name} />
                                {isCurrentUser && <div className="current-badge">나</div>}
                            </div>
                            
                            {/* 사용자 정보 */}
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-level">Lv. {user.level}</div>
                            </div>
                            
                            {/* XP */}
                            <div className="user-xp">
                                <span className="xp-value">{user.total_xp.toLocaleString()}</span>
                                <span className="xp-label">XP</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 빈 상태 */}
            {rankings.length === 0 && (
                <div className="empty-state">
                    <p>🎯 친구를 추가하고 함께 학습해보세요!</p>
                </div>
            )}
        </div>
    );
}

export default LeaderboardPage;
