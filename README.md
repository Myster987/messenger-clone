# Messenger Clone

A full-stack real-time messaging application inspired by Facebook Messenger, built with SvelteKit and Hono in a pnpm monorepo. Deployed to a self-hosted Kubernetes cluster via Flux CD GitOps.

🌐 **Live:** [messenger-clone.mikolajmaciejak.dev](https://messenger-clone.mikolajmaciejak.dev)

---

## Tech Stack

### Frontend — `apps/frontend`
- **[SvelteKit](https://kit.svelte.dev/)** — full-stack web framework (SSR + client routing)
- **[Svelte 4](https://svelte.dev/)** — reactive UI
- **[TailwindCSS](https://tailwindcss.com/)** — utility-first styling
- **[sveltekit-superforms](https://superforms.rocks/)** + **[Zod](https://zod.dev/)** — form validation & server actions
- **[Better Auth](https://www.better-auth.com/)** — authentication

### Backend — `apps/backend`
- **[Hono](https://hono.dev/)** — lightweight, fast Node.js API framework
- **[Better Auth](https://www.better-auth.com/)** — authentication server (email/password + session management)
- **[Drizzle ORM](https://orm.drizzle.team/)** — type-safe SQL ORM
- **[Cloudinary](https://cloudinary.com/)** — image and media uploads

### Database — `apps/db`
- **[libSQL](https://github.com/tursodatabase/libsql)** (Turso-compatible SQLite) — embedded/server database
- **Drizzle Kit** — schema management & migrations

### Infrastructure
- **[Docker](https://www.docker.com/)** — multi-stage container builds (multi-arch: `linux/amd64` + `linux/arm64`)
- **[GitHub Actions](https://github.com/features/actions)** — CI/CD pipelines pushing to GHCR
- **[Kubernetes](https://kubernetes.io/)** — production deployment
- **[Flux CD](https://fluxcd.io/)** — GitOps continuous delivery

---

## Project Structure

```
messenger-clone/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── apps/
│   ├── frontend/           # SvelteKit app  (port 3000)
│   ├── backend/            # Hono API server (port 4000)
│   └── db/                 # Drizzle schema, migrations
├── package.json            # Monorepo root scripts
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [pnpm](https://pnpm.io/) ≥ 10 (`npm i -g pnpm`)

### 1. Clone & install

```bash
git clone https://github.com/Myster987/messenger-clone.git
cd messenger-clone
pnpm install
```

### 2. Configure environment variables

Create `.env` files for each app (see [Environment Variables](#environment-variables) below).


### 3. Run services individually (without Docker)

```bash
# Start the libSQL database
pnpm db:local

# Run schema migrations
pnpm db:migrate

# In separate terminals:
pnpm backend:dev
pnpm frontend:dev
```

---

## Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=          # libSQL connection string, e.g. libsql://localhost:8080
CLOUDINARY_CLOUD_NAME= # Cloudinary cloud name
CLOUDINARY_API_KEY=    # Cloudinary API key
CLOUDINARY_API_SECRET= # Cloudinary API secret
SITE_URL=              # Public URL of the frontend, e.g. http://localhost:3000
```

### Frontend (`apps/frontend/.env`)

```env
SECRET_DATABASE_URL=           # libSQL connection string (server-side)
SECRET_CLOUDINARY_CLOUD_NAME=  # Cloudinary cloud name (server-side)
SECRET_CLOUDINARY_API_KEY=     # Cloudinary API key (server-side)
SECRET_CLOUDINARY_API_SECRET=  # Cloudinary API secret (server-side)
PUBLIC_API_URL=                # Backend API URL, e.g. http://localhost:4000
```

---

## Available Scripts

All scripts are run from the monorepo root with `pnpm run <script>`.

| Script | Description |
|---|---|
| `db:local` | Start a local libSQL server |
| `db:generate` | Generate Drizzle migration files from schema |
| `db:push` | Push schema changes directly to the database |
| `db:pull` | Pull schema from an existing database |
| `db:studio` | Open Drizzle Studio (database GUI) |
| `db:migrate` | Run pending migrations |
| `frontend:dev` | Start the SvelteKit dev server |
| `frontend:build` | Build the SvelteKit app for production |
| `frontend:start` | Start the built SvelteKit app |
| `backend:dev` | Start the Hono API in watch mode |
| `backend:start` | Start the Hono API for production |

---

## Deployment

The production deployment runs on a self-hosted Kubernetes cluster managed with **Flux CD** (See my [homelab](https://github.com/Myster987/homelab/tree/main/manifests/apps/messenger-clone)). Images are built for `linux/amd64` and `linux/arm64` via GitHub Actions and published to the GitHub Container Registry (GHCR).

### Kubernetes — Quick reference

Manifests live in [homelab](https://github.com/Myster987/homelab/tree/main/manifests/apps/messenger-clone) and are tracked by Flux. Pushing to `main` triggers a new image build; Flux polls GHCR and rolls out updates automatically.

---

## Features

- User registration and login (email/password via Better Auth)
- Create and manage conversations (use groups are supported)
- Send and receive messages in real time
- Image uploads via Cloudinary
- Responsive UI
