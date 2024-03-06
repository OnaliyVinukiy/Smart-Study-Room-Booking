#include <MFRC522.h>
#include <MFRC522Extended.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <TimeLib.h> // Include the Time library
#include <ArduinoJson.h>

#define RST_PIN         22
#define SS_PIN          5
#define inputPin        2
#define Sensor_Pin      2
#define lightPin 4
#define lockpin 33
#define soundpin 14

// Wi-Fi credentials
const char* ssid = "OPPOF17";
const char* password = "Onaliy12334";

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  while (!Serial); // Wait for serial port to connect. Needed for native USB port only

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");

  SPI.begin();
  mfrc522.PCD_Init();
  delay(4);
  mfrc522.PCD_DumpVersionToSerial();
  Serial.println("Hold your Student ID Card near to the Scanner..");
  Serial.println();

  pinMode(inputPin, INPUT);
  pinMode(Sensor_Pin, INPUT);
  pinMode(lightPin, OUTPUT);
  Serial.println("\n\nLet's Begin\n");

  pinMode(lockpin,OUTPUT);
  pinMode(soundpin,OUTPUT);

}

void loop() {
  bool accessGranted = false; // Initialize accessGranted variable

  // Motion sensor
  bool motion = digitalRead(inputPin);
  if (motion) {
    Serial.println("Motion detected: " + String(motion));
    digitalWrite(lightPin, LOW);
    digitalWrite(lockpin,LOW);
    //digitalWrite(soundpin,LOW);
    
  } else {
    Serial.println("Motion not detected: " + String(motion));
    digitalWrite(lightPin, HIGH);
    digitalWrite(lockpin,HIGH);
   // digitalWrite(soundpin,HIGH);

  }


  bool Sensor_State = digitalRead(Sensor_Pin);
  int Senor_Value = analogRead(A0);
  Serial.println("\nSensor_State: " + String(Sensor_State));

  if (Sensor_State == true) {
    Serial.println("Sound Detected");
  } else {
    Serial.println("Sound Not Detected");
  }

  delay(3000);

  // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  // Select one of the cards
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Dump debug info about the card; PICC_HaltA() is automatically called
  mfrc522.PICC_DumpToSerial(&(mfrc522.uid));

  Serial.print("Card ID: ");
  String cardID = ""; //store the card's ID
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    Serial.print(mfrc522.uid.uidByte[i], HEX);
    cardID.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : ""));
    cardID.concat(String(mfrc522.uid.uidByte[i], HEX));
  }
  Serial.println();
  cardID.toUpperCase();

  // Get current date
  String currentDate = getCurrentDate();

  // Get current time
  String currentTime = getTimeFromArduino();

  // Make HTTP GET request to Firebase to check booking status
  String url = "https://smart-study-room-default-rtdb.firebaseio.com/.json"; // Replace <your-firebase-database-name> with your Firebase project name
  HTTPClient http;
  http.begin(url);
  int httpCode = http.GET();
  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    Serial.println(payload);

    // Parse JSON response
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, payload);
    if (!error) {
      // Check if the booking exists for the current card ID and current time
      JsonObject bookings = doc["bookings"];
      for (JsonPair entry : bookings) {
        String bookingStudentId = entry.value()["studentId"];
        String intime = entry.value()["intime"];
        String outtime = entry.value()["outtime"];
        if (bookingStudentId == cardID && currentTime >= intime && currentTime <= outtime) {
          Serial.println("Access Granted");
          accessGranted = true;
          break; // Exit the loop if access is granted
        }
      }
      if (!accessGranted) {
        Serial.println("Access Denied");
      }
    } else {
      Serial.println("Error parsing JSON response");
    }
  } else {
    Serial.println("Error getting booking status from Firebase");
  }
  http.end();

  delay(1500);
}

String getCurrentDate() {
  // Get current date
  int currentYear = year();
  int currentMonth = month();
  int currentDay = day();

  String currentDate = String(currentYear) + "-" + String(currentMonth) + "-" + String(currentDay);
  return currentDate;
}

String getTimeFromArduino() {
  // Get current time
  String currentTime = "";
  int currentHour = hour();
  int currentMinute = minute();
  int currentSecond = second();

  currentTime = String(currentHour) + ":" + String(currentMinute) + ":" + String(currentSecond);
  return currentTime;
}
