import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/kanban/kanban.component').then(m => m.KanbanComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
