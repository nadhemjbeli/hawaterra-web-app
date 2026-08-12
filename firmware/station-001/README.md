# STATION-001

The first HAWATERRA physical sensor station uses a DOIT ESP32 DEVKIT V1.

## Current checkpoint

`station-001.ino` is the known-good hardware test. It confirms:

- USB communication
- firmware compilation and upload
- ESP32 boot
- serial output at 115200 baud
- GPIO output on the common built-in LED pin (GPIO 2)

No sensor or Wi-Fi connection is required for this checkpoint.

## Upload

1. Open `station-001.ino` in Arduino IDE.
2. Select **DOIT ESP32 DEVKIT V1**.
3. Set **Upload Speed** to **115200**.
4. Select the detected `/dev/ttyUSB*` or `/dev/ttyACM*` port.
5. Close Serial Monitor and upload.
6. If needed, hold **BOOT** while the IDE displays `Connecting...` and release
   it when writing starts.
7. Open Serial Monitor at **115200 baud**.

Expected output:

```text
HAWATERRA STATION-001
ESP32 test started successfully.
LED ON
LED OFF
```

Some ESP32 variants do not have an LED on GPIO 2. Serial output still proves
that the firmware is running.

## Next checkpoint

Connect the temperature and humidity sensor, identify its exact model and pin,
then display local readings in Serial Monitor before adding Wi-Fi or HTTP
ingestion.
