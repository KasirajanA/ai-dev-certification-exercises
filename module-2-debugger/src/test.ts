// Simple test script to reveal the 3 bugs
// Run: npm test (after starting server with npm run dev)

const BASE = "http://localhost:3456";

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
  } catch (error: any) {
    console.log(`  FAIL: ${name}`);
    console.log(`        ${error.message}`);
  }
}

async function run() {
  console.log("\n--- Debug Detective Test Suite ---\n");

  // BUG #1: Creating a user crashes
  await test("POST /api/users should create a user", async () => {
    const res = await fetch(`${BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User", email: "test@example.com" }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(`Status ${res.status}: ${body.error}`);
    }
    const user = await res.json();
    if (!user.id) throw new Error("User missing id");
    if (!user.email) throw new Error("User missing email");
  });

  // BUG #2: Post count is wrong (returns total, not per-user)
  await test("GET /api/users/1/stats should show correct post count", async () => {
    const res = await fetch(`${BASE}/api/users/1/stats`);
    const stats = await res.json();

    // Alice has 40 of the 200 posts (200 / 5 users)
    if (stats.postCount !== 40) {
      throw new Error(
        `Expected 40 posts for user 1, got ${stats.postCount} (seems like total count?)`
      );
    }
  });

  // BUG #3: Feed uses N+1 queries (1 query per post for author)
  await test("GET /api/posts/feed should use efficient queries", async () => {
    const res = await fetch(`${BASE}/api/posts/feed`);
    const data = await res.json();

    // With 200 posts, N+1 means 201 queries instead of 1 JOIN.
    // The meta.queryCount field should exist and be <= 2 (one query with JOIN).
    // Current broken code doesn't track queries, so this field is missing.
    if (!data.meta.queryCount) {
      throw new Error(
        `No queryCount in response — add query counting to detect N+1 (${data.meta.count} posts likely = ${data.meta.count + 1} queries)`
      );
    }
    if (data.meta.queryCount > 2) {
      throw new Error(
        `Used ${data.meta.queryCount} queries for ${data.meta.count} posts (N+1 detected — use a JOIN)`
      );
    }
  });

  console.log("\n--- Done ---\n");
}

run().catch(console.error);
