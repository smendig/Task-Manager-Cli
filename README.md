# **Task Manager CLI**

This is a command-line task management application built with TypeScript, adhering to clean code principles. It allows users to create, list, update, and delete tasks. Data is persisted to a JSON file.

It is kind of an **overkill** for a simple application, a simpler architecture would likely have been sufficient but its main purpose is to **demonstrate principles** and how the code could be **extended or modified in the future**.  

In a **larger application**, the following improvements would be beneficial:

- **Custom Error Handling** – Implement custom error classes (e.g., `TaskNotFoundError`) to improve error management.
- **More Edge Cases in Tests** – Validate cases like updating tasks to empty strings or handling unusual characters.
- **Logging** – Integrate a logging library (e.g., Winston or Pino) for better debugging and monitoring.

These were **considered but not implemented** due to the project’s current scope.

---

## **🛠 Architecture**

- **Core (`src/domain` and `src/application`)**: Business logic and domain models (independent of storage/CLI).
- **Infrastructure (`src/infrastructure`)**: CLI and file-based persistence (adapters).
- **Dependency Injection**: `TaskService` depends on `ITaskRepository`, allowing different storage implementations.

---

## **📦 Installation**
### **1️⃣ Clone the repository**
```bash
git clone <repository_url>
cd <project_directory>
```

### **2️⃣ Install dependencies**
```bash
npm install
```

---

## **▶ Usage**
The application runs from the command line.

### **Running the Application**
```bash
npm run dev -- [command] [options]
```

Or after building:

```bash
npm run build
npm run taskcli -- [command] [options]
```

---

## **📝 Commands**
### **1️⃣ Add Task**
```bash
npm run dev -- add -t "Task Title" -d "Task Description" --due 2024-12-31
npm run dev -- add -j -t "Task Title" -d "Task Description" --due 2024-12-31  # JSON output
```
| Option | Description |
|--------|-------------|
| `-t, --title <title>` | **(Required)** Task title (min. 3 characters). |
| `-d, --description <description>` | **(Optional)** Task description. |
| `--due <date>` | **(Required)** Due date (`YYYY-MM-DD`, must be in the future). |
| `-j, --json` | **(Optional)** Output in JSON format instead of a table. |

---

### **2️⃣ List Tasks**
```bash
npm run dev -- list
npm run dev -- list -j  # JSON output
```

| Option | Description |
|--------|-------------|
| `-j, --json` | **(Optional)** Output in JSON format. |

---

### **3️⃣ Update Task**
```bash
npm run dev -- update <task_id> -t "New Title" -d "New Description" --due 2025-01-15 --status Completed
npm run dev -- update <task_id> -j -t "New Title"  # JSON output, update only title
```

| Option | Description |
|--------|-------------|
| `<id>` | **(Required)** Task ID. |
| `-t, --title <title>` | **(Optional)** New task title. |
| `-d, --description <description>` | **(Optional)** New description. |
| `--due <date>` | **(Optional)** New due date (`YYYY-MM-DD`). |
| `--status <status>` | **(Optional)** Task status (`Pending` or `Completed`). |
| `-j, --json` | **(Optional)** Output in JSON format. |

---

### **4️⃣ Delete Task**
```bash
npm run dev -- delete <task_id>
npm run dev -- delete <task_id> -j  # JSON output
```

| Option | Description |
|--------|-------------|
| `<id>` | **(Required)** Task ID to delete. |
| `-j, --json` | **(Optional)** Output in JSON format. |

---

## **📂 Project Structure**
```
├── README.md
├── eslint.config.mjs
├── jest.config.ts
├── package-lock.json
├── package.json
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

---

## **🧪 Running Tests**
```bash
npm test
```

---

## **🔬 Testing Approach**
This project includes **two different approaches to testing**:

### **1️⃣ Integration Tests (CLI Execution)**
- **Directly calls the CLI using `exec` in Jest tests**.
- **No mocking** – Uses **real execution** to validate full program behavior.
- **Custom test environment (`tests/.env.test`)** ensures:
  - A **separate JSON file is used for test data**.
  - No interference with actual user data.
- **Jest `setupFiles`** is used to load the `.env.test` config.

---

### **2️⃣ Unit Tests (Mocked Dependencies)**
- **Mocks the repository (`jest.Mocked<ITaskRepository>`)**.
- **Injects mocked repository** into `TaskService`.
- Focuses on **business logic** without interacting with the actual storage.

---

## **⚙ Environment Variables**
These variables can be configured in a `.env` file at the project's root.

```
TASKS_FILE_PATH=.tasks
TASKS_FILE_NAME=tasks.json
```

For tests, a **separate environment file** (`tests/.env.test`) is used.
