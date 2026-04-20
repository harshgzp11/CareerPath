# CareerPath — AI-Powered Career Roadmap Generator

> Generate personalized, time-bound learning roadmaps powered by Google Gemini AI. Track your progress, mark milestones, and stay on course toward your dream role.

---

## Problem Statement

Self-learners face **decision fatigue** when planning their career growth. With thousands of tutorials, courses, and technologies to choose from, it's nearly impossible to know _what to learn_, _in what order_, and _how long it should take_.

**CareerPath** solves this by generating structured, AI-curated learning roadmaps tailored to:
- Your **target role** (e.g., "Senior Frontend Developer")
- Your **current skill level** (Beginner → Advanced)
- Your **weekly time commitment** (2–40 hours)

Each roadmap is a step-by-step curriculum with curated resources, progress tracking, and milestone completion — turning overwhelming choices into a clear, actionable plan.

---

## Features

### Core Features
- **AI Roadmap Generation** — Gemini AI creates 5–8 sequential learning steps with descriptions and resource links
- **Interactive Timeline** — Visual timeline with milestone dots; toggle tasks complete/incomplete
- **Progress Tracking** — Real-time progress bar synced to Supabase; persists across sessions
- **Full CRUD** — Create, Read, Update (progress + rename), and Delete roadmaps

### Authentication & Data
- **Supabase Auth** — Email/password signup, login, logout with session persistence
- **Protected Routes** — Unauthorized users are redirected to the auth page
- **Persistent Storage** — All roadmaps stored in Supabase PostgreSQL, scoped per user

### UX Polish
- **Toast Notifications** — Global success/error feedback on every action (create, delete, rename)
- **Inline Rename** — Click the pencil icon to edit a roadmap title in-place
- **Delete Confirmation** — Inline overlay on cards + topbar confirmation in detail view
- **Skeleton Loading** — Shimmer placeholders while data loads
- **Auto-Scroll** — RoadmapDetail auto-scrolls to your current active step on page load
- **Animated Transitions** — Framer Motion on page elements, card stagger, and step wizard

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Vite) |
| **Routing** | React Router v6 |
| **State Management** | Context API (AuthContext, RoadmapContext, ToastContext) |
| **Styling** | Tailwind CSS with semantic `@layer components` architecture |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **AI** | Google Gemini 1.5 Pro API |
| **Backend** | Supabase (Auth + PostgreSQL) |
| **Type Safety** | PropTypes |
| **Build Tool** | Vite 8 |

---

## React Concepts Demonstrated

| Concept | Where |
|---|---|
| Functional Components | All files |
| Props & Composition | RoleStep, LevelStep, TimeStep, RoadmapCard, TimelineNode |
| useState | Auth, Dashboard, RoadmapDetail, Contexts |
| useEffect | AuthContext, RoadmapDetail (fetch + scroll), Auth (focus) |
| useReducer | Onboarding — multi-step form state machine |
| useRef | Auth (email focus), RoadmapDetail (scroll-to-active, rename input) |
| useMemo | RoadmapContext (progressPercentage), Dashboard (sortedRoadmaps) |
| useCallback | Dashboard, Onboarding, RoadmapDetail, RoadmapContext |
| React.memo | Navbar, RoadmapCard, TimelineNode |
| React.lazy + Suspense | App.jsx — route-level code splitting |
| Context API | AuthContext, RoadmapContext, ToastContext |
| Custom Hook | useRoadmaps — fetch, delete, refetch |
| Controlled Components | All form inputs |
| Lifting State Up | Onboarding form → child step components |
| Conditional Rendering | Loading, empty, error states on every page |
| Lists & Keys | Roadmap grid, timeline nodes, shimmer blocks |
| PropTypes | RoadmapCard, TimelineNode |

---

## Project Structure

```
src/
├── components/          # Reusable, memoized UI components
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── RoadmapCard.jsx
│   └── TimelineNode.jsx
├── context/             # Global state via Context API
│   ├── AuthContext.jsx
│   ├── RoadmapContext.jsx
│   └── ToastContext.jsx
├── hooks/               # Custom hooks
│   └── useRoadmaps.js
├── pages/               # Route-level page components
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── Onboarding.jsx
│   └── RoadmapDetail.jsx
├── services/            # External API & DB calls
│   ├── ai.js
│   ├── roadmapService.js
│   └── supabase.js
├── App.jsx              # Router + Providers + Lazy Loading
├── index.css            # Semantic CSS design system
└── main.jsx             # Entry point
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/careerpath.git
cd careerpath
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Set Up the Database

In your Supabase dashboard, run this SQL to create the `roadmaps` table:

```sql
CREATE TABLE roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  roadmap_json JSONB NOT NULL DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Users can only access their own roadmaps
CREATE POLICY "Users manage own roadmaps"
  ON roadmaps FOR ALL
  USING (auth.uid() = user_id);
```

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 6. Build for Production

```bash
npm run build
npm run preview
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build with code splitting |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## License

MIT
