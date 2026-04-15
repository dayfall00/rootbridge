# RootBridge

RootBridge is a role-based React application built with **Vite**, **React Router**, **Firebase**, **Tailwind CSS**, and **i18next**.  
It includes onboarding/auth flows and multiple user modules (Customer, Worker, Artisan, Shopkeeper/Business), with guards and layouts controlling access.

## Tech Stack

- **React** (UI)
- **Vite** (dev server + build tooling)
- **React Router** (routing)
- **Firebase** (Auth, Firestore, Storage)
- **Tailwind CSS** (styling)
- **i18next + react-i18next** (internationalization)

Key dependencies are defined in `package.json`.

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (or your preferred package manager)

### Install
```bash
npm install
```

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## Environment Variables (Firebase)

Firebase is initialized in `src/services/firebase.js` using Vite environment variables (`import.meta.env`).

Create a `.env` file in the project root with:

```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

> Do **not** commit `.env` files to the repository.

## App Entry Points

- `src/main.jsx` mounts the React app and initializes i18n.
- `src/App.jsx` defines routing, providers, and guards.

## Routing Overview

Routing is defined in `src/App.jsx` and uses:

- Public pages:
  - `/` (Landing)
  - `/login`
  - `/register`
  - `/verify-otp`
- Post-login redirect:
  - `/redirect` (smart role-based redirect after login/verification)

There are also protected onboarding routes and role-based dashboards/sections for:
- Customer
- Worker
- Artisan
- Business / Shopkeeper

### Centralized Route Constants

Route constants live in:

- `src/constants/routes.js`

This file provides:
- `ROUTES`: canonical paths
- `ROLE_HOME`: role → “home” mapping (where a role lands after login)
- `ROLE_PROFILE`: role → profile path mapping

If you add/change a route, update `routes.js` to keep navigation consistent across the app.

## Authentication & User State

The app uses two providers in `src/App.jsx`:

- `AuthProvider` (`src/context/AuthContext`)  
  Responsible for authentication state and actions (login/logout, etc).

- `UserProvider` (`src/context/UserContext`)  
  Responsible for user profile data (like role, name, avatar/profile image, etc).

> Implementation details live in the context files (not shown in this README); document them further if you want contributor-level clarity.

## Guards & Layouts

The routing layer references several guards/layout components:

- `ProtectedRoute` (general protection)
- `WorkerGuard`, `ShopkeeperGuard`, `ArtisanGuard`, `CustomerGuard` (role-based protection)
- `Layout`, plus role-specific layouts (e.g., `WorkerLayout`, `ArtisanLayout`, `ShopkeeperLayout`)

These control which routes are accessible depending on:
- whether the user is authenticated
- which primary role the user has

## UI Components

### Navbar
`src/components/Navbar.jsx` includes:
- a search input
- role-aware profile navigation using `ROLE_PROFILE`
- language switcher (via `i18next`)
- logout handling (via `AuthContext`)

## Internationalization (i18n)

i18n is initialized in:

- `src/i18n/index.js`

It loads translations from JSON files (examples observed):
- English (`en`)
- Hindi (`hi`)
- Bengali (`bn`)
- Marathi (`mr`)
- Tamil (`ta`)

Language selection behavior:
- Uses saved `lang` from `localStorage` if present
- Otherwise uses browser language detection (defaults to `en`)
- Persists changes back to `localStorage`

## Styling

- Tailwind is imported via `src/index.css`.
- The file also sets global behaviors (like smooth scrolling and anchor offset handling).

## Utilities

### Normalization Helpers
`src/utils/normalize.js` provides small normalization helpers:
- `normalizeString`
- `normalizeCity`
- `normalizeRole` (validates role against `ROLES`)
- `normalizeCategory`

## Project Structure (High-Level)

A simplified view of what’s in `src/`:

- `src/App.jsx` — routing, providers, guards
- `src/main.jsx` — app bootstrap
- `src/components/` — shared components (Navbar, ProtectedRoute, etc.)
- `src/context/` — Auth/User providers
- `src/constants/` — routes, enums/constants
- `src/services/` — Firebase integration
- `src/i18n/` — translations and i18n setup
- `src/modules/` — feature modules by domain/role

## Contributing

Suggested workflow:
1. Create a feature branch
2. Run `npm run lint` before pushing
3. Open a PR with a clear description and screenshots when applicable

(If you want, I can also draft `CONTRIBUTING.md` and a PR template.)

## License

Add a `LICENSE` file if you plan to open-source this project. If it’s private/internal, you can omit it.
