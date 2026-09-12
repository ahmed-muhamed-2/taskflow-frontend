import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TaskService } from '../../../core/services/task';
import { Task, TaskPriority } from '../../../core/models/task.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-details',
  imports: [RouterLink, DatePipe],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
})
export class TaskDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  readonly task = signal<Task | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage.set('Invalid task ID.');
      this.isLoading.set(false);
      return;
    }

    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.task.set(task);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load task:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to load task.'
        );

        this.isLoading.set(false);
      },
    });
  }

  deleteTask(): void {
    const currentTask = this.task();

    if (!currentTask) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(currentTask.id).subscribe({
      next: () => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Failed to delete task:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to delete task.'
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