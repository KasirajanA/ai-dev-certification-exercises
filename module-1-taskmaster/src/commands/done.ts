import { markDone } from "../db";

export function handleDone(id: string): void {
  const taskId = parseInt(id, 10);
  if (isNaN(taskId)) {
    console.error("Error: ID must be a number");
    process.exit(1);
  }

  if (markDone(taskId)) {
    console.log(`✓ Task #${taskId} marked as done`);
  } else {
    console.error(`Error: Task #${taskId} not found`);
    process.exit(1);
  }
}
