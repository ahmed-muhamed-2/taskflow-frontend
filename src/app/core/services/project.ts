import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://asset-warmhearted-bird.abasthan.app/api';

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(
      `${this.apiUrl}/projects`
    );
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(
      `${this.apiUrl}/projects/${id}`
    );
  }

  createProject(data: {
    name: string;
    description?: string;
  }): Observable<Project> {
    return this.http.post<Project>(
      `${this.apiUrl}/projects`,
      data
    );
  }

  updateProject(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ): Observable<Project> {
    return this.http.patch<Project>(
      `${this.apiUrl}/projects/${id}`,
      data
    );
  }

  deleteProject(id: number): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/projects/${id}`
    );
  }
}