import { getAllTasks } from "../db";

export function handleList(): void {
  const tasks = getAllTasks();

  if (tasks.length === 0) {
    console.log("No tasks yet. Add one with: taskmaster add \"Your task\"");
    return;
  }

  console.log("\n  ID  Status  Title");
  console.log("  " + "─".repeat(40));

  for (const task of tasks) {
    const status = task.status === "done" ? "✓ done" : "○ todo";
    console.log(`  ${String(task.id).padStart(2)}  ${status.padEnd(6)}  ${task.title}`);
  }

  console.log();
}
