import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GroupsListComponent } from './features/groups/groups-list.component';
import { FamiliesListComponent } from './features/families/families-list.component';
import { MembersListComponent } from './features/members/members-list.component';
import { DepositsListComponent } from './features/deposits/deposits-list.component';
import { ReportsComponent } from './features/reports/reports.component';
import { SettingsComponent } from './features/settings/settings.component';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'groups', component: GroupsListComponent },
      { path: 'families', component: FamiliesListComponent },
      { path: 'members', component: MembersListComponent },
      { path: 'deposits', component: DepositsListComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
