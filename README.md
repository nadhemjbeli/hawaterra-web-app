# HAWATERRA

HAWATERRA is practical digital infrastructure for a real multi-crop
experimental farm. It combines plant records, field observations, photos,
weather, and—incrementally—local ESP32 sensor data.

The project is built for real daily use and as a professional full-stack and
IoT engineering portfolio. Its rule is simple: ship useful, maintainable
software before adding more features.

## Current status

- **V0.1 — Plant registry:** authentication, plant CRUD, observations, and
  private photo storage are implemented.
- **V0.1A — External weather:** regional current conditions and forecast are
  implemented with Open-Meteo.
- **V0.1B — IoT proof of concept:** `STATION-001`'s DHT22 temperature/
  humidity sensor is wired, physically verified over Serial Monitor, and
  its sketch is checked in. Not yet done: Wi-Fi, HTTP ingestion, and
  Supabase storage — see
  [firmware/station-001/README.md](firmware/station-001/README.md).

See [HAWATERRA_SPEC.md](HAWATERRA_SPEC.md) for the product scope and roadmap,
and [ARCHITECTURE.md](ARCHITECTURE.md) for the technical design.

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS
- Supabase Postgres, Auth, and Storage
- Zod validation
- ESP32 firmware using Arduino-compatible C++

## Local web development

Requirements:

- Node.js 20.9 or newer
- npm
- A Supabase project for authentication, database, and photo storage

Clone the repository and install dependencies:

```bash
git clone https://github.com/nadhemjbeli/hawaterra-web-app.git
cd hawaterra-web-app
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Replace the placeholder values in `.env.local` with the real Supabase and farm
settings. Never commit `.env.local` or any service-role key.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the project checks before committing:

```bash
npm run lint
npm run build
```

## Database setup

The SQL migrations live in `supabase/migrations/`. Apply them to the connected
Supabase project in timestamp order. They create the plant registry schema,
row-level security policies, and the private plant-photo storage setup.

## ESP32 development

The firmware for the first station lives in `firmware/station-001/`. The
checked-in sketch now reads the DHT22 temperature/humidity sensor and
prints readings over serial — no Wi-Fi credentials or networking code
committed yet. See
[firmware/station-001/README.md](firmware/station-001/README.md) for the
full status and the next planned steps.

Open `firmware/station-001/station-001.ino` in Arduino IDE and use:

- Board: **DOIT ESP32 DEVKIT V1**
- Upload speed: **115200**
- Serial Monitor: **115200 baud**
- Port: the currently detected port (`/dev/ttyACM0` so far on this setup,
  though it may vary — could also be `/dev/ttyUSB*`)

If uploading pauses at `Connecting...`, hold **BOOT** until writing begins,
then release it — a stable USB data cable matters here.

## Repository structure

```text
src/app/                 Next.js routes and server actions
src/components/          Shared interface components
src/lib/                 Supabase, weather, and shared utilities
supabase/migrations/     PostgreSQL and Storage migrations
firmware/station-001/    First ESP32 station firmware
```
