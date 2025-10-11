# AI Development Rules for Work & Invest App

This document outlines the core technologies and specific library usage guidelines to ensure consistency, maintainability, and best practices when developing for the Work & Invest application.

## Tech Stack Overview

*   **Frontend Framework**: React with TypeScript
*   **Styling**: Tailwind CSS v4
*   **UI Component Library**: shadcn/ui (built on Radix UI)
*   **Icons**: Lucide React
*   **Toast Notifications**: Sonner
*   **State Management**: React Context API (for global state)
*   **Backend**: Supabase (PostgreSQL database, Authentication, Edge Functions)
*   **API Server**: Hono (running on Supabase Edge Functions)
*   **Build Tool**: Vite

## Library Usage Guidelines

To maintain a consistent and efficient codebase, please adhere to the following rules for library usage:

1.  **React & TypeScript**:
    *   Always use React for building user interfaces.
    *   Always use TypeScript for all new and modified React components and utility files to ensure type safety.

2.  **Tailwind CSS**:
    *   **Mandatory for all styling.** All visual styling should be implemented using Tailwind CSS utility classes.
    *   Avoid inline styles or custom CSS files unless absolutely necessary for very specific, non-component-level overrides (which should be rare).

3.  **shadcn/ui**:
    *   **Prioritize shadcn/ui components** for all common UI elements (e.g., Button, Card, Input, Dialog, Tabs, Select, Switch, Progress, Avatar, Badge, Separator, AlertDialog, DropdownMenu).
    *   **Do NOT modify shadcn/ui component files directly.** If a component needs customization beyond what its props allow, create a new custom component that wraps or extends the shadcn/ui component, applying your custom styling or logic.

4.  **Lucide React**:
    *   **Use exclusively for all icons.** Import icons directly from `lucide-react`.

5.  **Sonner**:
    *   **Use for all toast notifications.** Import `toast` from `sonner` for displaying success, error, info, or warning messages to the user.

6.  **React Context API**:
    *   Utilize the Context API for managing global application state, such as user authentication status (`UserContext`), internationalization (`I18nContext`), and theme settings (`ThemeContext`).
    *   Avoid prop drilling by using contexts for widely shared data.

7.  **Supabase**:
    *   The backend is powered by Supabase. All data storage, authentication, and server-side logic (via Edge Functions) should interact with Supabase.
    *   Refer to `src/utils/api.tsx` for existing API integrations.

8.  **Hono**:
    *   The API server is built with Hono and deployed as Supabase Edge Functions. When extending backend functionality, follow the existing Hono patterns in `src/supabase/functions/server/index.tsx`.

9.  **File Structure**:
    *   **`src/pages/`**: For top-level views/routes (e.g., `Dashboard.tsx`, `Profile.tsx`).
    *   **`src/components/`**: For reusable UI components (e.g., `Button.tsx`, `Header.tsx`, `NotificationCenter.tsx`).
    *   **`src/utils/`**: For utility functions, API clients, internationalization (`i18n.tsx`), and theme management (`theme.tsx`).
    *   **`src/App.tsx`**: Contains the main application structure and routing logic.

10. **React Router**:
    *   The application uses a custom navigation system based on `onNavigate` props and `useState` for `currentPage` in `App.tsx`. Continue to use this pattern for routing between main application pages.

By following these guidelines, we ensure a cohesive, performant, and easily maintainable application.