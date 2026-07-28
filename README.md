# StudentOS 🚀

> **An all-in-one personal operating system for students to manage academics, productivity, and progress.**

StudentOS is a web-based desktop environment built to centralize student workflows. Instead of juggling multiple disconnected apps for notes, task management, focus timers, and study schedules, StudentOS brings everything into a clean, distraction-free, window-based operating system UI powered by AI.

---

## ✨ Features

### 🖥️ Desktop OS Experience
- **Window Management**: Multitask naturally with floating, draggable, and minimizable app windows.
- **Taskbar & Dock**: Launch apps quickly, switch between active windows, and check real-time system status.
- **Modern Aesthetic**: Glassmorphism UI styled with Tailwind CSS, smooth Framer Motion and GSAP animations, dark mode support.

### 📊 Dashboard App
- **Overview & Stats**: View daily productivity percentage, active study streak (days), completed tasks, and total focus time.
- **Visual Analytics**: Interactive task completion and productivity charts powered by Recharts.
- **Quick Glance**: Today's due tasks and upcoming exam deadlines at a glance.

### 📋 Task Management
- **Prioritization & Scheduling**: Categorize tasks by priority (*Low, Medium, High*) and assign due dates.
- **AI Task Breakdown**: Leverage Google Gemini to break down large assignments into actionable sub-tasks.
- **Status Tracking**: One-click completion toggles and progress indicators.

### 📝 Notes System
- **Rich Text Editor**: Full WYSIWYG note-taking powered by Tiptap (`@tiptap/react`).
- **Subject Categorization**: Organize notes into custom academic subjects.
- **AI Note Summarizer**: Automatically condense long study notes into clean HTML bulleted highlights using Gemini AI.

### 📅 AI Study Planner
- **Exam Preparation Generator**: Input a subject, exam date, and optional syllabus document to auto-generate a structured day-by-day study schedule.
- **Notes Context Integration**: Automatically scans existing subject notes to personalize the generated study roadmap.

### ⏱️ Focus Mode (Pomodoro Timer)
- **Distraction-Free Environment**: Customizable focus work intervals and break timers.
- **Task Integration**: Link current focus sessions directly to active tasks.
- **Background Soundscapes**: Integrated ambient sounds for deep concentration.

### 🔐 Authentication & Profile
- **Flexible Auth**: Powered by Better-Auth supporting Credentials (email/password) and OAuth (Google).
- **Settings & Logs**: Theme preference settings, profile details, and system activity logs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lucide Icons](https://lucide.dev/) |
| **Editor & Charts** | [Tiptap Editor](https://tiptap.dev/), [Recharts](https://recharts.org/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/), [Prisma 7 ORM](https://www.prisma.io/) (`@prisma/adapter-pg`) |
| **Authentication** | [Better Auth](https://www.better-auth.com/) |
| **AI Engine** | [Google Gemini 2.5 Flash](https://ai.google.dev/) via `@google/genai` |

---

## 📁 Project Structure

```text
studentOS/
├── actions/              # Next.js Server Actions (AI, Notes, Tasks, Stats, Subjects)
├── app/                  # Next.js App Router routes & layouts
│   ├── (auth)/           # Authentication pages (sign-in, sign-up, reset-password)
│   ├── (dashboard)/      # OS Desktop environment & main app window router
│   ├── api/              # API endpoints (Better-Auth, etc.)
│   └── generated/        # Prisma client build output
├── components/           # UI Components & Desktop Apps
│   ├── os-windows/       # OS Window Applications (Dashboard, Tasks, Notes, etc.)
│   └── landing-page.tsx  # Product Landing Page
├── lib/                  # Shared utility modules (Prisma client, Better-Auth config)
├── prisma/               # Database schema & migrations
├── public/               # Static assets & audio files
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies & scripts
└── prd.md                # Product Requirements Document
```
