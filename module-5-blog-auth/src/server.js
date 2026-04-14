const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { requireAuth } = require("./middleware/auth");
const authRoutes = require("./routes/auth");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// List all published posts (public)
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Get a single post with comments (public)
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Create a new post (requires auth)
app.post("/api/posts", requireAuth, async (req, res) => {
  try {
    const { title, content, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published ?? false,
        authorId: req.user.sub,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Update a post (requires auth + ownership)
app.put("/api/posts/:id", requireAuth, async (req, res) => {
  try {
    const { title, content, published } = req.body;

    const existing = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.authorId !== req.user.sub) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published }),
      },
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete a post (requires auth + ownership)
app.delete("/api/posts/:id", requireAuth, async (req, res) => {
  try {
    const existing = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.authorId !== req.user.sub) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Add a comment to a post (public)
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const { content, authorName } = req.body;

    if (!content || !authorName) {
      return res
        .status(400)
        .json({ error: "Content and authorName are required" });
    }

    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorName,
        postId: parseInt(req.params.id),
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Start server only when run directly (not imported for tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3456;
  app.listen(PORT, () => {
    console.log(`Blog API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
