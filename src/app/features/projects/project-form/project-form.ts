import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { ProjectService } from '../../../core/services/project';

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './project-form.html',
  styleUrl: './project-form.scss',
})
export class ProjectForm {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isEditMode = signal(false);
  readonly isLoading = signal(false);
  readonly isLoadingProject = signal(false);
  readonly errorMessage = signal('');

  private projectId: number | null = null;

  readonly projectForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2)
    ]],

    description: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.projectId = Number(id);
      this.isEditMode.set(true);
      this.loadProject();
    }
  }

  private loadProject(): void {
    if (!this.projectId) {
      return;
    }

    this.isLoadingProject.set(true);
    this.errorMessage.set('');

    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description ?? '',
        });

        this.isLoadingProject.set(false);
      },

      error: (error) => {
        console.error('Failed to load project:', error);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to load project.'
        );

        this.isLoadingProject.set(false);
      },
    });
  }

  saveProject(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formValue = this.projectForm.getRawValue();

    const data = {
      name: formValue.name,
      description: formValue.description || undefined,
    };

    if (this.isEditMode() && this.projectId) {
      this.updateProject(data);
    } else {
      this.createProject(data);
    }
  }

  private createProject(data: {
    name: string;
    description?: string;
  }): void {
    this.projectService.createProject(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/projects']);
      },

      error: (error) => {
        console.error('Failed to create project:', error);

        this.isLoading.set(false);

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to create project.'
        );
      },
    });
  }

  private updateProject(data: {
    name: string;
    description?: string;
  }): void {
    this.projectService
      .updateProject(this.projectId!, data)
      .subscribe({
        next: () => {
          this.isLoading.set(false);

          this.router.navigate([
            '/projects',
            this.projectId
          ]);
        },

        error: (error) => {
          console.error('Failed to update project:', error);

          this.isLoading.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to update project.'
          );
        },
      });
  }
}