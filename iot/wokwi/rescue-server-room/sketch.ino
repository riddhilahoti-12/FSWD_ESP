/**
 * MissionX — Rescue the Server Room ESP32 Firmware
 * Hardware Simulation Sketch for Wokwi
 *
 * Sensors:
 *   - DHT22 (Pin 4): Ambient temperature & humidity
 *   - Water Detection Sensor (Pin 34): Drip tray condensation probe
 *
 * Actuators:
 *   - CRAC Blower Fan (Pin 16)
 *   - Strobe Warning LED (Pin 2)
 *   - Piezo Acoustic Buzzer (Pin 15)
 */

#include <DHT.h>
#include <ArduinoJson.h>

#define DHTPIN 4
#define DHTTYPE DHT22

#define PIN_FAN 16
#define PIN_WARNING_LED 2
#define PIN_BUZZER 15
#define PIN_WATER 34

DHT dht(DHTPIN, DHTTYPE);

// Internal actuator state
bool fanState = true;
bool warningLedState = true;
bool buzzerState = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 2000;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(PIN_FAN, OUTPUT);
  pinMode(PIN_WARNING_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_WATER, INPUT);

  // Apply initial actuator states
  digitalWrite(PIN_FAN, fanState ? HIGH : LOW);
  digitalWrite(PIN_WARNING_LED, warningLedState ? HIGH : LOW);
  digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);

  dht.begin();
  Serial.println("{\"status\":\"BOOT_COMPLETE\",\"device\":\"server-room-esp32\"}");
}

void loop() {
  // 1. Process serial commands from MissionX gateway bridge
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input.length() > 0) {
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, input);
      if (!error) {
        const char* cmd = doc["command"];
        if (strcmp(cmd, "SET_FAN") == 0) {
          fanState = doc["value"].as<bool>();
          digitalWrite(PIN_FAN, fanState ? HIGH : LOW);
        } else if (strcmp(cmd, "SET_WARNING_LED") == 0) {
          warningLedState = doc["value"].as<bool>();
          digitalWrite(PIN_WARNING_LED, warningLedState ? HIGH : LOW);
        } else if (strcmp(cmd, "SET_BUZZER") == 0) {
          buzzerState = doc["value"].as<bool>();
          digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
        } else if (strcmp(cmd, "RESET_ALARM") == 0) {
          warningLedState = false;
          buzzerState = false;
          digitalWrite(PIN_WARNING_LED, LOW);
          digitalWrite(PIN_BUZZER, LOW);
        }
      }
    }
  }

  // 2. Transmit normalized JSON telemetry packet
  unsigned long now = millis();
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;

    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int waterVal = analogRead(PIN_WATER);
    bool waterDetected = waterVal > 2000;

    if (isnan(t)) t = 31.8;
    if (isnan(h)) h = 68.0;

    StaticJsonDocument<384> telemetryDoc;
    telemetryDoc["deviceId"] = "server-room-esp32";
    telemetryDoc["missionId"] = "rescue-the-server-room";

    JsonObject sensors = telemetryDoc.createNestedObject("sensors");
    sensors["temperatureC"] = t;
    sensors["humidityPct"] = h;
    sensors["waterDetected"] = waterDetected;
    sensors["voltage"] = waterDetected ? 3.3 : 0.0;

    JsonObject actuators = telemetryDoc.createNestedObject("actuators");
    actuators["fan"] = fanState;
    actuators["warningLed"] = warningLedState;
    actuators["buzzer"] = buzzerState;

    serializeJson(telemetryDoc, Serial);
    Serial.println();
  }
}
