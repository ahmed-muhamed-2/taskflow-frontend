import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Task, TaskPriority, TasksResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://asset-warmhearted-bird.abasthan.app/api';

  getTasks(): Observable<TasksResponse> {
    return this.http.get<TasksResponse>(`${this.apiUrl}/tasks`);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  createTask(data: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    projectId?: number;
  }): Observable<Task> {
    return this.http.post<Task>(
      `${this.apiUrl}/tasks`,
      data
    );
  }

  updateTask(
    id: number,
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
      projectId?: number;
      completed?: boolean;
    }
  ): Observable<Task> {
    return this.http.patch<Task>(
      `${this.apiUrl}/tasks/${id}`,
      data
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/tasks/${id}`
    );
  }
}