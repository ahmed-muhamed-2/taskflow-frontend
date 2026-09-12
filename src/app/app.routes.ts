import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [

  // =========================
  // Auth
  // =========================

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.Login),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register')
        .then(m => m.Register),
  },


  // =========================
  // Application
  // =========================

  {
    path: '',
    canActivate: [authGuard],

    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard),
      },
      {
        path: 'tasks/new',
        loadComponent: () =>
          import('./features/tasks/task-form/task-form')
            .then(m => m.TaskForm),
      },
      {
        path: 'tasks/:id/edit',
        loadComponent: () =>
          import('./features/tasks/task-form/task-form')
            .then(m => m.TaskForm),
      },
      {
        path: 'tasks/:id',
        loadComponent: () =>
          import('./features/tasks/task-details/task-details')
            .then(m => m.TaskDetails),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/task-list/task-list')
            .then(m => m.TaskList),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/projects/project-form/project-form')
            .then(m => m.ProjectForm),
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () =>
          import('./features/projects/project-form/project-form')
            .then(m => m.ProjectForm),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-details/project-details')
            .then(m => m.ProjectDetails),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list/project-list')
            .then(m => m.ProjectList),
      },

    ],
  },


  // =========================
  // Fallback
  // =========================

  {
    path: '**',
    redirectTo: 'login',
  },

];