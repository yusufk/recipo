# Recipo — Git-Based Recipe Site

## Vision
A recipe sharing site where **everything lives in Git**. No database, no CMS backend — just markdown files in a GitHub repo, with a beautiful frontend that hides the Git complexity from contributors.

## Core Principles
1. **Git is the database** — recipes are markdown files with YAML frontmatter
2. **GitHub is the auth** — OAuth login, no custom user system
3. **PRs are contributions** — adding/editing a recipe creates a pull request
4. **Issues are discussions** — comments, suggestions, requests
5. **GitHub Pages is the host** — free, fast, auto-deploys on merge
6. **Zero infrastructure cost** — no servers, no databases, no hosting fees

## Architecture

```
┌─────────────────────────────────────────────┐
│          GitHub Pages (Static Site)          │
│   React/Vite SPA — reads recipes from repo  │
├─────────────────────────────────────────────┤
│          GitHub REST/GraphQL API             │
│  • List/read recipe files (Contents API)    │
│  • Create branches + PRs (for submissions)  │
│  • OAuth for identity                       │
│  • Issues API for comments/requests         │
├─────────────────────────────────────────────┤
│          GitHub Repository                  │
│  recipes/                                   │
│    ├── mains/butter-chicken.md              │
│    ├── desserts/malva-pudding.md            │
│    └── sides/chakalaka.md                   │
│  images/                                    │
│    └── (recipe photos, committed to repo)   │
└─────────────────────────────────────────────┘
```

## Recipe Format (Markdown + Frontmatter)

```markdown
---
title: Butter Chicken
author: zarina-kaka
category: mains
cuisine: indian
serves: 4
prep_time: 20min
cook_time: 45min
difficulty: medium
tags: [chicken, curry, weeknight]
image: /images/butter-chicken.jpg
created: 2026-07-19
---

# Butter Chicken

## Ingredients
- 500g chicken thigh, cubed
- 1 cup yoghurt
- ...

## Method
1. Marinate chicken in yoghurt and spices for 2 hours
2. ...

## Notes
- Can substitute cream with coconut cream for dairy-free version
```

## User Flows

### Browsing (No Auth Required)
1. Visit site → see recipe grid/list
2. Filter by category, cuisine, tags, difficulty
3. Click recipe → rendered markdown with nice layout
4. Search across all recipes (client-side, recipes loaded from repo)

### Adding a Recipe (GitHub Auth Required)
1. Click "Add Recipe" → GitHub OAuth login
2. Fill in form (title, ingredients, method, photo upload)
3. Frontend creates:
   - A fork (if not repo member) or branch
   - Commits the markdown file + image
   - Opens a PR with the recipe
4. User sees "Recipe submitted! Awaiting review." with link to PR
5. Maintainer merges → site rebuilds → recipe live

### Editing a Recipe (GitHub Auth Required)
1. Click "Edit" on any recipe → pre-filled form
2. Changes create a PR (even for maintainers, for history)
3. PR auto-merges if user is a maintainer (optional)

### Requesting a Recipe (GitHub Auth Required)
1. Click "Request a Recipe" → creates a GitHub Issue
2. Others can comment, claim it, submit a PR that closes it

### Comments / Ratings
- Option A: GitHub Issues (one issue per recipe, comments = discussion)
- Option B: GitHub Discussions (if enabled on repo)
- No custom comment system needed

## Design — Old School Recipe Notebook

### Aesthetic Goals
- **Handwritten feel** — serif/script fonts for headings, clean sans for body
- **Paper texture** — subtle cream/off-white background, maybe torn edges on cards
- **Ink stains & splashes** — decorative elements suggesting a well-used kitchen book
- **Index card layout** — recipes displayed like 3x5 index cards or notebook pages
- **Cursive annotations** — "notes" sections in a handwriting font
- **Watercolour food illustrations** — optional decorative touches
- **Ring binder / spiral binding** — visual metaphor for the site chrome
- **Coffee ring stains** — because every good recipe book has them

### Typography
- **Headings**: Something like "Caveat", "Indie Flower", or "Kalam" (Google Fonts, handwritten)
- **Body**: "Lora" or "Merriweather" (readable serif, book-like)
- **Measurements/lists**: Monospace or tabular for alignment

### Colour Palette
- Cream/ivory background (#FFFDF5 or similar)
- Dark brown/sepia text (#3D2B1F)
- Warm accent (terracotta, saffron, or paprika red)
- Subtle green for herbs/garnish touches
- Ink blue for annotations/notes

### Layout Inspiration
- Recipe cards with slightly rotated angles (like scattered on a table)
- Tabbed categories (like dividers in a ring binder)
- Full recipe view as a "page" with margins, like an actual book page
- Checkbox ingredients (interactive, can tick off while cooking)

### Mobile
- Stack cards vertically
- Full-width recipe view
- Sticky ingredient list while scrolling method
- Large tap targets for checkboxes

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite + TypeScript | Fast, modern, you know it |
| Hosting | GitHub Pages | Free, auto-deploy on push |
| Auth | GitHub OAuth (via OAuth App) | Users already have accounts |
| Content | Markdown + YAML frontmatter | Human-readable, diffable |
| API | GitHub REST API (Contents, PRs, Issues) | No backend needed |
| Search | Client-side (Fuse.js or similar) | No server required |
| Markdown render | react-markdown + remark-gfm | Rich recipe display |
| Image storage | Git LFS or committed to repo | Simple, versioned |
| CI/CD | GitHub Actions | Build + deploy on merge |

## Repo Structure

```
recipo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Build & deploy to gh-pages
├── recipes/                    # THE CONTENT (markdown files)
│   ├── mains/
│   ├── desserts/
│   ├── sides/
│   ├── breads/
│   ├── drinks/
│   └── snacks/
├── images/                     # Recipe photos
├── src/                        # Frontend app
│   ├── components/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx      # Add/edit form
│   │   ├── RecipeView.tsx      # Full recipe display
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── AuthButton.tsx
│   ├── hooks/
│   │   ├── useGitHub.ts        # GitHub API wrapper
│   │   ├── useRecipes.ts       # Recipe loading/caching
│   │   └── useAuth.ts          # OAuth flow
│   ├── pages/
│   │   ├── Home.tsx            # Recipe grid
│   │   ├── Recipe.tsx          # Single recipe view
│   │   ├── Submit.tsx          # Add/edit recipe
│   │   └── Requests.tsx        # Recipe requests (issues)
│   ├── utils/
│   │   ├── markdown.ts         # Parse frontmatter + render
│   │   └── github.ts           # API helpers
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── index.html
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── PLAN.md                     # This file
```

## GitHub OAuth Flow — Web Application Flow + PKCE

GitHub's standard **Web Application Flow** is the right choice here. The flow:

1. Register a GitHub OAuth App (Settings → Developer Settings → OAuth Apps)
2. User clicks "Sign in with GitHub"
3. Redirect to `https://github.com/login/oauth/authorize` with `client_id`, `scope`, `code_challenge` (PKCE)
4. User authorises → GitHub redirects back with a `code`
5. Exchange `code` for access token via `POST https://github.com/login/oauth/access_token`
6. Token stored in localStorage, used for all API calls (PRs, issues, forks)

**The problem**: Step 5 requires `client_secret`, which can't be exposed in a browser SPA.

**Solutions (ranked):**

| Option | Backend needed? | UX | Complexity |
|--------|----------------|-----|-----------|
| **Cloudflare Worker** (tiny proxy for token exchange) | Minimal (1 function) | Seamless redirect | Low — you already know Wrangler |
| **GitHub Device Flow** | None! Only `client_id` needed | Clunkier — user copies a code to github.com/login/device | Low |
| **GitHub App** (instead of OAuth App) | None for device flow | Same as device flow | Medium |

**DECISION: GitHub Device Flow (zero backend).**

Rationale:
- **No backend at all** — truly zero infrastructure beyond GitHub Pages
- Target audience is tech-savvy developers who cook — they'll appreciate the elegance
- Only needs `client_id` in the browser, no secret exposure risk
- The "enter this code at github.com/login/device" flow feels natural to devs
- One less moving part (no Cloudflare Worker to maintain)
- Keeps the entire project genuinely serverless — just static files + GitHub API

**Scope needed**: `public_repo` (read/write public repos — enough for PRs, issues, forks)

### Device Flow in the App:
```
1. User clicks "Sign in with GitHub"
2. App POSTs to https://github.com/login/device/code with client_id
3. GitHub returns { user_code: "WDJB-MJHT", verification_uri, device_code, interval }
4. App shows: "Go to github.com/login/device and enter code: WDJB-MJHT"
   (with a "Copy code" button + auto-open link)
5. App polls POST /login/oauth/access_token every 5s with device_code + grant_type
6. Once user authorises → token returned → stored in localStorage
7. Done. User is authenticated with no backend involved.
```

**UX touches to make it smooth:**
- Auto-copy the code to clipboard on display
- Open github.com/login/device in a new tab automatically
- Show a nice animation/spinner while polling ("Waiting for you to authorise...")
- Remember token in localStorage (persists across sessions until revoked)

## Target Audience

**Tech-savvy people who like cooking.**

- Developers, engineers, designers who happen to be great cooks
- Comfortable with GitHub (already have accounts)
- Appreciate the "git as database" philosophy — it's a feature, not a compromise
- Like the idea of PRs for recipe contributions (code review for food!)
- Want a beautiful, functional recipe tool — not another bloated recipe site with life stories
- Might fork the repo to run their own instance for their team/family

**This is NOT for:**
- People who've never used GitHub
- Users who just want to Google a recipe quickly
- The "2000 word blog post before the ingredients" crowd

**Tagline ideas:**
- "Recipes, version controlled."
- "Fork it. Cook it. PR it back."
- "git commit -m 'added grandma's biryani'"
- "Where devs share what they cook."

## Build Process

1. GitHub Actions on push to `main`:
   - `npm run build` → generates static site
   - Reads all `recipes/**/*.md` → generates `recipes-index.json` (title, category, tags, slug)
   - Deploys to `gh-pages` branch
2. Frontend loads `recipes-index.json` for browsing/search
3. Individual recipes fetched on demand via GitHub Contents API (or pre-rendered at build time)

**Pre-rendering option**: At build time, parse all recipes into a JSON bundle. Faster browsing, no API calls for reading. PRs/submissions still use the API.

## MVP Scope (v1)

- [ ] Repo setup with recipe folder structure
- [ ] 5-10 seed recipes (family favourites)
- [ ] Frontend: browse, search, filter, view recipe
- [ ] GitHub OAuth login
- [ ] "Add Recipe" form → creates PR
- [ ] "Request Recipe" → creates Issue
- [ ] GitHub Pages deployment via Actions
- [ ] Mobile-responsive design

## Future (v2+)

- [ ] Edit existing recipes (PR-based)
- [ ] Recipe ratings (reactions on Issues/Discussions)
- [ ] Print-friendly view
- [ ] Shopping list generator (checkbox ingredients)
- [ ] Meal planner (drag recipes to days)
- [ ] Recipe scaling (adjust serves → recalculate quantities)
- [ ] Import from URL (scrape recipe sites)
- [ ] Collections/cookbooks (curated sets)
- [ ] Dark mode
- [ ] PWA offline support (cache favourite recipes)

## Decisions Made

1. **Public repo** ✅ — anyone can browse, anyone with GitHub can contribute
2. **Domain**: `yusuf.kaka.co.za/recipo` for now (subpath on existing GH Pages). Buy proper domain later.
3. **Content delivery**: Fetch live from GitHub API (always current, no stale builds)
4. **Auth**: GitHub OAuth via Cloudflare Worker for token exchange
5. **Look & feel**: Old-school recipe notebook / handwritten aesthetic

## Open Questions

1. **Image hosting**: Git LFS (free for small usage) or commit directly (bloats repo over time)?
2. **Who are the maintainers?** Just Yusuf, or Zarina too? (affects auto-merge rules)
3. **Categories**: Start with mains/desserts/sides/breads/drinks/snacks, or let them emerge?
4. **Domain**: recipo.co.za? recipo.app? Worry about it later.

## Why This Is Good

- **No hosting costs** — GitHub Pages is free
- **No database to manage** — git is the database
- **Version history for free** — every recipe change is a commit
- **Contributions are pull requests** — review before publish
- **Works offline** — static site, can be a PWA
- **Portable** — recipes are just markdown files, take them anywhere
- **Scales to community** — anyone with GitHub can contribute

---
*Created: 2026-07-19*
*Status: Planning*
