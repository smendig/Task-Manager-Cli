import { ITaskRepository } from '../../domain/ports/ITaskRepository';
import { Task } from '../../domain/entities/task';
import { config } from '../../config/index';
import fs from 'fs';
import path from 'path';
import os from 'os'; 

/** Directory path where task data is stored. */
const FOLDER_PATH = path.join(os.homedir(), config.tasksFilePath);

/** File path where tasks are persisted in JSON format. */
const JSON_FILE_PATH = path.join(FOLDER_PATH, config.tasksFileName);

/**
 * Repository for managing tasks using a local file storage system.
 */
export class TaskRepository implements ITaskRepository {
  /**
   * Initializes the repository by ensuring the data directory exists.
   */
  constructor() {
    this.initializeDataDir();
  }

  /**
   * Synchronously creates the data directory if it does not exist.
   */
  private initializeDataDir(): void {
    if (!fs.existsSync(FOLDER_PATH)) {
      fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }
  }

  /**
   * Saves a task to the storage file. If the task exists, it updates it; otherwise, it adds a new one.
   * @param {Task} task - The task to save or update.
   * @returns {Promise<void>}
   */
  async save(task: Task): Promise<void> {
    const tasks = await this.findAll();
    const index = tasks.findIndex(t => t.id === task.id);
    
    if (index !== -1) {
      tasks[index] = task; // Update existing task
    } else {
      tasks.push(task); // Add new task
    }

    await fs.promises.writeFile(JSON_FILE_PATH, JSON.stringify(tasks, null, 2));
  }

  /**
   * Finds a task by its ID.
   * @param {string} id - The ID of the task to find.
   * @returns {Promise<Task | null>} The found task or null if not found.
   */
  async findById(id: string): Promise<Task | null> {
    const tasks = await this.findAll();
    return tasks.find(t => t.id === id) || null;
  }

  /**
   * Retrieves all tasks from the storage file.
   * @returns {Promise<Task[]>} An array of all stored tasks.
   */
  async findAll(): Promise<Task[]> {
    try {
      const data = await fs.promises.readFile(JSON_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (_error) {
      // If the file doesn't exist or is empty, return an empty array
      return [];
    }
  }

  /**
   * Deletes a task by its ID.
   * @param {string} id - The ID of the task to delete.
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    const tasks = await this.findAll();
    const filteredTasks = tasks.filter(t => t.id !== id);
    await fs.promises.writeFile(JSON_FILE_PATH, JSON.stringify(filteredTasks, null, 2));
  }
}
