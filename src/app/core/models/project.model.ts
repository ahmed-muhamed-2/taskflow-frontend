import { Task } from './task.model';

export interface Project {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}