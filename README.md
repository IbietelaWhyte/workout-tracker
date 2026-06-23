# Scorched Gains Tracker 🔥

An interactive workout tracker built with React + Vite + Tailwind CSS. Track strength training progress with weight logging, set completion, session notes, and weekly history — all saved locally in your browser.

## Features

- 📅 **4-day split tracking** — Monday, Tuesday, Wednesday, Friday
- 🏋️ **Weight logging** — Record weight used per exercise per session
- ✅ **Set completion tracking** — Check off exercises as you complete them, with a live progress bar
- 📝 **Session notes** — Log how each session felt, PRs, or anything worth remembering
- 📊 **History view** — Review past weeks, weights logged, and notes
- 💾 **Local persistence** — Data saved automatically via `localStorage`, no account needed

## Tech Stack

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/workout-tracker.git
cd workout-tracker

# Install dependencies
npm install
```

### Run locally

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
```

This outputs a production-ready build to the `dist/` folder.

### Preview production build

```bash
npm run preview
```

## Deployment (Vercel)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **Add New Project** → import your GitHub repo
4. Vercel auto-detects the Vite framework — no config needed
5. Click **Deploy**

Your app will be live at a URL like `https://workout-tracker-yourname.vercel.app`.

## Project Structure

```
workout-tracker/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── index.css
```

## Notes

- All workout data is stored in your browser's `localStorage`. Clearing your browser data will reset the tracker.
- The workout plan (exercises, sets, reps) is currently hardcoded in `App.jsx` under the `PLAN` object — edit this directly to customize days or exercises.

## License

Personal project — free to use and modify.
