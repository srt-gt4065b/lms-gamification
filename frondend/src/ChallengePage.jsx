// 도전과제 페이지 - 삼성헬스 투게더 스타일
import React, { useState, useEffect } from 'react';
import './ChallengePage.css';

function ChallengePage({ userId, courseId = 'CS101' }) {
    const [challenges, setChallenges] = useState([]);
    const [myChallenges, setMyChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState('available'); // 'available' or 'mine'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
        fetchMyChallenges();
    }, [courseId]);

    const fetchChallenges = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/challenges?courseId=${courseId}&isActive=1`
            );
            const data = await response.json();
            setChallenges(data);
            setLoading(false);
        } catch (error) {
            console.error('도전과제 조회 실패:', error);
            setLoading(false);
        }
    };

    const fetchMyChallenges = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/users/${userId}/challenges`
            );
            const data = await response.json();
            setMyChallenges(data);
        } catch (error) {
            console.error('내 도전과제 조회 실패:', error);
        }
    };

    const joinChallenge = async (challengeId) => {
        try {
            const response = await fetch(
                `http://localhost:3000/api/challenges/${challengeId}/join`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                }
            );
            
            if (response.ok) {
                alert('도전과제에 참여했습니다!');
                fetchChallenges();
                fetchMyChallenges();
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (error) {
            console.error('도전 참여 실패:', error);
            alert('도전 참여에 실패했습니다.');
        }
    };

    const getChallengeIcon = (type) => {
        const icons = {
            'streak': '🔥',
            'weekly': '📅',
            'course': '📚',
            'daily': '⭐'
        };
        return icons[type] || '🎯';
    };

    const getProgressPercent = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    if (loading) {
        return <div className="loading">로딩중...</div>;
    }

    return (
        <div className="challenge-page">
            {/* 헤더 */}
            <div className="header">
                <h1>투게더</h1>
                <button className="info-btn">ℹ️</button>
            </div>

            {/* 배너 */}
            <div className="challenge-banner">
                <div className="banner-content">
                    <h2>바오패밀리와 함께 출석체크 가을 운동회 달리기 1등은 누구?</h2>
                    <p>바오패밀리와 함께 달리며 10월 캘린더를 완성...</p>
                </div>
                <div className="banner-image">
                    <img src="/panda-mascot.png" alt="마스코트" />
                </div>
            </div>

            {/* 건강 분야 관심 섹션 */}
            <div className="interest-section">
                <h3>어떤 건강 분야에 관심이 있나요?</h3>
                <p>이제 내 관심사에 맞게 삼성 헬스를 최적화하고 도움이 되는 인사이트를 받아보세요.</p>
                <button className="btn-select-interest">관심사 선택</button>
            </div>

            {/* 탭 */}
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'available' ? 'active' : ''}`}
                    onClick={() => setActiveTab('available')}
                >
                    참여 가능한 도전
                </button>
                <button 
                    className={`tab ${activeTab === 'mine' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mine')}
                >
                    내 도전 ({myChallenges.length})
                </button>
            </div>

            {/* 도전과제 리스트 */}
            {activeTab === 'available' ? (
                <div className="challenge-list">
                    {challenges.map(challenge => {
                        const alreadyJoined = myChallenges.some(
                            mc => mc.challenge_id === challenge.challenge_id
                        );
                        
                        return (
                            <div key={challenge.challenge_id} className="challenge-card">
                                <div className="challenge-icon">
                                    {getChallengeIcon(challenge.challenge_type)}
                                </div>
                                
                                <div className="challenge-content">
                                    <h4>{challenge.title}</h4>
                                    <p className="challenge-description">{challenge.description}</p>
                                    
                                    <div className="challenge-meta">
                                        <span className="challenge-period">
                                            {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
                                        </span>
                                        <span className="challenge-reward">
                                            보상: {challenge.reward_xp} XP
                                        </span>
                                    </div>
                                    
                                    <div className="challenge-participants">
                                        <span>👥 참여자 {challenge.participant_count}명</span>
                                    </div>
                                </div>
                                
                                <div className="challenge-action">
                                    {alreadyJoined ? (
                                        <button className="btn-joined" disabled>
                                            참여중
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn-join"
                                            onClick={() => joinChallenge(challenge.challenge_id)}
                                        >
                                            참여하기
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {challenges.length === 0 && (
                        <div className="empty-state">
                            <p>현재 참여 가능한 도전이 없습니다.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="my-challenge-list">
                    {myChallenges.map(challenge => {
                        const progressPercent = getProgressPercent(
                            challenge.current_progress, 
                            challenge.target_value
                        );
                        
                        return (
                            <div 
                                key={challenge.challenge_id} 
                                className={`my-challenge-card ${challenge.is_completed ? 'completed' : ''}`}
                            >
                                <div className="challenge-icon">
                                    {challenge.is_completed ? '✅' : getChallengeIcon(challenge.challenge_type)}
                                </div>
                                
                                <div className="challenge-content">
                                    <h4>{challenge.title}</h4>
                                    
                                    <div className="progress-container">
                                        <div className="progress-text">
                                            <span>{challenge.current_progress} / {challenge.target_value}</span>
                                            <span className="progress-percent">{Math.round(progressPercent)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    {challenge.is_completed ? (
                                        <div className="completion-badge">
                                            🎉 완료! {challenge.reward_xp} XP 획득
                                        </div>
                                    ) : (
                                        <div className="challenge-status">
                                            {challenge.target_value - challenge.current_progress}회 남음
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {myChallenges.length === 0 && (
                        <div className="empty-state">
                            <p>참여중인 도전이 없습니다.</p>
                            <button 
                                className="btn-primary"
                                onClick={() => setActiveTab('available')}
                            >
                                도전 찾아보기
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 추천 도전 섹션 (삼성헬스 스타일) */}
            <div className="recommended-section">
                <h3>삼성 헬스 X 쥬라기파크 런 챌린지</h3>
                <p>도전에 참여했습니다.</p>
                <div className="recommended-card">
                    <img src="/jurassic-park-challenge.png" alt="쥬라기파크 런" />
                    <div className="recommended-info">
                        <h4>참여자</h4>
                        <p className="participant-count">67,421명</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChallengePage;
