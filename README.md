# INFNOVA Technologies Internship Applicant Management Dashboard

A high-fidelity, fully responsive, and secure internship applicant management dashboard built with **React 19**, **TypeScript**, and **Tailwind CSS v4**. This project was developed as a practical challenge submission for the Frontend Internship at **INFNOVA Technologies** (Addis Ababa, Ethiopia).

🔗 **Live Demo**: https://infnova-intern-dashboard-raf7bwpl7-m20015794-2729s-projects.vercel.app/  
🔗 **Source Code**: https://github.com/Marya-ai/infnova-intern-dashboard

---

## 🚀 Key Features

- **Secure Administrator Authentication**: Complete login/logout workflows utilizing secure bearer-token authentication with a 1-hour expiration enforcement. Includes "Remember Me" functionality for seamless reviewer testing.
- **Dynamic Visual Analytics**: Displays high-fidelity, custom-built SVG charts (a radial donut chart for application status pipelines and progress bars for track distributions) that are fully responsive, animated, and interactive.
- **Analytical Filter Binding**: Clicking any segment of the status donut chart or specialty track bar instantly applies that filter to the applicant listing below.
- **Interactive Listing Directory**: Features a searchable, paginated data grid with multi-field sorting, limit adjustments (5/10/20/50 rows), and multi-criteria filtering.
- **Applicant Detailed Dossier**: Opens an animated slide-over panel displaying contact details, motivation statements, application dates, portfolio links, and an internal notes editor.
- **Real-time Evaluative Actions**: Optimistic UI updates for status changes and one-click CSV export.
- **Interactive Reviewer Testing Panel**: Toggle switches for 2s latency simulation and force error testing.
- **Sandbox Reset System**: Restore the pristine 52-record baseline with a single click.
- **Dark Mode Support**: Light/dark theme toggle with localStorage persistence.
- **Responsive Mobile Collapse**: Tables collapse into readable cards on mobile.

---

## 🛠️ Tech Stack & Architecture

- **React 19 & TypeScript**: Native type safety and modern hooks.
- **Tailwind CSS v4**: Modern styling engine.
- **motion/react**: Hardware-accelerated animations.
- **Lucide React**: Lightweight icon library.
- **Native fetch API**: Lightweight RESTful operations.

---

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Running Locally
1. Clone and install:
   ```bash
   git clone https://github.com/Marya-ai/infnova-intern-dashboard.git
   cd infnova-intern-dashboard
   npm install
   npm run dev

###  Future Improvements
- **AI-Powered Assistant**: Auto-summarize motivation statements and suggest interview questions.
- **Automated Email Workflows**: Send status change notifications to candidates.
- **Role-Based Access Control (RBAC)**: Granular permissions for different user types.
- **Comprehensive Audit Logs**: Track all user actions for accountability.

Submitted by Marya Tadesse - Frontend Internship Candidate
INFNOVA Technologies