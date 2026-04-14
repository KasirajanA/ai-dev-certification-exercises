import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/server.js";

const prisma = new PrismaClient();

let authToken;
let otherToken;
let testUserId;

beforeAll(async () => {
  // Ensure database is clean
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Register the primary test user
  const registerRes = await request(app).post("/api/auth/register").send({
    email: "testuser@example.com",
    password: "password123",
    name: "Test User",
  });
  authToken = registerRes.body.token;
  testUserId = registerRes.body.user.id;

  // Register a second user for ownership tests
  const otherRes = await request(app).post("/api/auth/register").send({
    email: "other@example.com",
    password: "password123",
    name: "Other User",
  });
  otherToken = otherRes.body.token;

  // Seed test posts owned by the primary test user
  await prisma.post.create({
    data: {
      id: 100,
      title: "Test Post One",
      content: "Content for test post one.",
      published: true,
      authorId: testUserId,
    },
  });

  await prisma.post.create({
    data: {
      id: 101,
      title: "Test Post Two (Draft)",
      content: "This draft should not appear in listings.",
      published: false,
      authorId: testUserId,
    },
  });

  await prisma.comment.create({
    data: {
      content: "A test comment",
      authorName: "Tester",
      postId: 100,
    },
  });
});

afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("GET /health", () => {
  it("should return ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/posts", () => {
  it("should return only published posts", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe("Test Post One");
  });
});

describe("GET /api/posts/:id", () => {
  it("should return a post with its comments", async () => {
    const res = await request(app).get("/api/posts/100");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Test Post One");
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBe(1);
    expect(res.body.comments[0].authorName).toBe("Tester");
  });

  it("should return 404 for a non-existent post", async () => {
    const res = await request(app).get("/api/posts/9999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/posts", () => {
  it("should create a new post when authenticated", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "New Test Post",
        content: "Some content here.",
        published: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Test Post");
    expect(res.body.published).toBe(true);
    expect(res.body.authorId).toBe(testUserId);
  });

  it("should return 401 without a token", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "Unauthorized Post",
      content: "Should fail.",
    });
    expect(res.status).toBe(401);
  });

  it("should reject a post without a title", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ content: "Missing title" });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/posts/:id", () => {
  it("should update own post", async () => {
    const res = await request(app)
      .put("/api/posts/100")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Updated Title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
  });

  it("should return 401 without a token", async () => {
    const res = await request(app)
      .put("/api/posts/100")
      .send({ title: "No token" });
    expect(res.status).toBe(401);
  });

  it("should return 403 when updating another user's post", async () => {
    const res = await request(app)
      .put("/api/posts/100")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Stolen edit" });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/posts/:id", () => {
  it("should return 401 without a token", async () => {
    const res = await request(app).delete("/api/posts/101");
    expect(res.status).toBe(401);
  });

  it("should return 403 when deleting another user's post", async () => {
    const res = await request(app)
      .delete("/api/posts/101")
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it("should delete own post", async () => {
    const res = await request(app)
      .delete("/api/posts/101")
      .set("Authorization", `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post deleted");
  });
});

describe("POST /api/auth/register", () => {
  it("should register a new user and return a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "newuser@example.com",
      password: "secret123",
      name: "New User",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("newuser@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("should return 409 for a duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "password123",
      name: "Duplicate",
    });
    expect(res.status).toBe(409);
  });

  it("should return 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "incomplete@example.com",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("testuser@example.com");
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("should return 401 for unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });
});
