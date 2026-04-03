# Product Requirements Document (PRD): StudentOS 🚀

## 1. Product Overview
**One-liner:** "An all-in-one personal operating system for students to manage academics, productivity, and progress."

**Objective:** To provide students with a clean, centralized, and minimal application to manage their study requirements, track their daily progress, and utilize lightweight AI tools to enhance productivity without feeling overwhelmed by complex features.

## 2. Tech Stack & Architecture
- **Framework:** Next.js (App Router)
- **Database Engine:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Better Auth (with Prisma adapter)
- **Styling & UI:** Tailwind CSS, shadcn/ui (for clean, minimal components and charts)
- **AI Provider:** Gemini AI (via `@google/genai` or Vercel AI SDK)

## 3. Core Features (Step 1)

### 3.1. Dashboard (The "Wow" Screen)
The primary landing page acting as an aggregator of the student's day.
- **Today’s Tasks:** List of tasks due today.
- **Upcoming Deadlines:** Highlights of assignments or exams approaching.
- **Quick Stats:**
  - Total tasks completed.
  - Current continuous activity streak (days).
  - Productivity % (Tasks completed / Tasks assigned over a period).

### 3.2. Tasks System
A clean, straightforward task management system.
- **Features:** 
  - Add, edit, and delete tasks.
  - Assign Due Dates and Priority (Low, Medium, High).
  - Quick toggle to mark a task as complete.
- **Constraint:** Keep the UI strictly simple—avoid deep sub-tasks or complex tags.

### 3.3. Notes System
A categorized area for academic documentation.
- **Features:**
  - Subject-wise categorization (folders or tags).
  - Simple WYSIWYG or Markdown editor consisting strictly of a Title and Content area.

### 3.4. Study Planner
An automated timeline generator for exam prep.
- **Input parameters:** `Subject` and `Exam Date`.
- **Output:** An auto-generated daily plan leading up to the exam date (Powered by AI - see Sec 4.1).

### 3.5. Progress Tracker
Visual representations of student productivity.
- **Features:**
  - Weekly completion percentage calculation.
  - Simple graphical charts (utilizing Recharts via shadcn/ui) showing tasks completed over the week vs. pending tasks.

## 4. Light AI Features (Step 2 - Gemini Integration)
*Strictly limited to 2 high-impact features to avoid scope creep and UX bloat.*

### 4.1. AI Study Plan Generator
- **Location:** Integrated directly into the Study Planner module.
- **Mechanism:** Takes the user's Subject and Exam Date, sending the following prompt to Gemini:
  > *"Create a 7-day study plan for [Subject] before [Exam Date]."*
- **Output Format:** Structured daily breakdown rendered directly in the planner view.

### 4.2. Notes Summarizer
- **Location:** Inside the Notes System editor.
- **Mechanism:** A simple "Summarize" button converts long-form text notes into concise bullet points.
- **Prompt Logic:** Sends the existing note content to Gemini with instructions to extract key concepts and format as bulleted highlights.

## 5. Preliminary Database Schema (Prisma)
A normalized, minimal schema to support the above features.

- **User / Auth Tables:** Setup via better-auth Prisma adapter.
- **Subject:** `id`, `name`, `userId`
- **Task:** `id`, `title`, `dueDate`, `priority`, `isCompleted`, `userId`
- **Note:** `id`, `title`, `content`, `subjectId`, `userId`
- **StudyPlan:** `id`, `subjectId`, `examDate`, `planContent` (JSON or Text), `userId`

## 6. Implementation Phases

**Phase 1: Foundation (Setup & Auth)**
- Initialize Next.js project with Tailwind and shadcn/ui.
- Provision local/remote PostgreSQL database.
- Configure Prisma schema and Better Auth for user sessions.

**Phase 2: Core UX/UI & State**
- Build the App Shell (Navigation, Sidebar).
- Implement Task and Notes CRUD interfaces.
- Build necessary Next.js Server Actions to safely persist and fetch Prisma data.

**Phase 3: The Dashboard & Progress Engine**
- Build logic to assess "Streaks" and "Productivity %".
- Integrate shadcn/ui charts for the Progress Tracker.
- Aggregate all data to finalize the Dashboard "Wow" screen.

**Phase 4: AI Integration via Gemini**
- Securely configure Gemini API keys and endpoints.
- Add Study Plan generator form and render outputs.
- Build "Summarize Notes" action and append results to the note viewer.