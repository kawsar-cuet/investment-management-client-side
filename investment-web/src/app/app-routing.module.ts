import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GroupsListComponent } from './features/groups/groups-list.component';
import { FamilyGroupListComponent } from './features/family-groups/family-group-list.component';
import { FamilyGroupDetailsComponent } from './features/family-groups/family-group-details.component';
import { FamiliesListComponent } from './features/families/families-list.component';
import { FamilyDetailsComponent } from './features/families/family-details.component';
import { MembersListComponent } from './features/members/members-list.component';
import { MemberDetailsComponent } from './features/members/member-details.component';
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
      { path: 'family-groups', component: FamilyGroupListComponent },
      { path: 'family-groups/:guid', component: FamilyGroupDetailsComponent },
      { path: 'families', component: FamiliesListComponent },
      { path: 'families/:guid', component: FamilyDetailsComponent },
      { path: 'members', component: MembersListComponent },
      { path: 'members/:guid', component: MemberDetailsComponent },
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
