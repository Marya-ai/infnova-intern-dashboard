# INFNOVA Technologies Internship Applicant Management Dashboard

A high-fidelity, fully responsive, and secure internship applicant management dashboard built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. This project was developed as a practical challenge submission for the Frontend Internship at **INFNOVA Technologies** (Addis Ababa, Ethiopia).

🔗 **Live Demo**: https://infnova-intern-dashboard-raf7bwpl7-m20015794-2729s-projects.vercel.app/  
🔗 **Source Code**: https://github.com/Marya-ai/infnova-intern-dashboard

---

## 🚀 Key Features

- **Secure Administrator Authentication**: Complete login/logout workflows utilizing secure bearer-token authentication with a 1-hour expiration enforcement. Includes a **One-Click Demo Login** and **Remember Me** functionality for seamless reviewer testing.
- **Dynamic Visual Analytics**: Displays high-fidelity, custom-built SVG charts (a radial donut chart for application status pipelines and progress bars for track distributions) that are fully responsive, animated, and interactive.
- **Analytical Filter Binding**: Clicking any segment of the status donut chart or specialty track bar instantly applies that filter to the applicant listing below, creating a cohesive dashboard experience.
- **Interactive Listing Directory**: Features a searchable, paginated data grid with multi-field sorting, limit adjustments (5/10/20/50 rows), and multi-criteria filtering (Track, Status, Country, Experience).
- **Applicant Detailed Dossier**: Opens an animated slide-over panel displaying contact details, motivation statements, application dates, portfolio links, and an internal notes editor with real-time character counting.
- **Real-time Evaluative Actions**: 
  - **Optimistic UI Updates**: Candidate status changes (Pending, Shortlisted, Accepted, Rejected) update the UI instantly before the API responds, eliminating perceived latency. Automatically rolls back on failure.
  - **CSV Export**: One-click export of the currently filtered applicant list to a properly formatted CSV file for offline review.
- **Interactive Reviewer Testing Panel**: Dedicated toggle switches allowing reviewers to instantly test edge cases:
  1. **2s Latency Simulation**: Appends `?delay=2000` to requests to demonstrate clean **Skeleton Loading States** and spinners.
  2. **Force Server API Failure**: Appends `?simulateError=true` to demonstrate robust error boundary recovery and retry mechanisms.
- **Sandbox Reset System**: A "Reset Sandbox" utility that hits the `POST /session/reset` endpoint, letting reviewers clear changes and restore the pristine 52-record baseline with a single click, accompanied by a success toast notification.
- **Dark Mode Support**: A fully implemented light/dark theme toggle that persists user preference in `localStorage`, ensuring comfortable viewing in any environment.
- **Responsive Mobile Collapse**: Data-dense tables gracefully collapse into elegant, readable grid cards on smaller viewports for a flawless mobile experience.

---

## 🛠️ Tech Stack & Architecture Justifications

### Core Technologies
- **React 19 & TypeScript**: Chosen for native type safety, stable component trees, and modern hook patterns without the overhead of legacy class-based components.
- **Tailwind CSS v4**: Selected for its modern, high-performance styling engine. The native Vite plugin eliminates heavy PostCSS configurations, keeping the build pipeline lightweight and fast while ensuring design consistency.
- **motion/react (Framer Motion)**: Used specifically for the slide-over drawer, toast notifications, and layout transitions. It provides hardware-accelerated, declarative animations that significantly improve *perceived performance*.
- **Lucide React**: A lightweight, fully tree-shakeable SVG icon library ensuring visual consistency with zero bundle bloat.
- **Native `fetch` API**: For an application of this scope, heavy data-fetching libraries (like React Query or Axios) are overkill. Native `fetch` with `async/await` is lightweight, built into the browser, and perfectly sufficient for these RESTful CRUD operations.

### Architectural Layout
The codebase is structured into self-contained, modular components to prevent token-bloat and ease maintainability:
- `/src/types.ts`: Centralized interface schemas matching the backend OpenAPI payloads.
- `/src/components/Login.tsx`: Secured authentication page with feedback loops and demo credentials autofill.
- `/src/components/Header.tsx`: Header navbar displaying active administrator role, theme toggle, logout action, and quick sandbox reset.
- `/src/components/DashboardStats.tsx`: KPI cards and interactive SVG analytical graphs with null-safe data derivation.
- `/src/components/ApplicantsList.tsx`: Candidate grid handling pagination, multi-criteria filtering, sorting, CSV export, and the testing panel.
- `/src/components/ApplicantDetail.tsx`: Animated drawer displaying applicant details, notes editor, and status selectors with optimistic updates.
- `/src/App.tsx`: Central coordinator managing global state, local session caching, theme persistence, and reactive API re-fetches.

---

## ⚙️ Setup and Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Running Locally
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/Marya-ai/infnova-intern-dashboard.git
   cd infnova-intern-dashboard