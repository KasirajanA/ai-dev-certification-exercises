import { Router, Request, Response } from "express";
import { Task } from "../types";
import { generateId, slugify, formatDate } from "../utils/helpers";

const router = Router();

// In-memory task storage
let tasks: Task[] = [
  {
    id: "task-001",
    title: "Set up project structure",
    description: "Initialize the Express + TypeScript project with proper config",
    status: "done",
    priority: "high",
    assigneeId: "user-001",
    tags: ["setup", "infrastructure"],
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "task-002",
    title: "Implement user authentication",
    description: "Add JWT-based authentication to the API",
    status: "in-progress",
    priority: "high",
    assigneeId: "user-002",
    tags: ["auth", "security"],
    createdAt: "2026-03-02T09:00:00Z",
    updatedAt: "2026-03-03T14:00:00Z",
  },
  {
    id: "task-003",
    title: "Write API documentation",
    description: "Document all endpoints with request/response examples",
    status: "todo",
    priority: "medium",
    tags: ["docs"],
    createdAt: "2026-03-03T11:00:00Z",
    updatedAt: "2026-03-03T11:00:00Z",
  },
];

// GET /api/tasks - List all tasks
// ISSUE: N+1 style inefficiency - processes each task individually
// when it could be done in a single pass
router.get("/", (req: Request, res: Response) => {
  const { status, priority } = req.query;

  let result = [...tasks];

  // Inefficient: filtering and transforming one at a time
  // with separate loops instead of chaining or single pass
  if (status) {
    result = result.filter((t) => t.status === status);
  }

  if (priority) {
    result = result.filter((t) => t.priority === priority);
  }

  // Unnecessary per-item processing that could be batched
  const enrichedTasks = result.map((task) => {
    // Wasteful: generating slug for every request instead of storing it
    const slug = slugify(task.title);

    // Wasteful: formatting date on every request
    const formattedDate = formatDate(task.createdAt);

    // Wasteful: looking up assignee for each task individually
    // In a real app this would be an N+1 database query
    let assigneeName = "Unassigned";
    if (task.assigneeId) {
      // Simulating N+1: importing and scanning users array per task
      const users = require("./users").getUsers();
      const assignee = users.find(
        (u: { id: string }) => u.id === task.assigneeId
      );
      if (assignee) {
        assigneeName = assignee.name;
      }
    }

    return {
      ...task,
      slug,
      formattedCreatedAt: formattedDate,
      assigneeName,
    };
  });

  res.json({ tasks: enrichedTasks, total: enrichedTasks.length });
});

// GET /api/tasks/:id - Get a single task
router.get("/:id", (req: Request, res: Response) => {
  const task = tasks.find((t) => t.id === req.params.id);

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json({ task });
});

// POST /api/tasks - Create a new task
// ISSUE: No input validation - accepts anything
router.post("/", (req: Request, res: Response) => {
  const { title, description, status, priority, assigneeId, tags } = req.body;

  // No validation at all - title could be empty, status could be invalid,
  // priority could be any string, tags might not be an array
  const newTask: Task = {
    id: generateId(),
    title: title || "",
    description: description || "",
    status: status || "todo",
    priority: priority || "medium",
    assigneeId: assigneeId,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json({ task: newTask });
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", (req: Request, res: Response) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  // No validation on update either
  const updated: Task = {
    ...tasks[index],
    ...req.body,
    id: tasks[index].id, // Prevent ID overwrite
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  res.json({ task: updated });
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", (req: Request, res: Response) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const deleted = tasks.splice(index, 1)[0];
  res.json({ message: "Task deleted", task: deleted });
});

// Export for testing
export function getTasks(): Task[] {
  return tasks;
}

export function resetTasks(): void {
  tasks = [
    {
      id: "task-001",
      title: "Set up project structure",
      description:
        "Initialize the Express + TypeScript project with proper config",
      status: "done",
      priority: "high",
      assigneeId: "user-001",
      tags: ["setup", "infrastructure"],
      createdAt: "2026-03-01T10:00:00Z",
      updatedAt: "2026-03-01T12:00:00Z",
    },
    {
      id: "task-002",
      title: "Implement user authentication",
      description: "Add JWT-based authentication to the API",
      status: "in-progress",
      priority: "high",
      assigneeId: "user-002",
      tags: ["auth", "security"],
      createdAt: "2026-03-02T09:00:00Z",
      updatedAt: "2026-03-03T14:00:00Z",
    },
    {
      id: "task-003",
      title: "Write API documentation",
      description: "Document all endpoints with request/response examples",
      status: "todo",
      priority: "medium",
      tags: ["docs"],
      createdAt: "2026-03-03T11:00:00Z",
      updatedAt: "2026-03-03T11:00:00Z",
    },
  ];
}

export default router;
