# SPOT-IT Admin Panel

The **SPOT-IT Admin Panel** is a comprehensive web interface designed for administrators to manage and monitor the road defect detection system. It allows for real-time tracking of reported issues, worker management, and a rewards system for community engagement.

## Features

- **Dashboard**:
  - Real-time overview of total complaints, workers, clients, and resolved issues.
  - Interactive map showing live locations of reported defects.
  - "Recent Problems" and "Recent Detections" lists for quick monitoring.
  - Fully responsive design optimized for desktop and mobile.

- **Complaints Management**:
  - View detailed lists of reported road defects (potholes, waterlogging, etc.).
  - Track status (Pending, Assigned, Resolved) and severity levels.
  - View attached images and location data.

- **Workers Management**:
  - Add, edit, and delete field workers.
  - Assign specific complaints to workers.
  - Monitor worker performance and task history.

- **Rewards System**:
  - Manage a detailed rewards catalog (e.g., coupons, vouchers).
  - Add, edit, and delete reward items.
  - Toggle reward status (Active/Inactive).
  - User-friendly modals for managing reward details with validation.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: CSS Modules, Responsive Design
- **State Management**: React Hooks (`useState`, `useEffect`)
- **API Integration**: [Axios](https://axios-http.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) / [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

## structured

```
src/
├── components/       # Reusable UI components
│   ├── Common/       # Loaders, Modals, Pagination
│   ├── Dashboard/    # Dashboard widgets, Map, StatCards
│   └── Layout/       # Sidebar, TopBar, Main Layout wrapper
├── pages/            # Next.js Pages (Routes)
│   ├── api/          # API routes (if applicable)
│   ├── _app.js       # Global app wrapper
│   ├── index.js      # Dashboard (Home)
│   ├── complaints.js # Complaints module
│   ├── workers.js    # Workers module
│   └── rewards.js    # Rewards module
└── styles/           # Global and Module CSS
    ├── globals.css   # Base styles
    └── ...           # Component-specific styles
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/spotit-admin.git
    cd spotit-admin
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up Environment Variables:
    Create a `.env.local` file in the root directory and add your API base URL:
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This is a standard Next.js application and can be deployed easily on [Vercel](https://vercel.com/) or any platform supporting Node.js apps.

```bash
npm run build
npm start
```

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
