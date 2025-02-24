const tasksFilePath = process.env.TASKS_FILE_PATH;
const tasksFileName = process.env.TASKS_FILE_NAME;

if (!tasksFilePath) {
  throw new Error('Missing TASKS_FILE_PATH environment variable');
}

if (!tasksFileName) {
  throw new Error('Missing TASKS_FILE_NAME environment variable');
}

export const config = {
  tasksFilePath,
  tasksFileName,
};