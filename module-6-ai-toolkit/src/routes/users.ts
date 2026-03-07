import { Router, Request, Response } from "express";
import { User } from "../types";
import { generateId, isValidEmail } from "../utils/helpers";

const router = Router();

// In-memory user storage
let users: User[] = [
  {
    id: "user-001",
    name: "Alice Chen",
    email: "alice@example.com",
    password: "hashed_password_abc123",
    role: "admin",
    createdAt: "2026-02-15T08:00:00Z",
  },
  {
    id: "user-002",
    name: "Bob Martinez",
    email: "bob@example.com",
    password: "hashed_password_def456",
    role: "member",
    createdAt: "2026-02-20T10:00:00Z",
  },
];

// GET /api/users - List all users
// SECURITY ISSUE: Returns password field in response!
// Should strip sensitive fields before sending
router.get("/", (_req: Request, res: Response) => {
  res.json({ users, total: users.length });
});

// GET /api/users/:id - Get a single user
// SECURITY ISSUE: Same problem - returns password
router.get("/:id", (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

// POST /api/users - Create a new user
router.post("/", (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: "Valid email is required" });
    return;
  }

  // Check for duplicate email
  const existing = users.find((u) => u.email === email);
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  // No password strength validation
  const newUser: User = {
    id: generateId(),
    name: name || "",
    email,
    password: password || "default123", // ISSUE: Default password, no hashing
    role: role || "member",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Still returns password in the response!
  res.status(201).json({ user: newUser });
});

// Export for use by tasks route (N+1 simulation)
export function getUsers(): User[] {
  return users;
}

export function resetUsers(): void {
  users = [
    {
      id: "user-001",
      name: "Alice Chen",
      email: "alice@example.com",
      password: "hashed_password_abc123",
      role: "admin",
      createdAt: "2026-02-15T08:00:00Z",
    },
    {
      id: "user-002",
      name: "Bob Martinez",
      email: "bob@example.com",
      password: "hashed_password_def456",
      role: "member",
      createdAt: "2026-02-20T10:00:00Z",
    },
  ];
}

export default router;
