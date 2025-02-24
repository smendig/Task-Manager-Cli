import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

import { config } from '../../src/config/index';

const execAsync = promisify(exec);

// Helper function to run CLI commands
async function runCliCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  const scriptPath = path.join(__dirname, '..', '..', 'dist', 'infraestructure', 'cli', 'taskCLI.js');
  return execAsync(`node ${scriptPath} ${command}`, {
    env: { ...process.env },
  });
}

// Helper function to parse JSON output from CLI
function parseCliOutput(output: string) {
  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to parse JSON output:\n${output}`);
  }
}

const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

// Helper function to ensure a clean tasks.json before each test
async function cleanupTasksFile(): Promise<void> {
  const FOLDER_PATH = path.join(os.homedir(), config.tasksFilePath);
  const JSON_FILE_PATH = path.join(FOLDER_PATH, config.tasksFileName);
  await fs.unlink(JSON_FILE_PATH).catch(() => { }); // Ignore errors if file doesn't exist
}

describe('Task CLI Integration Tests', () => {
  beforeEach(async () => {
    await cleanupTasksFile(); // Ensure tasks.json is empty before each test
  });

  // afterEach(async () => {
  // });

  describe('add command', () => {
    it('should add a new task successfully', async () => {
      // initially the tasks should be empty
      let cmdOutput = await runCliCommand('list -j');
      let parsedStdout = JSON.parse(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(true);
      expect(parsedStdout.data).toHaveLength(0);
      expect(cmdOutput.stderr).toBe('');

      const command = `add -j -t "Integration Test Task" -d "Integration Test Description" --due ${getTomorrowDate()}`;
      cmdOutput = await runCliCommand(command);
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(true);
      expect(parsedStdout.data).toContain('Task Created:');
    });

    it('should fail to add a task with missing required options', async () => {
      const command = 'add -j -d "Missing title"';
      const cmdOutput = await runCliCommand(command);
      const parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(false);
      expect(parsedStdout.data).toContain('Title is required');
      expect(cmdOutput.stderr).toBe('');
    });

    it('should fail to add a task with invalid due date', async () => {
      const command = 'add -j -t "Invalid Date Task" -d "Description" --due invalid-date';
      const cmdOutput = await runCliCommand(command);
      const parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(false);
      expect(parsedStdout.data).toContain('Invalid date');
      expect(cmdOutput.stderr).toBe('');
    });
  });

  describe('list command', () => {
    it('should list all tasks in a table', async () => {
      let cmdOutput = await runCliCommand('list -j');
      let tasksResponse = parseCliOutput(cmdOutput.stdout);
      expect(tasksResponse.data).toHaveLength(0);
      expect(tasksResponse.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');

      await runCliCommand(`add -t "Task 1 to List" -d "Description 1" --due ${getTomorrowDate()}`);
      await runCliCommand(`add -t "Task 2 to List" -d "Description 2" --due ${getTomorrowDate()}`);

      cmdOutput = await runCliCommand('list -j');
      tasksResponse = parseCliOutput(cmdOutput.stdout);
      expect(tasksResponse.data).toHaveLength(2);
      expect(tasksResponse.data[0].title).toBe('Task 1 to List');
      expect(tasksResponse.data[1].title).toBe('Task 2 to List');
      expect(tasksResponse.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');
    });
  });

  describe('update command', () => {
    it('should update an existing task', async () => {
      // Add a task first to update
      let cmdOutput = await runCliCommand(`add -j -t "Task to Update" -d "Old Description" --due ${getTomorrowDate()}`);
      let parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toContain('Task Created:');
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');

      const createdId = parsedStdout.data.split('Task Created: ')[1];

      let updateCommand = `update ${createdId} -j -t "Updated Title" -d "New Description" --status Completed`;
      cmdOutput = await runCliCommand(updateCommand);
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toContain(`Task ${createdId} updated.`);
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');


      cmdOutput = await runCliCommand('list -j');
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toHaveLength(1);
      expect(parsedStdout.data[0].title).toBe('Updated Title');
      expect(parsedStdout.data[0].description).toBe('New Description');
      expect(parsedStdout.data[0].status).toBe('Completed');
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');

      updateCommand = `update ${createdId} -j -t "Updated title 2" -d "New Description" --status Pending`;
      cmdOutput = await runCliCommand(updateCommand);
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toContain(`Task ${createdId} updated.`);
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');

      cmdOutput = await runCliCommand('list -j');
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toHaveLength(1);
      expect(parsedStdout.data[0].title).toBe('Updated title 2');
      expect(parsedStdout.data[0].description).toBe('New Description');
      expect(parsedStdout.data[0].status).toBe('Pending');
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');

      // should update description with a falsy value like ""
      updateCommand = `update ${createdId} -j -t "Updated title 3" -d "" --status Pending`;
      cmdOutput = await runCliCommand(updateCommand);
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toContain(`Task ${createdId} updated.`);
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');

      cmdOutput = await runCliCommand('list -j');
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.data).toHaveLength(1);
      expect(parsedStdout.data[0].title).toBe('Updated title 3');
      expect(parsedStdout.data[0].description).toBe('');
      expect(parsedStdout.data[0].status).toBe('Pending');
      expect(parsedStdout.success).toBe(true);
      expect(cmdOutput.stderr).toBe('');
    });

    it('should not update if task ID is not found', async () => {
      const nonExistentTaskId = 'non-existent-id';
      const updateCommand = `update ${nonExistentTaskId} -j -t "Attempted Update"`;
      const cmdOutput = await runCliCommand(updateCommand);
      const parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(false);
      expect(parsedStdout.data).toContain('Task non-existent-id not found.');
    });
  });

  describe('delete command', () => {
    it('should delete an existing task', async () => {
      // Add a task to delete
      let cmdOutput = await runCliCommand(`add -j -t "Task to Delete" -d "Description for Delete" --due ${getTomorrowDate()}`);
      let parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(true);
      expect(parsedStdout.data).toContain('Task Created:');
      expect(cmdOutput.stderr).toBe('');

      const createdId = parsedStdout.data.split('Task Created: ')[1];

      cmdOutput = await runCliCommand('list -j');
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(true);
      expect(parsedStdout.data).toHaveLength(1);
      expect(parsedStdout.data[0].title).toBe('Task to Delete');
      expect(parsedStdout.data[0].description).toBe('Description for Delete');
      expect(parsedStdout.data[0].status).toBe('Pending');
      expect(cmdOutput.stderr).toBe('');

      const deleteCommand = `delete -j ${createdId}`;
      cmdOutput = await runCliCommand(deleteCommand);
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(true);
      expect(parsedStdout.data).toContain(`Task ${createdId} deleted.`);

      cmdOutput = await runCliCommand('list -j');
      parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(true);
      expect(parsedStdout.data).toHaveLength(0);
    });

    it('should handle delete command for non-existent task ID', async () => {
      const nonExistentTaskId = 'non-existent-delete-id';
      const deleteCommand = `delete -j ${nonExistentTaskId}`;
      const cmdOutput = await runCliCommand(deleteCommand);

      const parsedStdout = parseCliOutput(cmdOutput.stdout);
      expect(parsedStdout.success).toBe(false);
      expect(parsedStdout.data).toContain('Task non-existent-delete-id not found.');
      expect(cmdOutput.stderr).toBe('');
    });
  });
});