import { type ITaskRepository } from '../domain/ports/ITaskRepository';
import { TaskSchema } from '../domain/entities/tasks.schema';
import { Task } from '../domain/entities/task';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service class for managing tasks.
 */
export class TaskService {
  /**
   * Creates an instance of TaskService.
   * @param {ITaskRepository} taskRepository - The repository for task storage and retrieval.
   */
  constructor(private taskRepository: ITaskRepository) { }

  /**
   * Creates a new task. By default, the status is set to 'Pending'.
   */
  async create(input: { title: string; description?: string; dueDate: Date }): Promise<Task> {
    const task = Task.create({
      id: uuidv4(),
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      status: 'Pending',
    });
    await this.taskRepository.save(TaskSchema.parse(task))
    return task;
  }

  /**
   * Retrieves the list of all tasks.
   */
  list(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  /**
   * Updates an existing task.
   */
  async update(id: string, updates: { title?: string; description?: string; dueDate?: Date; status?: 'Pending' | 'Completed' }): Promise<Task | null> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      return null;
    }

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
    if (updates.status !== undefined) task.status = updates.status;

    await this.taskRepository.save(TaskSchema.parse(task));
    return task;
  }

  /**
   * Deletes a task by ID.
   */
  async delete(id: string): Promise<boolean> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      return false;
    }
    await this.taskRepository.delete(id);
    return true;
  }
}
