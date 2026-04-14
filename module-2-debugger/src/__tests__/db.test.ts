import { describe, it, expect, beforeEach, vi } from "vitest";

// Use an in-memory DB for each test suite — isolates tests from the real DB file
// and resets state automatically between runs.
beforeEach(() => {
  process.env.DB_PATH = ":memory:";
  vi.resetModules();
});

async function importDb() {
  return import("../db");
}

// ---------------------------------------------------------------------------
// Bug #1: createUser was passing `undefined` as email (server.ts hardcoded it)
// Regression: createUser must persist the email that was passed in
// ---------------------------------------------------------------------------
describe("Bug #1 — createUser email", () => {
  it("saves the provided email to the database", async () => {
    const { createUser } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    expect(user.email).toBe("alice@test.com");
  });

  it("returns the full user record including id", async () => {
    const { createUser } = await importDb();
    const user = createUser("Bob", "bob@test.com") as any;
    expect(user.id).toBeDefined();
    expect(user.name).toBe("Bob");
  });
});

// ---------------------------------------------------------------------------
// Bug #2: getUserWithPostCount was missing WHERE authorId = ? — returned total
// Regression: postCount must reflect only that user's posts, not the global total
// ---------------------------------------------------------------------------
describe("Bug #2 — getUserWithPostCount per-user count", () => {
  it("returns post count for the specific user, not the total", async () => {
    const { createUser, createPost, getUserWithPostCount } = await importDb();

    const alice = createUser("Alice", "alice@test.com") as any;
    const bob = createUser("Bob", "bob@test.com") as any;

    createPost("A1", "body", alice.id);
    createPost("A2", "body", alice.id);
    createPost("B1", "body", bob.id);
    createPost("B2", "body", bob.id);
    createPost("B3", "body", bob.id);

    const aliceStats = getUserWithPostCount(alice.id) as any;
    const bobStats = getUserWithPostCount(bob.id) as any;

    // Before the fix: both would return 5 (total)
    expect(aliceStats.postCount).toBe(2);
    expect(bobStats.postCount).toBe(3);
  });

  it("returns 0 for a user with no posts", async () => {
    const { createUser, getUserWithPostCount } = await importDb();
    const user = createUser("Eve", "eve@test.com") as any;
    const stats = getUserWithPostCount(user.id) as any;
    expect(stats.postCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Comments: createComment and getCommentsByPost
// ---------------------------------------------------------------------------
describe("createComment", () => {
  it("creates a comment and returns the full record", async () => {
    const { createUser, createPost, createComment } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    const post = createPost("My Post", "body", user.id) as any;

    const comment = createComment("Bob", "Great post!", post.id) as any;
    expect(comment.id).toBeDefined();
    expect(comment.authorName).toBe("Bob");
    expect(comment.body).toBe("Great post!");
    expect(comment.postId).toBe(post.id);
    expect(comment.createdAt).toBeDefined();
  });

  it("rejects a comment with an empty body (NOT NULL constraint)", async () => {
    const { createUser, createPost, createComment } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    const post = createPost("My Post", "body", user.id) as any;

    expect(() => createComment("Bob", "", post.id)).toThrow();
  });

  it("rejects a comment with an invalid postId (FK constraint)", async () => {
    const { createComment } = await importDb();
    expect(() => createComment("Bob", "Hello", 9999)).toThrow();
  });

  it("rejects a comment with an empty authorName (NOT NULL constraint)", async () => {
    const { createUser, createPost, createComment } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    const post = createPost("My Post", "body", user.id) as any;

    expect(() => createComment("", "Great post!", post.id)).toThrow();
  });
});

describe("getCommentsByPost", () => {
  it("returns all comments for a post in ascending createdAt order", async () => {
    const { createUser, createPost, createComment, getCommentsByPost } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    const post = createPost("My Post", "body", user.id) as any;

    createComment("Bob", "First", post.id);
    createComment("Carol", "Second", post.id);

    const comments = getCommentsByPost(post.id) as any[];
    expect(comments).toHaveLength(2);
    expect(comments[0].body).toBe("First");
    expect(comments[1].body).toBe("Second");
  });

  it("returns an empty array for a post with no comments", async () => {
    const { createUser, createPost, getCommentsByPost } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    const post = createPost("My Post", "body", user.id) as any;

    const comments = getCommentsByPost(post.id) as any[];
    expect(comments).toHaveLength(0);
  });

  it("returns an empty array for a non-existent postId", async () => {
    const { getCommentsByPost } = await importDb();
    const comments = getCommentsByPost(9999) as any[];
    expect(comments).toHaveLength(0);
  });

  it("only returns comments for the requested post", async () => {
    const { createUser, createPost, createComment, getCommentsByPost } = await importDb();
    const user = createUser("Alice", "alice@test.com") as any;
    const post1 = createPost("Post 1", "body", user.id) as any;
    const post2 = createPost("Post 2", "body", user.id) as any;

    createComment("Bob", "On post 1", post1.id);
    createComment("Carol", "On post 2", post2.id);

    const comments = getCommentsByPost(post1.id) as any[];
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe("On post 1");
  });
});

// ---------------------------------------------------------------------------
// Bug #3: getAllPostsWithAuthors used N+1 queries (one SELECT per post)
// Regression: each post must include correct author data via the JOIN
// ---------------------------------------------------------------------------
describe("Bug #3 — getAllPostsWithAuthors JOIN correctness", () => {
  it("attaches the correct author to each post", async () => {
    const { createUser, createPost, getAllPostsWithAuthors } = await importDb();

    const alice = createUser("Alice", "alice@test.com") as any;
    const bob = createUser("Bob", "bob@test.com") as any;

    createPost("Alice's post", "body", alice.id);
    createPost("Bob's post", "body", bob.id);

    const posts = getAllPostsWithAuthors() as any[];
    const alicePost = posts.find((p) => p.title === "Alice's post");
    const bobPost = posts.find((p) => p.title === "Bob's post");

    expect(alicePost.author).toEqual({ id: alice.id, name: "Alice" });
    expect(bobPost.author).toEqual({ id: bob.id, name: "Bob" });
  });

  it("returns all posts with non-null author objects", async () => {
    const { createUser, createPost, getAllPostsWithAuthors } = await importDb();

    const user = createUser("Carol", "carol@test.com") as any;
    createPost("P1", "body", user.id);
    createPost("P2", "body", user.id);

    const posts = getAllPostsWithAuthors() as any[];
    expect(posts).toHaveLength(2);
    posts.forEach((post) => {
      expect(post.author).not.toBeNull();
      expect(post.author.id).toBe(user.id);
      expect(post.author.name).toBe("Carol");
    });
  });
});
