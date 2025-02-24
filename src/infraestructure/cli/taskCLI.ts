import { Command } from 'commander';
import { TaskRepository } from '../persistence/TaskRepository';
import { TaskService } from '../../application/TaskService';
import { CreateTaskSchema, UpdateTaskSchema } from '../../domain/entities/tasks.schema';
import { ZodError } from 'zod';

const taskRepository = new TaskRepository();
const taskUseCases = new TaskService(taskRepository);


/**
 * Outputs data to the console in either JSON format or a more human-readable format.
 */
function output(outputData: { json: boolean, success: boolean, data: unknown }): void {
  if (outputData.json) {
    console.log(JSON.stringify({ success: outputData.success, data: outputData.data }, null, 2));
  } else {
    if (!outputData.success) {
      console.error(outputData.data);
      return;
    }
    if (Array.isArray(outputData.data)) {
      console.table(outputData.data);
      return;
    }
    console.log(outputData.data);
  }
}

const program = new Command();
program
  .command('add')
  .description('Add a new task')
  .option('-j, --json', 'JSON output', false)
  .option('-t, --title <title>', 'Task title')
  .option('-d, --description <description>', 'Task description')
  .option('--due <date>', 'Task due date (YYYY-MM-DD)')
  .action(async (options) => {
    const { title, description, due, json } = options;
    try {
      // validate input data from the CLI
      const createTaskData = CreateTaskSchema.parse({ title, description, dueDate: due });
      const task = await taskUseCases.create(createTaskData);
      output({ json, success: true, data: `Task Created: ${task.id}` });
    } catch (error) {
      if (error instanceof ZodError) {
        const errTxt = error.errors[0].message;
        output({ json, success: false, data: errTxt });
        return;
      }
      output({ json, success: false, data: JSON.stringify(error) });
    }
  });

program
  .command('list')
  .option('-j, --json', 'JSON output', false)
  .description('List all tasks')
  .action(async (options) => {
    const { json } = options;
    try {
      const tasks = await taskUseCases.list();
      output({ json, success: true, data: tasks });
    } catch (error) {
      output({ json, success: false, data: JSON.stringify(error) });
    }
  });

program
  .command('update <id>')
  .description('Update an existing task')
  .option('-j, --json', 'JSON output', false)
  .option('-t, --title <title>', 'New title')
  .option('-d, --description <description>', 'New description')
  .option('--due <date>', 'New due date (YYYY-MM-DD)')
  .option('--status <status>', 'Update status (Pending or Completed)')
  .action(async (id, options) => {
    try {
      // validate input data from the CLI
      const updateTaskData = UpdateTaskSchema.parse({ title: options.title, description: options.description, dueDate: options.due, status: options.status });

      const updatedTask = await taskUseCases.update(id, updateTaskData);
      if (updatedTask) {
        output({ json: options.json, success: true, data: `Task ${id} updated.` });
        return;
      }
      output({ json: options.json, success: false, data: `Task ${id} not found.` });
    } catch (error) {
      if (error instanceof ZodError) {
        const errTxt = JSON.stringify(error.errors[0].message);
        output({ json: options.json, success: false, data: errTxt });
        return;
      }
      output({ json: options.json, success: false, data: JSON.stringify(error) });
    }
  });

program
  .command('delete <id>')
  .option('-j, --json', 'JSON output', false)
  .description('Delete a task by ID')
  .action(async (id, options) => {
    try {
      if (!id || typeof id !== 'string') {
        output({ json: options.json, success: false, data: 'Task ID is required.' });
        return;
      }
      const result = await taskUseCases.delete(id);
      if (!result) {
        output({ json: options.json, success: false, data: `Task ${id} not found.` });
        return;
      }
      output({ json: options.json, success: true, data: `Task ${id} deleted.` });
    } catch (error) {
      output({ json: options.json, success: false, data: JSON.stringify(error) });
    }
  });

// Parse the arguments
program.parse(process.argv);
