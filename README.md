

# Task Manager CLI

This is a command-line task management application built with TypeScript, adhering to clean code principles. It allows users to create, list, update, and delete tasks. Data is persisted to a JSON file.

It is kind of an overkill for a simple application, a simpler architecture would likely have been sufficient but its main purpose is demonstration principles and how the code could be extended or modified in the future. In a **larger application**, the following improvements would be beneficial:

- **Custom Error Handling** – Implement custom error classes (e.g., `TaskNotFoundError`) to improve error management.
- **More Edge Cases in Tests** – Validate cases like updating tasks to empty strings or handling unusual characters.
- **Logging** – Integrate a logging library (e.g., Winston or Pino) for better debugging and monitoring.

These were **considered but not implemented** due to the project’s current scope.

## Architecture

- **Core (`src/domain` and `src/application`)**: Business logic and domain models (independent of storage/CLI).
- **Infrastructure (`src/infrastructure`)**: CLI and file-based persistence (adapters).
- **Dependency Injection**: `TaskService` depends on `ITaskRepository`, allowing different storage implementations.

## Prerequisites

* Node.js
* npm

## Installation

1. **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## Usage

The application is run from the command line.

### Running the Application

```bash
npm run dev -- [command] [options]
```

Or after building:

```bash
npm run build
npm run taskcli -- [command] [options]
```

### Commands

* **`add`**: Add a new task.

    ```bash
    npm run dev -- add -t "Task Title" -d "Task Description" --due 2024-12-31
    npm run dev -- add -j -t "Task Title" -d "Task Description" --due 2024-12-31  # JSON output
    ```

* `-t, --title <title>`:  The title of the task (required, minimum 3 characters).
* `-d, --description <description>`: The description of the task (required, minimum 5 characters).
* `--due <date>`: The due date of the task in YYYY-MM-DD format (required, must be in the future).
* `-j, --json`: Output in JSON format (optional, default is table format).

* **`list`**: List all tasks.

    ```bash
    npm run dev -- list
    npm run dev -- list -j # JSON output
    ```

* `-j, --json`: Output in JSON format (optional, default is table format).

* **`update <id>`**: Update an existing task.

    ```bash
    npm run dev -- update <task_id> -t "New Title" -d "New Description" --due 2025-01-15 --status Completed
    npm run dev -- update <task_id> -j -t "New Title"  # JSON output, update only title
    ```

* `<id>`: The ID of the task to update (required).
* `-t, --title <title>`: The new title of the task (optional).
* `-d, --description <description>`: The new description of the task (optional).
* `--due <date>`: The new due date of the task in YYYY-MM-DD format (optional).
* `--status <status>`: The new status of the task (Pending or Completed) (optional).
* `-j, --json`: Output in JSON format.

* **`delete <id>`**: Delete a task.

    ```bash
    npm run dev -- delete <task_id>
    npm run dev -- delete <task_id> -j  # JSON output
    ```

* `<id>`: The ID of the task to delete (required).
* `-j, --json`: Output in JSON format.

## Project Structure

```
├── README.md
├── eslint.config.mjs
├── jest.config.ts
├── package-lock.json
├── package.json
├── rclone.sh
├── src/
│   ├── application/
│   │   └── TaskService.ts
│   ├── config/
│   │   └── index.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── task.ts
│   │   │   └── tasks.schema.ts
│   │   └── ports/
│   │       └── ITaskRepository.ts
│   └── infraestructure/
│       ├── cli/
│       │   └── taskCLI.ts
│       └── persistence/
│           └── TaskRepository.ts
├── tests/
├── tsconfig.build.json
└── tsconfig.json
```


## Running Tests

```bash
npm test
```

## Environment Variables

These variables can be configured in a `.env` file at the project's root.

```
TASKS_FILE_PATH=.tasks
TASKS_FILE_NAME=tasks.json
```

The test environment variables are located at `tests/.env.test`
