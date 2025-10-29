import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  majorsSeed,
  usersSeed,
  coursesSeed,
  materialsSeed,
  practiceSetsSeed,
  practiceQuestionsSeed,
  practiceAttemptsSeed,
  scheduleSeed,
  forumTopicsSeed,
  forumCommentsSeed,
  forumLikesSeed,
  subjectMasterySeed,
  analyticsOverviewSeed,
  weakTopicsSeed,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const baseDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  charset: 'utf8mb4_general_ci',
};

const databaseName = process.env.DB_NAME || 'kaoyan_platform';

let pool;

const ensureDatabase = async () => {
  const connection = await mysql.createConnection({ ...baseDbConfig, multipleStatements: true });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
};

export const initDatabase = async () => {
  await ensureDatabase();
  pool = mysql.createPool({
    ...baseDbConfig,
    database: databaseName,
  });
  await createTables();
  await seedDatabase();
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database connection has not been initialised');
  }
  return pool;
};

export const runQuery = async (sql, params = {}) => {
  const [rows] = await getPool().query(sql, params);
  return rows;
};

const createTables = async () => {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS majors (
      id VARCHAR(30) PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(30) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
      email VARCHAR(255),
      phone VARCHAR(30),
      organization VARCHAR(255),
      goal VARCHAR(255),
      major_id VARCHAR(30),
      avatar VARCHAR(10),
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(30) PRIMARY KEY,
      major_id VARCHAR(30) NOT NULL,
      name VARCHAR(200) NOT NULL,
      category VARCHAR(40) NOT NULL,
      teacher VARCHAR(100) NOT NULL,
      credit DECIMAL(4,1) DEFAULT 0,
      progress INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'published',
      summary TEXT,
      schedule_info VARCHAR(255),
      release_window VARCHAR(120),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS materials (
      id VARCHAR(30) PRIMARY KEY,
      course_id VARCHAR(30) NOT NULL,
      title VARCHAR(200) NOT NULL,
      material_type VARCHAR(50) NOT NULL,
      url VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS practice_sets (
      id VARCHAR(30) PRIMARY KEY,
      owner_id VARCHAR(30) NOT NULL,
      name VARCHAR(200) NOT NULL,
      focus VARCHAR(255),
      difficulty VARCHAR(20),
      duration_minutes INT,
      question_count INT DEFAULT 0,
      last_attempt_at DATETIME NULL,
      last_accuracy DECIMAL(5,2),
      last_score INT,
      last_summary TEXT,
      source VARCHAR(100) DEFAULT '系统推荐',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS practice_questions (
      id VARCHAR(30) PRIMARY KEY,
      practice_set_id VARCHAR(30) NOT NULL,
      question_type ENUM('single', 'multiple') NOT NULL,
      stem TEXT NOT NULL,
      options_json TEXT,
      correct_options TEXT,
      explanation TEXT,
      knowledge_point VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_set_id) REFERENCES practice_sets(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS practice_attempts (
      id VARCHAR(30) PRIMARY KEY,
      practice_set_id VARCHAR(30) NOT NULL,
      user_id VARCHAR(30) NOT NULL,
      accuracy DECIMAL(5,2),
      score INT,
      answers_json LONGTEXT,
      summary TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_set_id) REFERENCES practice_sets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS schedule_events (
      id VARCHAR(30) PRIMARY KEY,
      user_id VARCHAR(30) NOT NULL,
      title VARCHAR(200) NOT NULL,
      event_type VARCHAR(30) NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      location VARCHAR(200),
      focus VARCHAR(255),
      tags_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS forum_topics (
      id VARCHAR(30) PRIMARY KEY,
      author_id VARCHAR(30) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      tags_json TEXT,
      needs_moderation TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS forum_comments (
      id VARCHAR(30) PRIMARY KEY,
      topic_id VARCHAR(30) NOT NULL,
      author_id VARCHAR(30) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS forum_likes (
      topic_id VARCHAR(30) NOT NULL,
      user_id VARCHAR(30) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (topic_id, user_id),
      FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS subject_mastery (
      id VARCHAR(30) PRIMARY KEY,
      user_id VARCHAR(30) NOT NULL,
      subject VARCHAR(100) NOT NULL,
      mastery DECIMAL(4,2) NOT NULL,
      trend VARCHAR(20),
      focus TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS analytics_overview (
      user_id VARCHAR(30) PRIMARY KEY,
      mock_trend TEXT,
      time_distribution TEXT,
      behavior_insight TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS weak_topics (
      id VARCHAR(30) PRIMARY KEY,
      user_id VARCHAR(30) NOT NULL,
      topic VARCHAR(200) NOT NULL,
      error_rate VARCHAR(20),
      suggestion TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

const seedDatabase = async () => {
  const [{ count: majorCount }] = await runQuery('SELECT COUNT(*) as count FROM majors');
  if (majorCount === 0) {
    for (const major of majorsSeed) {
      await runQuery(
        `INSERT INTO majors (id, name, description) VALUES (:id, :name, :description)`,
        major,
      );
    }
  }

  const [{ count: userCount }] = await runQuery('SELECT COUNT(*) as count FROM users');
  if (userCount === 0) {
    for (const user of usersSeed) {
      await runQuery(
        `INSERT INTO users (id, username, password, display_name, role, email, phone, organization, goal, major_id, avatar, bio)
         VALUES (:id, :username, :password, :display_name, :role, :email, :phone, :organization, :goal, :major_id, :avatar, :bio)`,
        user,
      );
    }
  }

  const [{ count: courseCount }] = await runQuery('SELECT COUNT(*) as count FROM courses');
  if (courseCount === 0) {
    for (const course of coursesSeed) {
      await runQuery(
        `INSERT INTO courses (id, major_id, name, category, teacher, credit, progress, status, summary, schedule_info, release_window)
         VALUES (:id, :major_id, :name, :category, :teacher, :credit, :progress, :status, :summary, :schedule_info, :release_window)`,
        course,
      );
    }
  }

  const [{ count: materialCount }] = await runQuery('SELECT COUNT(*) as count FROM materials');
  if (materialCount === 0) {
    for (const material of materialsSeed) {
      await runQuery(
        `INSERT INTO materials (id, course_id, title, material_type, url, description)
         VALUES (:id, :course_id, :title, :material_type, :url, :description)`,
        material,
      );
    }
  }

  const [{ count: practiceCount }] = await runQuery('SELECT COUNT(*) as count FROM practice_sets');
  if (practiceCount === 0) {
    for (const practice of practiceSetsSeed()) {
      await runQuery(
        `INSERT INTO practice_sets (id, owner_id, name, focus, difficulty, duration_minutes, question_count, last_attempt_at, last_accuracy, last_score, last_summary, source)
         VALUES (:id, :owner_id, :name, :focus, :difficulty, :duration_minutes, :question_count, :last_attempt_at, :last_accuracy, :last_score, :last_summary, :source)`,
        practice,
      );
    }

    for (const question of practiceQuestionsSeed) {
      await runQuery(
        `INSERT INTO practice_questions (id, practice_set_id, question_type, stem, options_json, correct_options, explanation, knowledge_point)
         VALUES (:id, :practice_set_id, :question_type, :stem, :options_json, :correct_options, :explanation, :knowledge_point)`,
        question,
      );
    }

    await runQuery(
      `UPDATE practice_sets SET question_count = (
        SELECT COUNT(*) FROM practice_questions WHERE practice_questions.practice_set_id = practice_sets.id
      )`,
    );
  }

  const [{ count: attemptCount }] = await runQuery('SELECT COUNT(*) as count FROM practice_attempts');
  if (attemptCount === 0) {
    for (const attempt of practiceAttemptsSeed) {
      await runQuery(
        `INSERT INTO practice_attempts (id, practice_set_id, user_id, accuracy, score, answers_json, summary)
         VALUES (:id, :practice_set_id, :user_id, :accuracy, :score, :answers_json, :summary)`,
        attempt,
      );
    }
  }

  const [{ count: scheduleCount }] = await runQuery('SELECT COUNT(*) as count FROM schedule_events');
  if (scheduleCount === 0) {
    for (const schedule of scheduleSeed()) {
      await runQuery(
        `INSERT INTO schedule_events (id, user_id, title, event_type, start_time, end_time, location, focus, tags_json)
         VALUES (:id, :user_id, :title, :event_type, :start_time, :end_time, :location, :focus, :tags_json)`,
        schedule,
      );
    }
  }

  const [{ count: topicCount }] = await runQuery('SELECT COUNT(*) as count FROM forum_topics');
  if (topicCount === 0) {
    for (const topic of forumTopicsSeed) {
      await runQuery(
        `INSERT INTO forum_topics (id, author_id, title, content, tags_json, needs_moderation)
         VALUES (:id, :author_id, :title, :content, :tags_json, :needs_moderation)`,
        topic,
      );
    }

    for (const comment of forumCommentsSeed) {
      await runQuery(
        `INSERT INTO forum_comments (id, topic_id, author_id, content)
         VALUES (:id, :topic_id, :author_id, :content)`,
        comment,
      );
    }

    for (const like of forumLikesSeed) {
      await runQuery(`INSERT INTO forum_likes (topic_id, user_id) VALUES (:topic_id, :user_id)`, like);
    }
  }

  const [{ count: masteryCount }] = await runQuery('SELECT COUNT(*) as count FROM subject_mastery');
  if (masteryCount === 0) {
    for (const mastery of subjectMasterySeed) {
      await runQuery(
        `INSERT INTO subject_mastery (id, user_id, subject, mastery, trend, focus)
         VALUES (:id, :user_id, :subject, :mastery, :trend, :focus)`,
        mastery,
      );
    }
  }

  const [{ count: overviewCount }] = await runQuery('SELECT COUNT(*) as count FROM analytics_overview');
  if (overviewCount === 0) {
    for (const overview of analyticsOverviewSeed) {
      await runQuery(
        `INSERT INTO analytics_overview (user_id, mock_trend, time_distribution, behavior_insight)
         VALUES (:user_id, :mock_trend, :time_distribution, :behavior_insight)`,
        overview,
      );
    }
  }

  const [{ count: weakCount }] = await runQuery('SELECT COUNT(*) as count FROM weak_topics');
  if (weakCount === 0) {
    for (const weak of weakTopicsSeed) {
      await runQuery(
        `INSERT INTO weak_topics (id, user_id, topic, error_rate, suggestion)
         VALUES (:id, :user_id, :topic, :error_rate, :suggestion)`,
        weak,
      );
    }
  }
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};
