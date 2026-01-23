// BACKEND - getBookings.js (Lambda)
// Endpoint per ottenere la lista di prenotazioni con paginazione e arricchimento dei dati ospite.
// Risolve il problema HTTP 413 limitando i risultati e usando chiamate batch più efficienti.

import AWS from 'aws-sdk';
import dotenv from 'dotenv';
// Carico le variabili ambiente dal file .env
// Tipicamente contengono: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
dotenv.config();

// Configurazione AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

// Handler Lambda
export const handler = async (event) => {
  try {
    // API Gateway invia i dati POST in event.body
    const { limit = 50, lastKey = null } = JSON.parse(event.body || "{}");

    // Scansione DynamoDB con paginazione
    const scanParams = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey || undefined,
    };

    const bookingsData = await dynamo.scan(scanParams).promise();
    let bookings = bookingsData.Items || [];

    // Filtra prenotazioni tra 7 giorni fa e 7 giorni nel futuro
    const now = new Date();
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date(); sevenDaysFuture.setDate(now.getDate() + 7);

    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    // Arricchimento con dati ospite (BatchGet)
    if (bookings.length > 0) {
      const guestIds = bookings.map(b => ({ guestId: b.guestId }));
      const batchParams = { RequestItems: { [GUESTS_TABLE]: { Keys: guestIds } } };
      const guestsData = await dynamo.batchGet(batchParams).promise();

      const guestsMap = {};
      (guestsData.Responses[GUESTS_TABLE] || []).forEach(g => { guestsMap[g.guestId] = g; });

      bookings.forEach(b => { b.guest = guestsMap[b.guestId] || null; });
    }

    // Risposta Lambda per API Gateway
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookings,
        lastKey: bookingsData.LastEvaluatedKey || null
      })
    };

  } catch (err) {
    console.error("Errore DynamoDB:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Errore server", error: err.message })
    };
  }
};
