// backend/seed.js
// Script per popolare le tabelle DynamoDB "Bookings" e "Guests"
// con dati di esempio per il case study.

import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   CONFIGURAZIONE AWS SDK
========================= */
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// DynamoDB DocumentClient
const dynamo = new AWS.DynamoDB.DocumentClient();

/* =========================
   NOMI TABELLE
========================= */
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

/* =========================
   FUNZIONE SEED
========================= */
async function seed() {
  try {
    console.log("🚀 Avvio seeding DynamoDB...");
    console.log("Tabelle:", BOOKINGS_TABLE, GUESTS_TABLE);

    const today = new Date();

    for (let i = 1; i <= 200; i++) {
      // Genera date casuali tra -7 e +7 giorni rispetto ad oggi
      const randomOffset = Math.floor(Math.random() * 15) - 7; // -7 .. +7
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() + randomOffset);

      const booking = {
        bookingId: `B${i}`,                     // PK Bookings
        guestId: `G${i}`,                       // FK verso Guests
        bookingDate: bookingDate.toISOString().split("T")[0], // YYYY-MM-DD
        pk: "allBookings"                       // ✨ nuova partition key fissa per il GSI
      };

      const guest = {
        guestId: `G${i}`,                       // PK Guests
        guestName: `Guest ${i}`,
        email: `guest${i}@example.com`,
      };

      // Inserimento in DynamoDB
      await dynamo.put({ TableName: GUESTS_TABLE, Item: guest }).promise();
      await dynamo.put({ TableName: BOOKINGS_TABLE, Item: booking }).promise();

      if (i % 20 === 0) {
        console.log(`✅ Inseriti ${i} record`);
      }
    }

    console.log("🎉 SEED COMPLETATO: dati inseriti con successo!");

  } catch (err) {
    console.error("❌ ERRORE NEL SEEDING");
    console.error("CODE:", err.code);
    console.error("MESSAGE:", err.message);
    console.error(err);
    process.exit(1);
  }
}

/* =========================
   AVVIO
========================= */
seed();
