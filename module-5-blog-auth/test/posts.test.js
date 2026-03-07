import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/server.js";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Ensure database is clean and seeded for tests
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();

  await prisma.post.create({
    data: {
      id: 100,
      title: "Test Post One",
      content: "Content for test post one.",
      published: true,
    },
  });

  await prisma.post.create({
    data: {
      id: 101,
      title: "Test Post Two (Draft)",
      content: "This draft should not appear in listings.",
      published: false,
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
    // Only the published post should appear
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
  it("should create a new post", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "New Test Post",
      content: "Some content here.",
      published: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Test Post");
    expect(res.body.published).toBe(true);
  });

  it("should reject a post without a title", async () => {
    const res = await request(app).post("/api/posts").send({
      content: "Missing title",
    });
    expect(res.status).toBe(400);
  });
});
