import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { NewcityComponent } from './newcity/newcity';
import { CityComponent } from './city/city';
import { CompanyComponent } from './company/company';
import { RouteComponent } from './route/route';
import { authGuard } from './utils/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'newcity', component: NewcityComponent },
      { path: 'city/:id', component: CityComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'route', component: RouteComponent },
      { path: '', redirectTo: 'newcity', pathMatch: 'full' }
    ]
  }
];
