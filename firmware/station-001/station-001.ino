constexpr int LED_PIN = 2;
constexpr unsigned long BLINK_INTERVAL_MS = 1000;

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(LED_PIN, OUTPUT);

  Serial.println();
  Serial.println("HAWATERRA STATION-001");
  Serial.println("ESP32 test started successfully.");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(BLINK_INTERVAL_MS);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(BLINK_INTERVAL_MS);
}
