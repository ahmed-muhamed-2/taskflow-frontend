import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TaskService } from '../../core/services/task';
import { ProjectService } from '../../core/services/project';

import { Task } from '../../core/models/task.model';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);

  readonly tasks = signal<Task[]>([]);
  readonly projects = signal<Project[]>([]);

  readonly totalProjects = signal(0);

  readonly totalTasks = signal(0);
  readonly completedTasks = signal(0);
  readonly inProgressTasks = signal(0);

  readonly completionPercentage = computed(() => {
    const total = this.totalTasks();

    if (total === 0) {
      return 0;
    }

    return Math.round((this.completedTasks() / total) * 100);
  });

  readonly projectCompletionPercentage = computed(() => {
    const projects = this.projects();

    if (projects.length === 0) {
      return 0;
    }

    const projectsWithTasks = projects.filter(
      project => (project.tasks?.length ?? 0) > 0
    );

    if (projectsWithTasks.length === 0) {
      return 0;
    }

    const totalProjectTasks = projectsWithTasks.reduce(
      (total, project) => total + (project.tasks?.length ?? 0),
      0
    );

    const completedProjectTasks = projectsWithTasks.reduce(
      (total, project) =>
        total +
        (project.tasks?.filter(task => task.completed).length ?? 0),
      0
    );

    if (totalProjectTasks === 0) {
      return 0;
    }

    return Math.round(
      (completedProjectTasks / totalProjectTasks) * 100
    );
  });

  readonly stats = computed(() => [
    {
      title: 'Total Projects',
      value: this.totalProjects(),
      icon: '📁',
    },
    {
      title: 'Total Tasks',
      value: this.totalTasks(),
      icon: '✓',
    },
    {
      title: 'Completed',
      value: this.completedTasks(),
      icon: '🎯',
    },
    {
      title: 'In Progress',
      value: this.inProgressTasks(),
      icon: '⚡',
    },
  ]);

  ngOnInit(): void {
    this.loadTasks();
    this.loadProjects();
  }

  private loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks.data);

        this.totalTasks.set(tasks.data.length);

        this.completedTasks.set(
          tasks.data.filter(task => task.completed).length
        );

        this.inProgressTasks.set(
          tasks.data.filter(task => !task.completed).length
        );
      },

      error: (error) => {
        console.error('Failed to load tasks:', error);
      },
    });
  }

  private loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.totalProjects.set(projects.length);
      },

      error: (error) => {
        console.error('Failed to load projects:', error);
      },
    });
  }

  getProjectCompletedTasks(project: Project): number {
    return (
      project.tasks?.filter(task => task.completed).length ?? 0
    );
  }

  getProjectTotalTasks(project: Project): number {
    return project.tasks?.length ?? 0;
  }

  getProjectProgress(project: Project): number {
    const total = this.getProjectTotalTasks(project);

    if (total === 0) {
      return 0;
    }

    const completed = this.getProjectCompletedTasks(project);

    return Math.round((completed / total) * 100);
  }
}