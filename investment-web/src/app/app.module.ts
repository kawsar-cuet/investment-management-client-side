import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { RegisterComponent } from './features/auth/register/register.component';
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

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    HeaderComponent,
    SidebarComponent,
    MainLayoutComponent,
    RegisterComponent,
    GroupsListComponent,
    FamilyGroupListComponent,
    FamilyGroupDetailsComponent,
    FamiliesListComponent,
    FamilyDetailsComponent,
    MembersListComponent,
    MemberDetailsComponent,
    DepositsListComponent,
    ReportsComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
