import { TaskService } from '../../src/application/TaskService';
import { ITaskRepository } from '../../src/domain/ports/ITaskRepository';
import { Task } from '../../src/domain/entities/task';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskSchema } from '../../src/domain/entities/tasks.schema';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('TaskService', () => {
  let taskRepository: jest.Mocked<ITaskRepository>;
  let taskService: TaskService;

  beforeEach(() => {
    taskRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };
    taskService = new TaskService(taskRepository);
  });

  describe('create', () => {
    it('should create a new task and save it', async () => {
      const input = { title: 'Test Task', description: 'This is a test task', dueDate: new Date(Date.now() + 1000 * 60 * 60) }; // Future date

      const validatedInput = CreateTaskSchema.parse(input);
      const expectedTask = Task.create({
        id: 'mocked-uuid',
        title: validatedInput.title,
        description: validatedInput.description,
        dueDate: validatedInput.dueDate,
        status: 'Pending',
      });

      taskRepository.save.mockResolvedValueOnce(undefined);

      const result = await taskService.create(input);

      expect(result).toEqual(expectedTask);
      expect(taskRepository.save).toHaveBeenCalledWith(expectedTask);
    });

    it('should throw an error if input is invalid', async () => {
      const invalidInput = { title: 'T', description: 'D', dueDate: new Date(Date.now() - 1000) }; 

      await expect(taskService.create(invalidInput)).rejects.toThrow();
      expect(taskRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return a list of tasks', async () => {
      const tasks = [
        Task.create({
          id: uuidv4(),
          title: 'Task 1',
          description: 'Description 1',
          dueDate: new Date(Date.now() + 1000 * 60 * 60),
          status: 'Pending',
        }),
        Task.create({
          id: uuidv4(),
          title: 'Task 2',
          description: 'Description 2',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
          status: 'Completed',
        }),
      ];

      taskRepository.findAll.mockResolvedValueOnce(tasks);

      const result = await taskService.list();

      expect(result).toEqual(tasks);
      expect(taskRepository.findAll).toHaveBeenCalled();
    });

    it('should return an empty list if no tasks exist', async () => {
      taskRepository.findAll.mockResolvedValueOnce([]);

      const result = await taskService.list();

      expect(result).toEqual([]);
      expect(taskRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      const existingTask = Task.create({
        id: 'existing-id',
        title: 'Old Title',
        description: 'Old Description',
        dueDate: new Date(Date.now() + 1000 * 60 * 60),
        status: 'Pending',
      });

      taskRepository.findById.mockResolvedValueOnce(existingTask);
      taskRepository.save.mockResolvedValueOnce(undefined);

      const updates = { title: 'New Title', description: 'New Description' };
      const result = await taskService.update('existing-id', updates);

      expect(result).toEqual({
        ...existingTask,
        title: 'New Title',
        description: 'New Description',
      });
      expect(taskRepository.save).toHaveBeenCalledWith({
        ...existingTask,
        title: 'New Title',
        description: 'New Description',
      });
    });

    it('should return null if task does not exist', async () => {
      taskRepository.findById.mockResolvedValueOnce(null);

      const result = await taskService.update('non-existent-id', { title: 'New Title' });

      expect(result).toBeNull();
      expect(taskRepository.save).not.toHaveBeenCalled();
    });

    it('should not update if invalid data is provided', async () => {
      const existingTask = Task.create({
        id: 'existing-id',
        title: 'Old Title',
        description: 'Old Description',
        dueDate: new Date(Date.now() + 1000 * 60 * 60),
        status: 'Pending',
      });

      taskRepository.findById.mockResolvedValueOnce(existingTask);

      await expect(
        taskService.update('existing-id', { title: 'T' }) // Invalid title
      ).rejects.toThrow();
      expect(taskRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an existing task', async () => {
      const existingTask = Task.create({
        id: 'task-id',
        title: 'Some Task',
        description: 'Some Description',
        dueDate: new Date(Date.now() + 1000 * 60 * 60),
        status: 'Pending',
      });

      taskRepository.findById.mockResolvedValueOnce(existingTask);
      taskRepository.delete.mockResolvedValueOnce(undefined);

      const result = await taskService.delete('task-id');

      expect(result).toBe(true);
      expect(taskRepository.delete).toHaveBeenCalledWith('task-id');
    });

    it('should return false if task does not exist', async () => {
      taskRepository.findById.mockResolvedValueOnce(null);

      const result = await taskService.delete('non-existent-id');

      expect(result).toBe(false);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });
  });
});
