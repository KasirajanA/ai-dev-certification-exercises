import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "debugger.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        authorId INTEGER NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (authorId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        authorName TEXT NOT NULL,
        body TEXT NOT NULL,
        postId INTEGER NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);
  }
  return db;
}

// --- User queries ---

export function getAllUsers() {
  const db = getDb();
  return db.prepare("SELECT * FROM users ORDER BY id").all();
}

export function getUserById(id: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

// BUG #1: Runtime error — can you spot it?
export function createUser(name: string, email: string) {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO users (name, email) VALUES (?, ?)")
    .run(name, email);
  return getUserById(result.lastInsertRowid as number);
}

// --- Post queries ---

export function getAllPosts() {
  const db = getDb();
  return db.prepare("SELECT * FROM posts ORDER BY createdAt DESC").all();
}

export function getPostsByAuthor(authorId: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM posts WHERE authorId = ?").all(authorId);
}

export function createPost(title: string, body: string, authorId: number) {
  const db = getDb();
  const result = db
    .prepare("INSERT INTO posts (title, body, authorId) VALUES (?, ?, ?)")
    .run(title, body, authorId);
  return db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid);
}

// BUG #2: Logic bug — post count is wrong
export function getUserWithPostCount(userId: number) {
  const db = getDb();
  const user = getUserById(userId) as any;
  if (!user) return null;

  // Count posts for this user
  const countResult = db
    .prepare("SELECT COUNT(*) as count FROM posts WHERE authorId = ?")
    .get(userId) as any;

  return {
    ...user,
    postCount: countResult.count,
  };
}

// BUG #3: N+1 performance — this is slow with many posts
export function getAllPostsWithAuthors() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.*, u.id as userId, u.name as authorName
    FROM posts p
    LEFT JOIN users u ON p.authorId = u.id
    ORDER BY p.createdAt DESC
  `).all() as any[];

  return rows.map(({ userId, authorName, ...post }) => ({
    ...post,
    author: userId ? { id: userId, name: authorName } : null,
  }));
}

// Fixed version hint (don't peek until you've found the bugs!)
// getAllPostsWithAuthors could use a JOIN:
// SELECT p.*, u.id as authorId, u.name as authorName
// FROM posts p LEFT JOIN users u ON p.authorId = u.id

// --- Comment queries ---

export function getCommentsByPost(postId: number) {
  const db = getDb();
  return db
    .prepare("SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC")
    .all(postId);
}

export function createComment(authorName: string, body: string, postId: number) {
  if (!authorName) throw new Error("authorName must not be empty");
  if (!body) throw new Error("body must not be empty");
  const db = getDb();
  const result = db
    .prepare("INSERT INTO comments (authorName, body, postId) VALUES (?, ?, ?)")
    .run(authorName, body, postId);
  return db.prepare("SELECT * FROM comments WHERE id = ?").get(result.lastInsertRowid);
}
