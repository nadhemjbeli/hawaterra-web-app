# STATION-001

The first HAWATERRA physical sensor station uses a DOIT ESP32 DEVKIT V1.

This is an isolated proof-of-concept toward the V0.1B milestone in
`HAWATERRA_SPEC.md` — not the full V0.3 environmental-monitoring system.

## Status (as of August 12, 2026)

- ✅ Board bring-up: firmware compiles and uploads, ESP32 boots, serial
  output and GPIO both confirmed.
- ✅ DHT22 temperature/humidity sensor wired, physically verified over
  Serial Monitor, and the verified sketch is now checked in as
  `station-001.ino` (no Wi-Fi credentials in it).
- ⬜ Wi-Fi connectivity not yet tested.
- ⬜ No HTTP request has been sent from the device.
- ⬜ No ingestion API exists yet.
- ⬜ No reading has been stored in Supabase/Postgres.
- ⬜ No IoT dashboard or historical chart exists yet.

## DHT22 checkpoint (currently checked in)

`station-001.ino` now contains the physically verified DHT22 sensor test,
superseding the earlier LED/board-only test (still described below for
reference).

Wiring used:

| DHT22 pin | ESP32 pin |
|---|---|
| VCC / `+` | `3V3` |
| OUT / data | GPIO 4 (`P4`) |
| GND / `-` | `GND` |

This is a three-pin DHT22/AM2302 module, so it likely already has the
required pull-up resistor built onto the module.

Dependency: **DHT sensor library by Adafruit** (Arduino Library Manager),
plus its required dependencies.

### Upload

1. Open `station-001.ino` in Arduino IDE.
2. Select **DOIT ESP32 DEVKIT V1**.
3. Set **Upload Speed** to **115200** — this has been the reliable speed.
4. Select the detected port. On this Linux setup that has been
   `/dev/ttyACM0`, though it may vary (could also be `/dev/ttyUSB*`).
5. Close Serial Monitor and upload.
6. If it pauses at `Connecting...`, hold **BOOT** until writing starts, then
   release it. A stable USB *data* cable matters here — not every cable on
   hand is one.
7. Open Serial Monitor at **115200 baud**.

Expected output, refreshed every 5 seconds:

```text
HAWATERRA STATION-001
DHT22 sensor test started.
Temperature: 32.7 C | Humidity: 69.8 %
```

If the wiring is loose or the module doesn't respond, that cycle instead
prints `Failed to read from DHT22. Check the wiring.`

Readings physically observed so far:

```text
Temperature: ~32.7–32.8 °C
Humidity: ~69.7–69.9 %
```

This confirms the ESP32, DHT22, GPIO 4 wiring, Arduino library, serial
output, and local sensor-reading firmware all work together.

## Earlier checkpoint: board/GPIO test (superseded)

Before the DHT22 sensor was wired, `station-001.ino` was a simpler
known-good hardware test. It confirmed USB communication, firmware
compilation and upload, ESP32 boot, serial output at 115200 baud, and GPIO
output on the common built-in LED pin (GPIO 2) — no sensor or Wi-Fi
required. It printed:

```text
HAWATERRA STATION-001
ESP32 test started successfully.
LED ON
LED OFF
```

That sketch is no longer what's checked in, but the procedure is worth
keeping as a quick sanity check if a new/replacement board ever needs
re-verifying from scratch.

## Planned sequence

1. ~~Save the verified DHT22 firmware here.~~ ✅ Done —
   `station-001.ino` now contains it, with no Wi-Fi credentials committed.
2. Connect `STATION-001` to a 2.4 GHz Wi-Fi network and confirm its
   assigned IP address.
3. Add a minimal `sensor_reading` table via a Supabase migration.
4. Add an authenticated Next.js `POST /api/iot/readings` route.
5. Test that endpoint with `curl` before touching the ESP32 sketch again.
6. Add ESP32 HTTPS POST transmission, authenticated with a station
   ingestion key — not the Supabase service-role key.
7. Send readings roughly every 5 minutes, not every 5 seconds (still 5s in
   the checked-in sketch, which is fine for bench testing).
8. Only then show the latest stored reading in the HAWATERRA interface.

Data flow, once complete:

```
DHT22 → ESP32 → Wi-Fi → authenticated HTTPS POST → Next.js API
  → Supabase PostgreSQL → HAWATERRA interface
```

## Security

- Never commit Wi-Fi credentials.
- Never commit ingestion keys.
- Never place the Supabase service-role key in ESP32 firmware or any
  browser-side code.
- The ESP32 should hold only a limited station ingestion key — not a
  database credential.
- Server-only secrets stay in environment variables, not in firmware or
  the web client.
- The ESP32 talks to the Next.js ingestion endpoint only — it must never
  connect directly to Postgres.
