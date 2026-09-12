import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TaskService } from '../../../core/services/task';
import { Task, TaskPriority } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  imports: [RouterLink],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss',
})
export class TaskList {
  private readonly taskService = inject(TaskService);

  readonly tasks = signal<Task[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load tasks:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to load tasks.'
        );

        this.isLoading.set(false);
      }
    });
  }

  toggleCompleted(task: Task): void {
    this.taskService
      .updateTask(task.id, {
        completed: !task.completed
      })
      .subscribe({
        next: (updatedTask) => {
          this.tasks.update(tasks =>
            tasks.map(currentTask =>
              currentTask.id === updatedTask.id
                ? updatedTask
                : currentTask
            )
          );
        },
        error: (error) => {
          console.error('Failed to update task:', error);

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to update task.'
          );
        }
      });
  }

  deleteTask(task: Task): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks.update(tasks =>
          tasks.filter(currentTask =>
            currentTask.id !== task.id
          )
        );
      },
      error: (error) => {
        console.error('Failed to delete task:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to delete task.'
        );
      }
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