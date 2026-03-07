import { addTask } from "../db";

export function handleAdd(title: string): void {
  const task = addTask(title);
  console.log(`✓ Added task #${task.id}: "${task.title}"`);
}
