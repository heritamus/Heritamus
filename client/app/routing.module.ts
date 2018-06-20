import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { GraphComponent } from './graph/graph.component';
import { AdminComponent } from './admin/admin.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AppPageComponent } from './app-page/app-page.component';
import { HomePageComponent } from './home-page/home-page.component';

import { AuthGuardLogin } from './services/auth-guard-login.service';
import { AuthGuardAdmin } from './services/auth-guard-admin.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/app/graph',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomePageComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'register',
        component: RegisterComponent
      },
    ]
  },
  {
    path: 'app',
    component: AppPageComponent,
    children: [
      {
        path: '',
        redirectTo: 'graph',
        pathMatch: 'full'
      },
      {
        path: 'graph',
        component: GraphComponent,
      },
      {
        path: 'account',
        component: AccountComponent,
        canActivate: [AuthGuardLogin]
      },
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuardAdmin]
      },
    ]
  },
  {
    path: '**',
    component: NotFoundComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class RoutingModule {
}
