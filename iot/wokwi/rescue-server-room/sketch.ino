/**
 * MissionX — Rescue the Server Room ESP32 Firmware
 * Hardware Simulation Sketch for Wokwi
 *
 * Supported Transports:
 *   1. Wokwi Virtual WiFi (Wokwi-GUEST) -> HTTP POST to MissionX API (/api/iot/wokwi/telemetry)
 *   2. Serial JSON stream (115200 baud) for local Wokwi bridge / serial monitor
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

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

#define DHTPIN 4
#define DHTTYPE DHT22

#define PIN_FAN 16
#define PIN_WARNING_LED 2
#define PIN_BUZZER 15
#define PIN_WATER 34

DHT dht(DHTPIN, DHTTYPE);

// Wokwi Virtual Network Credentials
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";

// Primary MissionX Gateway URL (host.wokwi.internal reaches the host PC running MissionX API)
const char* API_URL = "http://host.wokwi.internal:5000/api/iot/wokwi/telemetry";

// Internal actuator states
bool fanState = true;
bool warningLedState = true;
bool buzzerState = false;
bool breakerTripped = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = 2000;

void applyCommand(const char* cmd, bool val) {
  if (strcmp(cmd, "SET_FAN") == 0) {
    fanState = val;
    digitalWrite(PIN_FAN, fanState ? HIGH : LOW);
    Serial.printf("[ESP32] Executed SET_FAN -> %s\n", fanState ? "HIGH" : "LOW");
  } else if (strcmp(cmd, "SET_WARNING_LED") == 0) {
    warningLedState = val;
    digitalWrite(PIN_WARNING_LED, warningLedState ? HIGH : LOW);
    Serial.printf("[ESP32] Executed SET_WARNING_LED -> %s\n", warningLedState ? "HIGH" : "LOW");
  } else if (strcmp(cmd, "SET_BUZZER") == 0) {
    buzzerState = val;
    digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
    Serial.printf("[ESP32] Executed SET_BUZZER -> %s\n", buzzerState ? "HIGH" : "LOW");
  } else if (strcmp(cmd, "RESET_ALARM") == 0) {
    warningLedState = false;
    buzzerState = false;
    digitalWrite(PIN_WARNING_LED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    Serial.println("[ESP32] Executed RESET_ALARM -> Alarms Cleared");
  } else if (strcmp(cmd, "SET_BREAKER") == 0) {
    breakerTripped = val;
    Serial.printf("[ESP32] Executed SET_BREAKER -> %s\n", breakerTripped ? "TRIPPED" : "CLOSED");
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);

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

  // Connect to Wokwi virtual WiFi in background
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS, 6);
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
        bool val = doc["value"].as<bool>();
        if (cmd) {
          applyCommand(cmd, val);
        }
      }
    }
  }

  // 2. Transmit normalized JSON telemetry packet every 2 seconds
  unsigned long now = millis();
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;

    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int waterVal = analogRead(PIN_WATER);
    bool waterDetected = waterVal > 2000;

    if (isnan(t)) t = 31.8;
    if (isnan(h)) h = 68.0;

    StaticJsonDocument<512> telemetryDoc;
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
    actuators["breakerTripped"] = breakerTripped;

    String jsonString;
    serializeJson(telemetryDoc, jsonString);

    // Stream to Serial (Transport 1)
    Serial.println(jsonString);

    // Stream via HTTP POST to MissionX API if WiFi is connected (Transport 2)
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(API_URL);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(jsonString);
      if (httpResponseCode > 0) {
        String response = http.getString();
        StaticJsonDocument<512> respDoc;
        DeserializationError err = deserializeJson(respDoc, response);
        if (!err && respDoc.containsKey("commands")) {
          JsonArray commands = respDoc["commands"].as<JsonArray>();
          for (JsonObject cmdObj : commands) {
            const char* cmd = cmdObj["command"];
            bool val = cmdObj["value"].as<bool>();
            if (cmd) {
              applyCommand(cmd, val);
            }
          }
        }
      }
      http.end();
    }
  }
}
