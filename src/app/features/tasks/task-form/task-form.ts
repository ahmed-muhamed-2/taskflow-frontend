import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TaskService } from '../../../core/services/task';
import { ProjectService } from '../../../core/services/project';
import { TaskPriority } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isLoadingProjects = signal(false);
  readonly errorMessage = signal('');
  readonly projects = signal<Project[]>([]);

  private taskId: number | null = null;
  private selectedProjectId: number | null = null;
  readonly isLoadingTask = this.isLoading;

  readonly priorities = [
    TaskPriority.LOW,
    TaskPriority.MEDIUM,
    TaskPriority.HIGH,
  ];

  readonly taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    priority: [TaskPriority.MEDIUM, Validators.required],
    dueDate: [''],
    projectId: [0],
  });

  ngOnInit(): void {
    this.loadProjects();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.taskId = Number(id);
      this.isEditMode.set(true);
      this.loadTask(this.taskId);
    } else {
      const projectId = this.route.snapshot.queryParamMap.get('projectId');

      if (projectId) {
        this.selectedProjectId = Number(projectId);
        this.taskForm.patchValue({
          projectId: this.selectedProjectId,
        });
      }
    }
  }

  loadProjects(): void {
    this.isLoadingProjects.set(true);

    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.isLoadingProjects.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load projects.');
        this.isLoadingProjects.set(false);
      },
    });
  }

  loadTask(id: number): void {
    this.isLoading.set(true);

    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description ?? '',
          priority: task.priority,
          dueDate: task.dueDate
            ? task.dueDate.substring(0, 10)
            : '',
          projectId: task.projectId ?? 0,
        });

        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load task.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formValue = this.taskForm.getRawValue();

    const data = {
      title: formValue.title,
      description: formValue.description || undefined,
      priority: formValue.priority,
      dueDate: formValue.dueDate || undefined,
      projectId: formValue.projectId || undefined,
    };

    if (this.isEditMode() && this.taskId) {
      this.taskService.updateTask(this.taskId, data).subscribe({
        next: () => {
          this.router.navigate(['/tasks', this.taskId]);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message || 'Failed to update task.'
          );
          this.isLoading.set(false);
        },
      });

      return;
    }

    this.taskService.createTask(data).subscribe({
      next: (task) => {
        this.router.navigate(['/tasks', task.id]);
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.message || 'Failed to create task.'
        );
        this.isLoading.set(false);
      },
    });
  }
}