# Home Care Service - Frontend

Modern Next.js frontend for the Home Care Service application.

## Features

- 🔐 JWT-based authentication
- 👥 Role-based UI (Client, Contractor, Admin)
- 📊 Interactive dashboard with stats
- 🛠️ Service catalog with filtering
- 📋 Task management with status tracking
- 🗓️ Schedule proposal and approval workflow
- 📱 Responsive design
- ⚡ Built with Next.js 14 and TypeScript

## Prerequisites

- Node.js (v18 or higher)
- Backend API running on `http://localhost:3001`

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will run on `http://localhost:3000`

## Demo Accounts

After seeding the backend database, you can login with:

- **Admin**: admin@homecare.com / Password123!
- **Client**: client@homecare.com / Password123!
- **Contractor**: contractor@homecare.com / Password123!

## Features by Role

### Client
- Browse service catalog
- Request services
- View and manage tasks
- Approve/reject contractor proposals
- View task history and invoices

### Contractor
- View assigned tasks
- Propose schedules
- Update task status
- Upload reports and photos

### Admin
- View all tasks
- Assign contractors
- Manage users
- System overview

## Project Structure

```
src/
├── app/
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── dashboard/          # Protected dashboard area
│       ├── page.tsx        # Dashboard home
│       ├── services/       # Service catalog
│       ├── tasks/          # Task management
│       └── calendar/       # Calendar view
├── contexts/
│   └── AuthContext.tsx     # Authentication state
├── lib/
│   ├── api.ts              # API client
│   └── auth.ts             # Auth utilities
└── app/
    └── globals.css         # Global styles
```

## Key Pages

- `/` - Redirects to login
- `/login` - User authentication
- `/signup` - New user registration
- `/dashboard` - Main dashboard (protected)
- `/dashboard/services` - Service catalog
- `/dashboard/tasks` - Task list
- `/dashboard/tasks/[id]` - Task details
- `/dashboard/calendar` - Calendar view

## API Integration

The frontend communicates with the backend API using axios with automatic JWT token injection. All API calls are made through the `src/lib/api.ts` client.

## Authentication Flow

1. User logs in via `/login`
2. JWT token is stored in localStorage
3. Token is automatically added to all API requests
4. Protected routes check for valid token
5. 401 responses automatically redirect to login

## Styling

The application uses a custom CSS design system with:
- CSS variables for theming
- Utility classes for common patterns
- Responsive breakpoints
- Status color coding (green/orange/red)

## Technologies

- Next.js 14 - React framework
- TypeScript - Type safety
- Axios - HTTP client
- CSS Modules - Component styling

## License

MIT
