import { deleteTask } from "../db";

export function handleDelete(id: string): void {
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    console.error("Error: ID must be a number");
    process.exit(1);
  }

  if (deleteTask(taskId)) {
    console.log(`✓ Task #${taskId} deleted`);
  } else {
    console.error(`Error: Task #${taskId} not found`);
    process.exit(1);
  }
}
