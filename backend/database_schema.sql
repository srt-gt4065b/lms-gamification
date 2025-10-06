-- LMS 게이미피케이션 플랫폼 데이터베이스 스키마

-- 1. 사용자 테이블
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    profile_image VARCHAR(255),
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 학습 활동 테이블
CREATE TABLE learning_activities (
    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'attendance', 'quiz', 'assignment', 'discussion'
    xp_earned INTEGER NOT NULL,
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT, -- JSON 형식으로 추가 정보 저장
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 3. 도전과제 테이블
CREATE TABLE challenges (
    challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'course'
    target_value INTEGER NOT NULL, -- 목표 수치 (예: 5회 출석)
    reward_xp INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by INTEGER, -- 교수자 user_id
    course_id VARCHAR(50),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- 4. 사용자 도전 참여 테이블
CREATE TABLE user_challenges (
    user_challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    completed_at TIMESTAMP,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id),
    UNIQUE(user_id, challenge_id)
);

-- 5. 친구 관계 테이블
CREATE TABLE friendships (
    friendship_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (friend_id) REFERENCES users(user_id),
    UNIQUE(user_id, friend_id)
);

-- 6. 뱃지 테이블
CREATE TABLE badges (
    badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_image VARCHAR(255),
    requirement_type VARCHAR(50), -- 'xp_milestone', 'streak', 'challenge_complete'
    requirement_value INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 사용자 뱃지 획득 테이블
CREATE TABLE user_badges (
    user_badge_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (badge_id) REFERENCES badges(badge_id),
    UNIQUE(user_id, badge_id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_activities_user ON learning_activities(user_id);
CREATE INDEX idx_activities_course ON learning_activities(course_id);
CREATE INDEX idx_activities_date ON learning_activities(activity_date);
CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge ON user_challenges(challenge_id);
CREATE INDEX idx_friendships_user ON friendships(user_id);

-- 레벨 계산 뷰 (XP에 따른 레벨 자동 계산)
CREATE VIEW user_levels AS
SELECT 
    user_id,
    total_xp,
    CASE 
        WHEN total_xp < 100 THEN 1
        WHEN total_xp < 300 THEN 2
        WHEN total_xp < 600 THEN 3
        WHEN total_xp < 1000 THEN 4
        WHEN total_xp < 1500 THEN 5
        ELSE 5 + ((total_xp - 1500) / 500)
    END as calculated_level
FROM users;

-- 순위 뷰 (걸음 수 순위판처럼)
CREATE VIEW leaderboard AS
SELECT 
    u.user_id,
    u.name,
    u.profile_image,
    u.total_xp,
    u.level,
    RANK() OVER (ORDER BY u.total_xp DESC) as rank
FROM users u
WHERE u.total_xp > 0
ORDER BY u.total_xp DESC;

-- 샘플 데이터 삽입

-- 샘플 사용자
INSERT INTO users (student_id, name, email, total_xp, level) VALUES
('2024001', '김철수', 'kim@university.ac.kr', 114092, 37),
('2024002', '이영희', 'lee@university.ac.kr', 83696, 28),
('2024003', '박민수', 'park@university.ac.kr', 65430, 22),
('2024004', '정수진', 'jung@university.ac.kr', 45280, 15),
('2024005', '최동현', 'choi@university.ac.kr', 32100, 11);

-- 샘플 도전과제
INSERT INTO challenges (title, description, challenge_type, target_value, reward_xp, start_date, end_date, course_id) VALUES
('5일 연속 출석', '5일 연속으로 강의에 출석하세요', 'streak', 5, 500, '2024-10-01', '2024-10-31', 'CS101'),
('퀴즈 마스터', '이번 주 모든 퀴즈에서 80점 이상 받기', 'weekly', 5, 300, '2024-10-01', '2024-10-07', 'CS101'),
('토론 참여왕', '토론 게시판에 10회 이상 의미있는 댓글 작성', 'course', 10, 400, '2024-10-01', '2024-10-31', 'CS101');

-- 샘플 뱃지
INSERT INTO badges (badge_name, badge_description, badge_image, requirement_type, requirement_value) VALUES
('신입생', '첫 강의 출석', 'badge_newbie.png', 'xp_milestone', 100),
('열정왕', 'XP 1000 달성', 'badge_enthusiast.png', 'xp_milestone', 1000),
('마스터', 'XP 10000 달성', 'badge_master.png', 'xp_milestone', 10000),
('연속 출석 5일', '5일 연속 출석', 'badge_streak5.png', 'streak', 5),
('도전 완수', '첫 도전과제 완료', 'badge_challenger.png', 'challenge_complete', 1);

-- 샘플 학습 활동
INSERT INTO learning_activities (user_id, course_id, activity_type, xp_earned, details) VALUES
(1, 'CS101', 'attendance', 50, '{"date": "2024-10-06", "class": "1교시"}'),
(1, 'CS101', 'quiz', 100, '{"score": 95, "quiz_id": "Q001"}'),
(1, 'CS101', 'assignment', 200, '{"grade": "A", "assignment_id": "A001"}'),
(2, 'CS101', 'attendance', 50, '{"date": "2024-10-06", "class": "1교시"}'),
(2, 'CS101', 'discussion', 75, '{"post_id": "D001", "comments": 3}');
