// backend/seed.js
// Script per popolare le tabelle DynamoDB "Bookings" e "Guests" con dati di esempio.
// Utile per testing e sviluppo locale.
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();
// Configurazione credenziali e regione AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
// Inizializzo DynamoDB DocumentClient (lavoro con oggetti JS anziché formato binario)
const dynamo = new AWS.DynamoDB.DocumentClient();
// Nomi delle tabelle
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";
    // Ciclo per creare 200 prenotazioni e ospiti
async function seed() {
  try {
    for (let i = 1; i <= 200; i++) {
      // Oggetto prenotazione  // ID prenotazione univoco// ID ospite associato// Data prenotazione tra 1 e 30 ottobre
      const booking = {
        bookingId: `B${i}`,
        guestId: `G${i}`,
        bookingDate: `2025-10-${String((i % 30) + 1).padStart(2, "0")}`
      };
 // Oggetto ospite// ID ospite univoco// Nome fittizio// Email fittizia
      const guest = {
        guestId: `G${i}`,
        guestName: `Guest ${i}`,
        email: `guest${i}@example.com`
      };

      await dynamo.put({ TableName: GUESTS_TABLE, Item: guest }).promise();
      await dynamo.put({ TableName: BOOKINGS_TABLE, Item: booking }).promise();
    }
// Inserimento dati nelle tabelle DynamoDB
    console.log("Dati inseriti con successo in DynamoDB!");
  } catch (err) {
    console.error("Errore nel seeding:", err);
  }
}

// Avvio dello script
seed();
