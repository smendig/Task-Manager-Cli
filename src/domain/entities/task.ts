import { TaskSchema, Itask } from './tasks.schema';

/**
 * Represents a Task entity.
 */
export class Task implements Itask {
  /**
   * Creates an instance of Task.
   * @param {string} id - The unique identifier of the task.
   * @param {string} title - The title of the task.
   * @param {Date} dueDate - The due date of the task.
   * @param {'Pending' | 'Completed'} status - The status of the task.
   * @param {string} [description] - The optional description of the task.
   */
  constructor(
    public readonly id: string,
    public title: string,
    public dueDate: Date,
    public status: 'Pending' | 'Completed',
    public description?: string | undefined,
  ) {}

  /**
   * Creates a new Task instance after validating the input using TaskSchema.
   */
  static create(input: { id: string; title: string; description: string | undefined; dueDate: Date; status: 'Pending' | 'Completed' }): Task {
    const parsed = TaskSchema.parse(input);
    return new Task(parsed.id, parsed.title, parsed.dueDate, parsed.status, parsed.description);
  }
}
