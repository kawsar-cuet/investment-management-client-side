# 📦 Phase 1: Project Setup & Architecture

## Overview
This phase focuses on setting up the Angular project with best practices, configuring the development environment, and establishing the project architecture.

**Duration:** Week 1 (5-7 days)  
**Goal:** Have a fully configured, running Angular application with Material Design and Tailwind CSS

---

## Prerequisites

### Required Software
- [x] Node.js 18+ LTS ([Download](https://nodejs.org/))
- [x] npm 9+ or yarn 1.22+
- [x] Angular CLI 17+ (`npm install -g @angular/cli@latest`)
- [x] Git
- [x] VS Code (recommended) with extensions:
  - Angular Language Service
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Angular Snippets

### Verify Installation
```bash
node --version    # Should be v18.x or higher
npm --version     # Should be 9.x or higher
ng version        # Should show Angular CLI 17.x
```

---

## Step 1: Create Angular Project

### 1.1 Initialize Project
```bash
# Navigate to your workspace
cd "d:\New folder (3)\investment-management-platform"

# Create Angular project with standalone components
ng new investment-web --standalone --routing --style=scss --skip-git

# Navigate into project
cd investment-web
```

**Configuration Options:**
- Would you like to add Angular routing? **Yes**
- Which stylesheet format would you like to use? **SCSS**
- Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? **No**

### 1.2 Project Structure
After creation, you'll have:
```
investment-web/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Root component
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing configuration
│   ├── assets/                   # Static assets
│   ├── index.html                # Main HTML
│   ├── main.ts                   # Bootstrap
│   └── styles.scss               # Global styles
├── angular.json                  # Angular configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md
```

---

## Step 2: Install Dependencies

### 2.1 Angular Material
```bash
ng add @angular/material

# Configuration:
# ? Choose a prebuilt theme: Indigo/Pink
# ? Set up global Angular Material typography styles? Yes
# ? Include the Angular animations module? Include and enable animations
```

### 2.2 Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### 2.3 Additional Dependencies
```bash
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
npm install chart.js ng2-charts
npm install date-fns
npm install uuid
npm install @types/uuid --save-dev
npm install file-saver
npm install @types/file-saver --save-dev
npm install lodash-es
npm install @types/lodash-es --save-dev
```

### 2.4 Development Dependencies
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D husky lint-staged
npm install -D @angular-devkit/build-angular
```

---

## Step 3: Configure Tailwind CSS

### 3.1 Update `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1976D2',  // Main primary
          600: '#1565C0',
          700: '#0D47A1',
          800: '#0D47A1',
          900: '#0D3D66',
        },
        secondary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#388E3C',  // Main secondary
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#1B5E20',
          900: '#0D3D1F',
        },
        accent: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9800',  // Main accent
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'material': '0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)',
        'material-lg': '0 4px 8px rgba(0,0,0,0.12), 0 12px 24px rgba(0,0,0,0.16)',
      }
    },
    screens: {
      'xs': '0px',
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
      '2xl': '1400px',
    }
  },
  plugins: [],
}
```

### 3.2 Update `src/styles.scss`
```scss
/* Import Tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

/* Angular Material Theme */
@use '@angular/material' as mat;

$custom-primary: mat.define-palette(mat.$indigo-palette, 700);
$custom-accent: mat.define-palette(mat.$orange-palette, 500);
$custom-warn: mat.define-palette(mat.$red-palette);

$custom-theme: mat.define-light-theme((
  color: (
    primary: $custom-primary,
    accent: $custom-accent,
    warn: $custom-warn,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($custom-theme);

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #212121;
  background-color: #F5F5F5;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
}

/* Custom Utilities */
.font-heading {
  font-family: 'Poppins', sans-serif;
}

.font-mono {
  font-family: 'Roboto Mono', monospace;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Loading Spinner */
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Responsive utilities */
@media (max-width: 767px) {
  body {
    font-size: 13px;
  }
}
```

---

## Step 4: Configure TypeScript

### 4.1 Update `tsconfig.json`
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": [
      "ES2022",
      "dom"
    ],
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@layout/*": ["src/app/layout/*"],
      "@env/*": ["src/environments/*"]
    }
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

---

## Step 5: Setup Linting & Formatting

### 5.1 Create `.eslintrc.json`
```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "prettier"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "app",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "app",
            "style": "kebab-case"
          }
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "warn"
      }
    },
    {
      "files": ["*.html"],
      "extends": [
        "plugin:@angular-eslint/template/recommended",
        "plugin:@angular-eslint/template/accessibility"
      ],
      "rules": {}
    }
  ]
}
```

### 5.2 Create `.prettierrc`
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

### 5.3 Create `.prettierignore`
```
node_modules
dist
coverage
.angular
```

### 5.4 Update `package.json` scripts
```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint",
    "format": "prettier --write \"src/**/*.{ts,html,scss,json}\"",
    "format:check": "prettier --check \"src/**/*.{ts,html,scss,json}\""
  }
}
```

---

## Step 6: Create Project Structure

### 6.1 Create Folders
```bash
# Core module
mkdir -p src/app/core/auth
mkdir -p src/app/core/guards
mkdir -p src/app/core/interceptors
mkdir -p src/app/core/services
mkdir -p src/app/core/models
mkdir -p src/app/core/constants

# Shared module
mkdir -p src/app/shared/components
mkdir -p src/app/shared/directives
mkdir -p src/app/shared/pipes
mkdir -p src/app/shared/utils

# Features
mkdir -p src/app/features/dashboard
mkdir -p src/app/features/groups
mkdir -p src/app/features/families
mkdir -p src/app/features/members
mkdir -p src/app/features/deposits
mkdir -p src/app/features/reports
mkdir -p src/app/features/settings
mkdir -p src/app/features/auth

# Layout
mkdir -p src/app/layout/header
mkdir -p src/app/layout/sidebar
mkdir -p src/app/layout/footer
mkdir -p src/app/layout/main-layout

# Environments
mkdir -p src/environments
```

### 6.2 Create Environment Files

**`src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Investment Management Platform',
  version: '1.0.0',
};
```

**`src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  appName: 'Investment Management Platform',
  version: '1.0.0',
};
```

---

## Step 7: Configure Angular Material

### 7.1 Create Custom Material Theme

**`src/styles/_material-theme.scss`**
```scss
@use '@angular/material' as mat;

// Define custom palettes
$app-primary: mat.define-palette(mat.$indigo-palette, 700, 500, 900);
$app-accent: mat.define-palette(mat.$orange-palette, 500, 300, 700);
$app-warn: mat.define-palette(mat.$red-palette);

// Create light theme
$app-light-theme: mat.define-light-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
    warn: $app-warn,
  ),
  typography: mat.define-typography-config(
    $font-family: 'Inter, sans-serif',
    $headline-1: mat.define-typography-level(32px, 48px, 700),
    $headline-2: mat.define-typography-level(28px, 36px, 600),
    $headline-3: mat.define-typography-level(24px, 32px, 600),
    $headline-4: mat.define-typography-level(20px, 28px, 600),
    $body-1: mat.define-typography-level(14px, 20px, 400),
    $body-2: mat.define-typography-level(14px, 24px, 500),
  ),
  density: 0,
));

// Create dark theme
$app-dark-theme: mat.define-dark-theme((
  color: (
    primary: $app-primary,
    accent: $app-accent,
    warn: $app-warn,
  ),
));

// Apply light theme by default
@include mat.all-component-themes($app-light-theme);

// Dark theme class
.dark-theme {
  @include mat.all-component-colors($app-dark-theme);
  
  background-color: #121212;
  color: #E0E0E0;
}
```

---

## Step 8: Setup Routing

### 8.1 Update `app.routes.ts`
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'groups',
    loadChildren: () => import('./features/groups/groups.routes').then(m => m.GROUPS_ROUTES),
  },
  {
    path: 'families',
    loadChildren: () => import('./features/families/families.routes').then(m => m.FAMILIES_ROUTES),
  },
  {
    path: 'members',
    loadChildren: () => import('./features/members/members.routes').then(m => m.MEMBERS_ROUTES),
  },
  {
    path: 'deposits',
    loadChildren: () => import('./features/deposits/deposits.routes').then(m => m.DEPOSITS_ROUTES),
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
```

---

## Step 9: Update App Component

### 9.1 `app.component.ts`
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class AppComponent {
  title = 'Investment Management Platform';
}
```

---

## Step 10: Create Core Services

### 10.1 Base API Service

**`src/app/core/services/api.service.ts`**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }
}
```

---

## Step 11: Run & Verify

### 11.1 Start Development Server
```bash
ng serve
```

Open browser: `http://localhost:4200`

### 11.2 Verify Installation
- [ ] App loads without errors
- [ ] Angular Material styles applied
- [ ] Tailwind CSS working
- [ ] No console errors
- [ ] Responsive layout

### 11.3 Build Test
```bash
ng build
```

Should complete without errors.

---

## Step 12: Git Setup

### 12.1 Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: Phase 1 setup complete"
```

### 12.2 Create `.gitignore` (should already exist)
```
# Dependencies
node_modules/

# Build outputs
/dist
/tmp
/out-tsc

# IDEs
.idea/
.vscode/
*.swp
*.swo

# Misc
.DS_Store
Thumbs.db
.env
*.log
```

---

## ✅ Phase 1 Checklist

- [ ] Angular project created with standalone components
- [ ] Angular Material installed and configured
- [ ] Tailwind CSS installed and configured
- [ ] TypeScript strict mode enabled
- [ ] Path aliases configured
- [ ] ESLint & Prettier setup
- [ ] Project folder structure created
- [ ] Environment files configured
- [ ] Routing structure defined
- [ ] Base API service created
- [ ] Custom Material theme created
- [ ] Global styles configured
- [ ] Development server running
- [ ] Production build successful
- [ ] Git repository initialized

---

## 🎯 Next Steps

**After completing Phase 1, move to:**
- **Phase 2:** Core Services & API Integration
- Create models and interfaces
- Setup NgRx state management
- Create HTTP interceptors
- Implement authentication service

---

## 📚 Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NgRx Documentation](https://ngrx.io/docs)
- [RxJS Documentation](https://rxjs.dev/)

---

**Phase 1 Complete! Ready to start Phase 2!** 🚀
