import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProjectService } from '../../../core/services/project';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  imports: [RouterLink],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
})
export class ProjectList {
  private readonly projectService = inject(ProjectService);

  readonly projects = signal<Project[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load projects:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to load projects.'
        );

        this.isLoading.set(false);
      },
    });
  }

  deleteProject(project: Project): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.projects.update(projects =>
          projects.filter(currentProject =>
            currentProject.id !== project.id
          )
        );
      },
      error: (error) => {
        console.error('Failed to delete project:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to delete project.'
        );
      },
    });
  }
}