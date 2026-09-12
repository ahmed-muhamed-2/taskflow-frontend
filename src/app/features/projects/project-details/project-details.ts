import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ProjectService } from '../../../core/services/project';
import { Project } from '../../../core/models/project.model';
import { TaskPriority } from '../../../core/models/task.model';

@Component({
  selector: 'app-project-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './project-details.html',
  styleUrl: './project-details.scss',
})
export class ProjectDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectService = inject(ProjectService);

  readonly project = signal<Project | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage.set('Invalid project ID.');
      this.isLoading.set(false);
      return;
    }

    this.loadProject();
  }

  private loadProject(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.project.set(project);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load project:', error);

        this.errorMessage.set(
          error?.error?.message || 'Failed to load project.'
        );

        this.isLoading.set(false);
      },
    });
  }

  deleteProject(): void {
    const currentProject = this.project();

    if (!currentProject) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${currentProject.name}"?`
    );

    if (!confirmed) return;

    this.projectService.deleteProject(currentProject.id).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        console.error('Failed to delete project:', error);

        this.errorMessage.set(
          error?.error?.message || 'Failed to delete project.'
        );
      },
    });
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';

      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400';

      case TaskPriority.LOW:
        return 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400';

      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}