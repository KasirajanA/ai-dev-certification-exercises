import { getDb } from "./db";

const db = getDb();

// Clear existing data
db.exec("DELETE FROM posts");
db.exec("DELETE FROM users");

// Seed users
const insertUser = db.prepare(
  "INSERT INTO users (name, email) VALUES (?, ?)"
);

const users = [
  { name: "Alice Chen", email: "alice@example.com" },
  { name: "Bob Smith", email: "bob@example.com" },
  { name: "Carol Davis", email: "carol@example.com" },
  { name: "Dan Wilson", email: "dan@example.com" },
  { name: "Eve Martinez", email: "eve@example.com" },
];

const userIds: number[] = [];
for (const user of users) {
  const result = insertUser.run(user.name, user.email);
  userIds.push(result.lastInsertRowid as number);
}

// Seed posts — enough to show the N+1 performance issue
const insertPost = db.prepare(
  "INSERT INTO posts (title, body, authorId) VALUES (?, ?, ?)"
);

const topics = [
  "Getting Started with TypeScript",
  "Understanding Async/Await",
  "Building REST APIs with Express",
  "Database Design Patterns",
  "Error Handling Best Practices",
  "Testing Strategies for Node.js",
  "Performance Optimization Tips",
  "Security Considerations for APIs",
  "Deploying to Production",
  "Monitoring and Logging",
];

// Create 200 posts (enough to show N+1 is slow)
for (let i = 0; i < 200; i++) {
  const topic = topics[i % topics.length];
  const authorId = userIds[i % userIds.length];
  const num = Math.floor(i / topics.length) + 1;
  insertPost.run(
    `${topic} (Part ${num})`,
    `This is post ${i + 1} about ${topic.toLowerCase()}. It covers important concepts that every developer should know.`,
    authorId
  );
}

console.log(`Seeded ${users.length} users and 200 posts.`);
console.log(`\nUsers:`);
for (const user of users) {
  console.log(`  - ${user.name} (${user.email})`);
}
console.log(`\nRun 'npm run dev' to start the server.`);
