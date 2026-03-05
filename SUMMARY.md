# Project Summary: HetaStolen — Real-Time Q&A Projector System

## Project Overview

A SvelteKit web application for managing live Q&A sessions. An admin dashboard manages speakers and questions and controls a projector display. Crowd members join via a 6-char session code (or QR) and submit questions from their phones. The game mechanic: a speaker has 30 seconds to answer a randomly selected question. The admin picks a speaker and question, starts a round, and the timer is broadcast in real-time to all connected clients via SSE.

---

## Tech Stack

- SvelteKit (Svelte 5 with runes)
- TypeScript
- Tailwind CSS with custom CSS variables for theming
- Drizzle ORM + SQLite
- Server-Sent Events (SSE) for real-time updates
- Valibot for form validation
- `cn()` utility (clsx + tailwind-merge) for conditional classes

---

## Project Structure

```
src/
├── app.d.ts                          # Global Locals type declarations
├── hooks.server.ts                   # Service instantiation + injection
├── lib/
│   ├── components/
│   │   ├── CircleTimer.svelte        # Reusable countdown timer component
│   │   ├── theme-picker.svelte       # Theme toggle (light/dark/system)
│   │   └── ui/                       # UI primitives (Button, Separator, Card, etc.)
│   ├── hooks/
│   │   └── useSSE.svelte.ts          # SSE client hook
│   ├── server/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── queries.ts            # Drizzle queries (getSessionById, getSessionByCode, etc.)
│   │   │   └── schema.ts             # sessionTable, questionTable, speakersTable
│   │   └── services/
│   │       ├── admin-auth.service.ts
│   │       ├── crowd-auth.service.ts # In-memory device/cookie auth for crowd
│   │       ├── projector.service.ts  # In-memory projector state + theme + QR
│   │       ├── question.service.ts
│   │       ├── speaker.service.ts
│   │       └── utils/
│   ├── schemas.ts                    # Shared Valibot schemas
│   ├── sse.ts                        # createSSEStream utility
│   └── utils.ts                      # cn(), parseForm(), etc.
└── routes/
    ├── admin/
    │   └── [session]/
    │       ├── +page.server.ts       # Load + all form actions
    │       ├── +page.svelte          # Admin dashboard UI
    │       ├── +server.ts            # Admin SSE GET endpoint
    │       ├── EntityForm.svelte     # Reusable add-entity form
    │       ├── EntityItem.svelte     # Reusable entity list item
    │       └── schemas.ts            # Route-local schemas
    ├── join/
    │   ├── +page.server.ts           # Load (?code= prefill) + default action (join + redirect)
    │   └── +page.svelte              # Mobile code-entry form; auto-submits from QR ?code=
    └── [session]/
        ├── +page.server.ts           # Projector: load state
        ├── +page.svelte              # Projector: full-screen display
        ├── +server.ts                # Projector SSE GET endpoint
        └── ask/
            ├── +layout.svelte        # Theme picker overlay (pre-existing ThemePicker casing bug — do not touch)
            ├── +page.server.ts       # Load (auth gate) + default (submit question) + logout action
            └── +page.svelte          # Mobile question input, char counter, success feedback, leave button
```

---

## Database Schema

```ts
sessionTable  { id: text PK, name: text, code: text(6) unique, createdAt: int(timestamp_ms) }
questionTable { id: text PK, content: text, createdAt: int, sessionId: text → session.id CASCADE }
speakersTable { id: text PK, name: text, sessionId: text → session.id CASCADE }
```

Key queries in `src/lib/server/db/queries.ts`:

- `getSessionById(id)` — by UUID
- `getSessionByCode(code)` — by 6-char code (uppercased internally)
- `createQuestion(sessionId, content)` — returns id or null
- `getQuestionById`, `getSpeakerById`, `deleteQuestionById`, `deleteSpeakerById`, etc.

---

## Service Architecture

All services follow the same observer pattern:

```ts
class SomeService {
	#state: Map<string, SomeState>; // per-session in-memory state
	#subscribers: Map<string, Set<Cb>>; // per-session subscriber sets
	subscribe(sessionId, callback): () => void; // returns unsubscribe fn
	#notifySubscribers(sessionId, event): void; // fan-out to all listeners
}
```

Singletons instantiated in `hooks.server.ts`, injected into `event.locals` on every request.

### QuestionService

- `createQuestion(sessionId, content)` — inserts to DB, emits `questionCreated`
- `deleteQuestion(questionId)` — fetches session from DB, deletes, emits `questionDeleted`
- Events: `{ type: "created" | "deleted", question: Question }`

### SpeakerService

- `createSpeaker(sessionId, name)` — inserts to DB, emits `speakerCreated`
- `deleteSpeaker(speakerId)` — fetches session from DB, deletes, emits `speakerDeleted`
- Events: `{ type: "created" | "deleted", speaker: Speaker }`

### ProjectorService

Fully in-memory (no DB). Extended with `theme` and `qrVisible` state.

```ts
type ProjectorState = {
	speakerId: string | null;
	speakerName: string | null;
	questionId: string | null;
	questionContent: string | null;
	timerEndTimestamp: number | null; // ms epoch — null means inactive
	theme: "light" | "dark" | "system";
	qrVisible: boolean;
};
type ProjectorEventType = "roundStarted" | "roundCancelled" | "themeChanged" | "qrToggled";
```

- `startRound(sessionId, speakerId, speakerName, questionId, questionContent, durationSeconds?)` — sets `timerEndTimestamp`, emits `roundStarted`
- `cancelRound(sessionId)` — clears speaker/question/timer, emits `roundCancelled`
- `setTheme(sessionId, theme)` — updates theme, emits `themeChanged`
- `toggleQR(sessionId)` — flips `qrVisible`, emits `qrToggled`
- `getState(sessionId)` — returns current state snapshot

### CrowdAuthService

In-memory only. No DB persistence. Tracks which devices have joined which sessions.

```ts
#devices: Map<deviceId, sessionId>  // in-memory
cookie: "crowdToken"                // httpOnly, sameSite: lax, maxAge: 1 week
```

- `join(sessionId, cookies)` — generates UUID deviceId, stores mapping, sets cookie, returns deviceId
- `logout(cookies)` — removes device from map, deletes cookie
- `isAuthenticated(sessionId, cookies)` — reads cookie, checks mapping matches sessionId
- `getDeviceId(cookies)` — returns deviceId from cookie or null

---

## Global Type Registration (app.d.ts)

```ts
interface Locals {
	requestInfo: { ip: string; userAgent: string };
	isAdmin: boolean;
	adminAuthService: IAdminAuthService;
	questionService: IQuestionService;
	speakerService: ISpeakerService;
	projectorService: IProjectorService;
	crowdAuthService: ICrowdAuthService;
}
```

---

## SSE Architecture

### `createSSEStream(request, setup)` (`src/lib/sse.ts`)

1. Creates a `ReadableStream` with SSE-formatted messages
2. Calls `setup(emit)` to wire up subscriptions
3. Cleans up on `request.signal` abort (client disconnect)
4. Returns a `Response` with `Content-Type: text/event-stream`

### Admin SSE Endpoint (`admin/[session]/+server.ts`)

Subscribes to all three services for the session. Emits:

```
questionCreated  → { id, content, createdAt }
questionDeleted  → { id, content, createdAt }
speakerCreated   → { id, name }
speakerDeleted   → { id, name }
timerUpdate      → { timerEndTimestamp: number | null }   (roundStarted + roundCancelled)
themeChanged     → { theme: "light" | "dark" | "system" }
qrToggled        → { qrVisible: boolean }
```

### Projector SSE Endpoint (`[session]/+server.ts`)

Subscribes to `projectorService` only. Emits the full state snapshot on every event:

```
roundStarted   → full ProjectorState
roundCancelled → full ProjectorState
themeChanged   → full ProjectorState
qrToggled      → full ProjectorState
```

### `useSSE` Hook (`src/lib/hooks/useSSE.svelte.ts`)

Client-side Svelte hook. Accepts a URL and a map of `eventName → handler`. Manages `EventSource` lifecycle, registers all handlers, closes on `onDestroy`.

```ts
useSSE(`/admin/${page.params.session}`, {
	questionCreated: (q: Question) => {
		questions.push(q);
	},
	timerUpdate: (p: { timerEndTimestamp: number | null }) => {
		timerEndTimestamp = p.timerEndTimestamp;
	}
	// ...
});
```

---

## Admin Dashboard (`admin/[session]/+page.svelte`)

Three-column layout (full-height, scrollable per-column on desktop):

| Column 1: Actions & Info            | Column 2: Speakers      | Column 3: Questions     |
| ----------------------------------- | ----------------------- | ----------------------- |
| CircleTimer                         | Add form                | Add form                |
| Speaker selection (Random / Next)   | List with select/delete | List with select/delete |
| Question selection (Random / Next)  |                         |                         |
| Start / Cancel Round                |                         |                         |
| Projector Theme (light/dark/system) |                         |                         |
| QR Code toggle                      |                         |                         |

**Key reactivity note:** `questions` and `speakers` are `$state(data.session.questions/speakers)` — seeded from load data but mutable. SSE handlers mutate them directly (`.push()`, reassignment via `.filter()`).

### Form Actions (`admin/[session]/+page.server.ts`)

| Action           | Schema                 | Description                                                             |
| ---------------- | ---------------------- | ----------------------------------------------------------------------- |
| `newQuestion`    | `createQuestionSchema` | Creates question via service                                            |
| `deleteQuestion` | `deleteSchema`         | Deletes question via service                                            |
| `newSpeaker`     | `createSpeakerSchema`  | Creates speaker via service                                             |
| `deleteSpeaker`  | `deleteSchema`         | Deletes speaker via service                                             |
| `startRound`     | `startRoundSchema`     | Fetches speaker+question from DB, calls `projectorService.startRound()` |
| `cancelRound`    | (no body)              | Calls `projectorService.cancelRound()`                                  |
| `setTheme`       | `setThemeSchema`       | Calls `projectorService.setTheme()`                                     |
| `toggleQR`       | (no body)              | Calls `projectorService.toggleQR()`                                     |

### Schemas (`src/lib/schemas.ts` + `admin/[session]/schemas.ts`)

```ts
createQuestionSchema  = { content: string(2–128 chars) }
joinSchema            = { code: string(exactly 6, /^[A-Z0-9]+$/i) }
// route-local:
deleteSchema          = { id: string }
startRoundSchema      = { speakerId: string, questionId: string }
setThemeSchema        = { theme: "light" | "dark" | "system" }
```

---

## Projector Display (`[session]/+page.svelte`)

Full-screen two-column layout:

- **Left:** `CircleTimer` filling its half (`ResizeObserver`-driven size prop), turns destructive red when expired
- **Right:** Speaker name + question content in `vw`-based font sizes
- **Idle state:** logo (`android-chrome-512x512.png`) with `mix-blend-multiply` / `dark:mix-blend-screen`
- **Bottom-right:** QR code (shown/hidden via `qrVisible`)
- **Theme:** syncs via `setMode()` from `mode-watcher` on SSE `themeChanged` events

Load function returns `{ session, projectorState }`. SSE updates replace `projectorState` wholesale.

---

## Crowd Join Flow (`/join`)

- **`+page.server.ts` load:** reads `?code=` query param, returns `{ prefillCode }`
- **`+page.server.ts` action:** validates via `joinSchema`, calls `getSessionByCode()` (404 if not found), calls `crowdAuthService.join()`, redirects `303` to `/{session.id}/ask`
- **`+page.svelte`:** mobile-first centered form — large monospace 6-char input (uppercase, alphanumeric filter), `use:enhance`. `autosubmit` Svelte action fires `form.requestSubmit()` immediately when `prefillCode` is present (QR code flow).

---

## Crowd Ask Page (`[session]/ask/+page.svelte`)

- **Auth gate in load:** `crowdAuthService.isAuthenticated()` → redirects to `/join?code=${session.code}` if not authenticated
- **Textarea:** 128-char max, `bind:value`, char counter turns `text-destructive` (via `cn()`) when < 10 chars remaining
- **Success state:** green banner on `form?.success`, textarea cleared via `$effect`
- **"Leave session" button:** small text button top-right, posts to `?/logout` action
- **`logout` action:** calls `crowdAuthService.logout()`, redirects back to `/join?code=${session.code}`

---

## CircleTimer Component (`src/lib/components/CircleTimer.svelte`)

Fully prop-driven — no imperative methods.

```ts
Props:
  duration?      : number           // total seconds, default 30
  endTimestamp?  : number | null    // ms epoch — set to start, null to reset
  size?          : number           // px, default 120
  strokeWidth?   : number           // px, default 8
  onEnd?         : () => void
  onTick?        : (remaining: number) => void
  class?         : string
```

- `$effect` watches `endTimestamp`: when set → `setInterval` ticking every 100ms; when null → clears interval, resets to `duration`
- SVG: two circles, rotated −90°. Background: `hsl(var(--muted))`. Progress: `hsl(var(--primary))` (or `--destructive` when expired). Font size scales with `size * 0.2`.

---

## Known Pre-existing Issues (do not fix)

- `src/routes/[session]/ask/+layout.svelte` imports `ThemePicker.svelte` (capital T) but the actual file is `theme-picker.svelte` (lowercase). This causes a TS/Svelte error but the layout still renders. Do not touch.

---

## Key Patterns / Conventions

- **Services:** observer pattern, `Map<sessionId, Set<Subscriber>>`, always return unsubscribe functions, catch errors per-subscriber
- **SSE:** `createSSEStream`, wire subscriptions in setup fn, return cleanup
- **Forms:** Valibot schema in `schemas.ts`, `parseForm(request, schema)` in action, `use:enhance` on frontend
- **Svelte 5:** `$props()`, `$state()`, `$derived()`, `$effect()` — no `$bindable` unless two-way sync genuinely needed. Prop-driven components over imperative methods.
- **Mutable state from load data:** use `$state(data.foo)` (not `$derived`) when SSE or other handlers need to mutate the array. Suppress the `state_referenced_locally` warning with `// svelte-ignore state_referenced_locally`.
- **Conditional classes:** always use `cn()` instead of combining a static `class=` with `class:foo=` — Tailwind color utilities conflict when both exist simultaneously.
- **Styling:** Tailwind utility classes, theme via CSS variables (`hsl(var(--primary))` etc.), `cn()` for conditional classes
