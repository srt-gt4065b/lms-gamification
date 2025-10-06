// LMS 게이미피케이션 플랫폼 - 백엔드 서버
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 데이터베이스 연결
const db = new sqlite3.Database('./lms_gamification.db', (err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err);
    } else {
        console.log('✅ 데이터베이스 연결 성공');
        initializeDatabase();
    }
});

// 데이터베이스 초기화
function initializeDatabase() {
    const fs = require('fs');
    const schema = fs.readFileSync('./database_schema.sql', 'utf8');
    
    db.exec(schema, (err) => {
        if (err) {
            console.error('스키마 생성 실패:', err);
        } else {
            console.log('✅ 데이터베이스 스키마 초기화 완료');
        }
    });
}

// ==================== API 엔드포인트 ====================

// 1. 사용자 정보 조회
app.get('/api/users/:userId', (req, res) => {
    const { userId } = req.params;
    
    const query = `
        SELECT u.*, 
               (SELECT COUNT(*) FROM friendships WHERE user_id = u.user_id AND status = 'accepted') as friend_count
        FROM users u
        WHERE u.user_id = ?
    `;
    
    db.get(query, [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
        } else {
            res.json(row);
        }
    });
});

// 2. 학습 활동 기록 (XP 획득)
app.post('/api/activities', (req, res) => {
    const { userId, courseId, activityType, xpEarned, details } = req.body;
    
    // 활동 기록
    const insertActivity = `
        INSERT INTO learning_activities (user_id, course_id, activity_type, xp_earned, details)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(insertActivity, [userId, courseId, activityType, xpEarned, JSON.stringify(details)], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            // 사용자 XP 업데이트
            const updateXP = `
                UPDATE users 
                SET total_xp = total_xp + ?,
                    level = (SELECT calculated_level FROM user_levels WHERE user_id = ?),
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `;
            
            db.run(updateXP, [xpEarned, userId, userId], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    // 도전과제 진행상황 업데이트
                    updateChallengeProgress(userId, activityType);
                    
                    res.json({ 
                        success: true, 
                        activityId: this.lastID,
                        xpEarned 
                    });
                }
            });
        }
    });
});

// 3. 순위판 조회 (전체 또는 친구)
app.get('/api/leaderboard/:userId', (req, res) => {
    const { userId } = req.params;
    const { type = 'all' } = req.query; // 'all' 또는 'friends'
    
    let query;
    let params = [];
    
    if (type === 'friends') {
        query = `
            SELECT u.user_id, u.name, u.profile_image, u.total_xp, u.level,
                   RANK() OVER (ORDER BY u.total_xp DESC) as rank
            FROM users u
            WHERE u.user_id IN (
                SELECT friend_id FROM friendships 
                WHERE user_id = ? AND status = 'accepted'
            ) OR u.user_id = ?
            ORDER BY u.total_xp DESC
            LIMIT 100
        `;
        params = [userId, userId];
    } else {
        query = `
            SELECT user_id, name, profile_image, total_xp, level, rank
            FROM leaderboard
            LIMIT 100
        `;
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 4. 도전과제 목록 조회
app.get('/api/challenges', (req, res) => {
    const { courseId, isActive = 1 } = req.query;
    
    let query = `
        SELECT c.*, 
               COUNT(uc.user_challenge_id) as participant_count
        FROM challenges c
        LEFT JOIN user_challenges uc ON c.challenge_id = uc.challenge_id
        WHERE c.is_active = ?
    `;
    
    const params = [isActive];
    
    if (courseId) {
        query += ` AND c.course_id = ?`;
        params.push(courseId);
    }
    
    query += ` GROUP BY c.challenge_id ORDER BY c.created_at DESC`;
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 5. 도전과제 참여
app.post('/api/challenges/:challengeId/join', (req, res) => {
    const { challengeId } = req.params;
    const { userId } = req.body;
    
    const query = `
        INSERT INTO user_challenges (user_id, challenge_id)
        VALUES (?, ?)
    `;
    
    db.run(query, [userId, challengeId], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                res.status(400).json({ error: '이미 참여중인 도전과제입니다' });
            } else {
                res.status(500).json({ error: err.message });
            }
        } else {
            res.json({ 
                success: true, 
                userChallengeId: this.lastID 
            });
        }
    });
});

// 6. 내 도전과제 진행상황 조회
app.get('/api/users/:userId/challenges', (req, res) => {
    const { userId } = req.params;
    
    const query = `
        SELECT c.*, uc.current_progress, uc.is_completed, uc.joined_at
        FROM user_challenges uc
        JOIN challenges c ON uc.challenge_id = c.challenge_id
        WHERE uc.user_id = ?
        ORDER BY uc.is_completed ASC, uc.joined_at DESC
    `;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 7. 친구 추가
app.post('/api/friends', (req, res) => {
    const { userId, friendId } = req.body;
    
    const query = `
        INSERT INTO friendships (user_id, friend_id, status)
        VALUES (?, ?, 'accepted')
    `;
    
    db.run(query, [userId, friendId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            // 양방향 친구 관계 생성
            db.run(query, [friendId, userId], (err2) => {
                if (err2) {
                    res.status(500).json({ error: err2.message });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});

// 8. 내 친구 목록 조회
app.get('/api/users/:userId/friends', (req, res) => {
    const { userId } = req.params;
    
    const query = `
        SELECT u.user_id, u.name, u.profile_image, u.total_xp, u.level
        FROM users u
        JOIN friendships f ON u.user_id = f.friend_id
        WHERE f.user_id = ? AND f.status = 'accepted'
        ORDER BY u.total_xp DESC
    `;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 9. 학습 통계 조회
app.get('/api/users/:userId/statistics', (req, res) => {
    const { userId } = req.params;
    const { period = 'week' } = req.query; // 'week' or 'month'
    
    const days = period === 'week' ? 7 : 30;
    
    const query = `
        SELECT 
            DATE(activity_date) as date,
            SUM(xp_earned) as daily_xp,
            COUNT(*) as activity_count
        FROM learning_activities
        WHERE user_id = ? AND activity_date >= date('now', '-${days} days')
        GROUP BY DATE(activity_date)
        ORDER BY date ASC
    `;
    
    db.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 10. 뱃지 획득 체크 및 지급
app.post('/api/users/:userId/check-badges', (req, res) => {
    const { userId } = req.params;
    
    // 사용자 정보 조회
    db.get('SELECT total_xp FROM users WHERE user_id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ error: '사용자 조회 실패' });
        }
        
        // 획득 가능한 뱃지 확인
        const query = `
            SELECT b.* FROM badges b
            WHERE b.badge_id NOT IN (
                SELECT badge_id FROM user_badges WHERE user_id = ?
            )
            AND (
                (b.requirement_type = 'xp_milestone' AND ? >= b.requirement_value)
            )
        `;
        
        db.all(query, [userId, user.total_xp], (err, newBadges) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            if (newBadges.length === 0) {
                return res.json({ newBadges: [] });
            }
            
            // 새 뱃지 지급
            const insertPromises = newBadges.map(badge => {
                return new Promise((resolve, reject) => {
                    db.run(
                        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
                        [userId, badge.badge_id],
                        (err) => err ? reject(err) : resolve(badge)
                    );
                });
            });
            
            Promise.all(insertPromises)
                .then(() => res.json({ newBadges }))
                .catch(err => res.status(500).json({ error: err.message }));
        });
    });
});

// ==================== 헬퍼 함수 ====================

// 도전과제 진행상황 업데이트
function updateChallengeProgress(userId, activityType) {
    const query = `
        UPDATE user_challenges
        SET current_progress = current_progress + 1,
            is_completed = CASE 
                WHEN current_progress + 1 >= (SELECT target_value FROM challenges WHERE challenge_id = user_challenges.challenge_id)
                THEN 1 
                ELSE 0 
            END,
            completed_at = CASE 
                WHEN current_progress + 1 >= (SELECT target_value FROM challenges WHERE challenge_id = user_challenges.challenge_id)
                THEN CURRENT_TIMESTAMP 
                ELSE NULL 
            END
        WHERE user_id = ? 
        AND challenge_id IN (
            SELECT challenge_id FROM challenges 
            WHERE is_active = 1 
            AND date('now') BETWEEN start_date AND end_date
        )
        AND is_completed = 0
    `;
    
    db.run(query, [userId], (err) => {
        if (err) console.error('도전과제 업데이트 실패:', err);
    });
}

// ==================== 서버 시작 ====================

app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행중입니다`);
});

// 종료 시 DB 연결 닫기
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('데이터베이스 연결 종료');
        process.exit(0);
    });
});
