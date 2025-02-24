import { z } from 'zod';

/**
 * Schema definition for a Task entity using Zod.
 */
const TaskSchema = z.object({
  /** Unique identifier for the task. */
  id: z.string(),

  /** The title of the task (required, at least 3 characters). */
  title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),

  /** Optional description of the task. */
  description: z.string().optional(),

  /** Due date of the task (must be a valid date in the future). */
  dueDate: z.coerce.date().refine(
    (date) => date > new Date(),
    'Due date must be in the future'
  ),

  /** The status of the task, either 'Pending' or 'Completed'. */
  status: z.enum(['Pending', 'Completed']),
});

/**
 * Type representation of a Task based on the Zod schema.
 */
export type Itask = z.infer<typeof TaskSchema>;

/**
 * Schema for creating a new task, excluding `id` and `status` since they are system-assigned.
 */
const CreateTaskSchema = TaskSchema.omit({ id: true, status: true });

/**
 * Schema for updating an existing task, making all fields optional except `id`.
 */
const UpdateTaskSchema = TaskSchema.partial().omit({ id: true });

export { TaskSchema, CreateTaskSchema, UpdateTaskSchema };
