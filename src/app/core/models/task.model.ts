export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface TasksResponse {
  data: Task[];
  meta: any;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: string;
  projectId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}