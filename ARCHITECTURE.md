# HAWATERRA — V0.1 Architecture

Status: approved design, pending answers to the two open decisions in
§10. No migrations, packages, or app code have been created from this
document yet.

This is the authoritative technical reference for V0.1. If an
architecture decision changes during implementation, update this file
in the same change.

Source of truth: `CLAUDE.md` (product rules) + this document (technical
design). `HAWATERRA_SPEC.md` is not currently a valid requirements
source — see the note in §14 below.

---

## 1. Folder structure

```
src/
  proxy.ts                        # replaces middleware.ts — Supabase session/cookie refresh only

  app/
    layout.tsx
    page.tsx                      # redirect → /plants (if authed) or /login

    login/
      page.tsx                    # Server Component shell
      login-form.tsx              # Client Component (email/password form)
      actions.ts                  # 'use server': signIn, signOut

    plants/
      page.tsx                    # Server Component: list current user's plants
      actions.ts                  # 'use server': createPlant, updatePlant, updatePlantStatus
      new/
        page.tsx
        plant-form.tsx            # Client Component
      [id]/
        page.tsx                  # Server Component: detail + observation history + photos
        observation-form.tsx      # Client Component
        photo-uploader.tsx        # Client Component (direct browser → Storage upload)
        actions.ts                # 'use server': createObservation, recordPlantPhoto
        edit/
          page.tsx
          # reuses plant-form.tsx from ../../new/

  lib/
    supabase/
      client.ts                   # createBrowserClient<Database>
      server.ts                   # createServerClient<Database> + getAuthedUser() helper (getClaims)
    database.types.ts             # generated, not hand-written
```

Notes:

- `middleware.ts` → `proxy.ts` (Next.js 16 convention).
- No `app/auth/callback/route.ts` — email/password has no redirect-based
  flow, so no callback route is needed.
- No top-level `components/` directory yet. Forms/uploaders are
  colocated with their route. Extract a shared folder only once a
  second real consumer of the same UI actually appears.
- `nickname` was removed from the plant model and form.

---

## 2. Database schema

```sql
create table plant_species (
  id uuid primary key default gen_random_uuid(),
  common_name text not null,
  scientific_name text,
  created_at timestamptz not null default now()
);

create table cultivar (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references plant_species(id) on delete restrict,
  name text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (species_id, name),
  unique (id, species_id)          -- composite FK target for plant.cultivar_id
);

create table plant (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  code text not null,
  species_id uuid not null references plant_species(id) on delete restrict,
  cultivar_id uuid,
  source text,
  acquired_at date,
  planted_at date,
  propagation_method text,
  location text,
  container_liters numeric,
  status text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, code),
  unique (id, user_id),            -- composite FK target for observation/plant_photo

  check (container_liters is null or container_liters >= 0),
  check (status in (
    'cutting','rooting','growing','flowering','fruiting',
    'dormant','stressed','sick','dead','archived'
  )),

  foreign key (cultivar_id, species_id)
    references cultivar(id, species_id)   -- satisfied automatically when cultivar_id is null
);

create table observation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  plant_id uuid not null,
  type text not null,
  notes text not null,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  check (type in (
    'general','growth','rooting','flowering','fruiting','pest',
    'disease','pruning','transplant','propagation','weather_damage'
  )),

  foreign key (plant_id, user_id) references plant(id, user_id) on delete cascade,
  unique (id, plant_id)             -- composite FK target for plant_photo.observation_id (see §10)
);

create table plant_photo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  plant_id uuid not null,
  observation_id uuid,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now(),

  foreign key (plant_id, user_id) references plant(id, user_id) on delete cascade,
  foreign key (observation_id, plant_id) references observation(id, plant_id)
    on delete set null (observation_id)   -- Postgres 15+ column-scoped SET NULL; see §10
);
```

`updated_at` trigger (plant only, reusable if a future table needs it):

```sql
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger plant_set_updated_at
before update on plant
for each row execute function set_updated_at();
```

---

## 3. FK / unique / check constraints — summary

| Table | Constraint | Purpose |
|---|---|---|
| `cultivar` | `unique(species_id, name)` | no duplicate cultivar names within a species |
| `cultivar` | `unique(id, species_id)` | lets `plant` FK-reference a cultivar+species pair |
| `plant` | `unique(user_id, code)` | plant codes unique per user, not globally |
| `plant` | `unique(id, user_id)` | lets `observation`/`plant_photo` FK-reference an owned plant |
| `plant` | `check(status in (...))` | fixed status vocabulary, no enum type |
| `plant` | `check(container_liters >= 0)` | rejects negative volume |
| `plant` | `FK(cultivar_id, species_id) → cultivar(id, species_id)` | DB-enforced: a cultivar must belong to the plant's species; automatically satisfied when `cultivar_id is null` |
| `observation` | `FK(plant_id, user_id) → plant(id, user_id)` | an observation can only reference a plant owned by the same user |
| `observation` | `check(type in (...))` | fixed observation-type vocabulary |
| `plant_photo` | `FK(plant_id, user_id) → plant(id, user_id)` | same cross-user ownership protection as observations |
| `plant_photo` | `FK(observation_id, plant_id) → observation(id, plant_id)` | when set, the photo's observation must belong to the same plant (open item — see §10) |

Indexes (RLS- and query-relevant only, no speculative indexing on a
small personal dataset):

- `plant(user_id, code)` — already the leading columns of the unique
  constraint, no extra index needed.
- `observation(plant_id, user_id)` — composite btree; supports both the
  FK and the "observations for this plant" detail-page query, with RLS
  narrowing by `user_id`.
- `plant_photo(plant_id, user_id)` — same rationale.

`species_id`/`cultivar_id` on `plant` are left unindexed for now —
reference-table volume will be tiny.

---

## 4. RLS strategy

RLS enabled on all five tables.

- `plant`, `observation`, `plant_photo` (owned data):
  ```sql
  using (user_id = auth.uid())
  with check (user_id = auth.uid())
  ```
  applied to select/insert/update/delete.

- `plant_species`, `cultivar` (shared reference data, single account
  for now):
  ```sql
  -- select
  using (auth.uid() is not null)
  -- insert
  with check (auth.uid() is not null)
  ```
  No update/delete policy for V0.1 — not a listed feature.

Ownership integrity between parent/child (plant → observation/photo) is
enforced by the composite foreign keys in §2/§3, not by RLS — RLS
controls visibility, the composite FK prevents the row from ever being
created with a mismatched owner.

---

## 5. Authentication flow

- Supabase Auth, email/password only. One admin account, created once
  via the Supabase dashboard — no signup page exists in the app.
- `src/proxy.ts`: creates a Supabase server client bound to the
  request/response cookies, calls `getClaims()` to validate and refresh
  the session, and propagates refreshed auth cookies onto the response.
  May also redirect unauthenticated `/plants/*` requests to `/login` as
  a UX shortcut — that redirect is a convenience, not the authorization
  boundary.
- Every protected Server Component and Server Action independently
  calls a shared `getAuthedUser()` helper (`lib/supabase/server.ts`)
  that runs `getClaims()` against its own server client and
  throws/redirects if there's no valid identity. Proxy refreshing the
  session does not substitute for this per-request check.
- No OAuth, no magic link, no password-reset UI, no callback route. A
  forgotten admin password is reset directly in the Supabase dashboard.
- Sign-out is included (Server Action + button) — basic operation, not
  a forbidden auth feature.

---

## 6. Storage design

- One private bucket: `plant-photos`.
- Path convention: `{user_id}/{plant_id}/{uuid}.{ext}`.
- Storage RLS on `storage.objects`, scoped by path prefix:
  ```sql
  using (bucket_id = 'plant-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  ```
  applied to select/insert/update/delete.
- Bucket-level restrictions: `allowed_mime_types` limited to
  `image/jpeg, image/png, image/webp`; `file_size_limit` set to 10 MB.
- Display: private bucket, so the plant detail page (Server Component)
  generates short-lived signed URLs per photo at render time — no
  public URLs.
- Orphaned upload handling: browser uploads to Storage first (needed to
  know the resulting `storage_path`), then a Server Action inserts the
  `plant_photo` row. If that insert fails, the client-side flow
  performs a compensating delete of the just-uploaded object and
  surfaces an error asking the user to retry — an inline rollback, not
  a background sweep/cron job.

---

## 7. Server Component / Server Action split

- **Server Components**: all reads — plants list, plant detail (plant +
  observations + photos), login page shell. Each creates its own
  server-side Supabase client; RLS does the filtering.
- **Server Actions**: all mutations — `createPlant`, `updatePlant`,
  `updatePlantStatus`, `createObservation`, `recordPlantPhoto`,
  `signIn`, `signOut`. Each independently verifies identity via
  `getAuthedUser()` before touching the database.
- **Client Components**: only where the browser is actually required —
  login form, plant form, observation form, photo uploader (File API +
  direct browser→Storage upload).
- No REST API layer for the web UI's own CRUD. A route handler/external
  API is introduced only when something genuinely external needs one
  (e.g. the ESP32 station, later).

---

## 8. Generated-types workflow

1. Apply schema changes via hand-written SQL migrations (Supabase CLI).
2. Regenerate types against the actual schema:
   ```bash
   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/database.types.ts
   ```
   (or `--local` against a local `supabase start` instance).
3. Commit `database.types.ts` to the repo.
4. `lib/supabase/client.ts` and `lib/supabase/server.ts` both
   parameterize their Supabase client with `Database` imported from
   that file.

No Prisma, no Drizzle.

---

## 9. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No secret/service-role key unless a concrete V0.1 requirement genuinely
needs one (none currently does — RLS + the publishable key cover every
operation the app performs).

---

## 10. Implementation milestones, in order

1. Supabase project setup; env vars; `lib/supabase/client.ts` /
   `server.ts` (with `getAuthedUser()`); `src/proxy.ts`.
2. Schema migration: all 5 tables, constraints, RLS policies,
   `updated_at` trigger. Seed `plant_species`/`cultivar` rows needed
   for the farm (at minimum Dragon Fruit / Royal Red) — see open
   decision below.
3. Login page + sign-out, proxy session refresh, per-action
   `getAuthedUser()` verification working end-to-end.
4. Plants list page (Server Component read).
5. Create-plant form + `createPlant` action → **create DF-001**.
6. Plant detail page (plant fields + empty observation/photo sections).
7. Edit-plant form + `updatePlant`/`updatePlantStatus` actions.
8. Observation form + `createObservation` action, rendered in
   detail-page history → **add a growth observation**.
9. Storage bucket + policies; photo uploader + `recordPlantPhoto`
   action + signed-URL gallery on detail page → **upload and view a
   photo**.
10. Mobile pass across every screen (touch targets, form ergonomics,
    one-handed use).
11. Manual end-to-end run of the exact success criterion below, on a
    phone.

### First success criterion

1. Log in.
2. Create:
   ```
   DF-001
   Species: Dragon Fruit
   Cultivar: Royal Red
   Propagation method: cutting
   Container: 30 L
   Status: growing
   ```
3. Open DF-001.
4. Add a growth observation.
5. The observation appears in its history.
6. Upload and view a photo.
7. The workflow is comfortable from a phone.

---

## Open decisions (block migrations until answered)

1. **`plant_photo.observation_id` ↔ `plant_id` consistency.** Not
   explicitly requested, but it follows from the ownership-integrity
   principle applied everywhere else: without it, nothing stops a photo
   from pointing at an observation belonging to a *different* plant
   than `plant_photo.plant_id`. The fix already reflected in §2/§3 is a
   composite FK — `FK(observation_id, plant_id) → observation(id,
   plant_id)` using Postgres 15+'s column-scoped `ON DELETE SET NULL
   (observation_id)`. Needs confirmation: (a) enforce this in the DB at
   all, given the added schema complexity, and (b) confirm the
   Supabase Postgres version actually supports the column-scoped
   `SET NULL` syntax (Supabase-hosted is 15+, expected fine, but not
   yet verified against the actual project).

2. **How `plant_species`/`cultivar` rows get created.** V0.1's feature
   list has no species/cultivar management screen, but DF-001 needs a
   "Dragon Fruit" species and "Royal Red" cultivar row to exist first.
   Default: seed the needed rows via a SQL seed migration / dashboard
   insert, and the plant form only shows `<select>` dropdowns over
   existing rows — no create-species UI in V0.1. Alternative: a minimal
   inline "add new species/cultivar" affordance on the New Plant form.
   Needs a decision before milestone 2/5 can be finished.

---

## 14. Note on HAWATERRA_SPEC.md

`HAWATERRA_SPEC.md` is currently a broken stub (a dangling
self-reference, `@HAWATERRA_SPEC.md`) and is not a valid requirements
source. It was not used to derive anything in this document. It will be
replaced with the actual product roadmap separately; when that happens,
this file's own scope stays technical/architectural, not product
roadmap.
