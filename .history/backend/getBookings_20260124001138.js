// BACKEND - getBookings.js (Lambda)
// Endpoint per ottenere la lista di prenotazioni con paginazione e arricchimento dei dati ospite.
// Risolve il problema HTTP 413 limitando i risultati e usando chiamate batch più efficienti.
/*
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
// Carico le variabili ambiente dal file .env
// Tipicamente contengono: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
dotenv.config();
*/

// Configurazione AWS
// Qui impostiamo regione e credenziali per poter usare DynamoDB
/*AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});*/
// Creiamo un client DynamoDB "document client" che lavora con oggetti JSON (più leggibile del low-level)
// Nominalmente definisco le tabelle che useremo
//const dynamo = new AWS.DynamoDB.DocumentClient();
//const BOOKINGS_TABLE = "Bookings";
//const GUESTS_TABLE = "Guests";

// BACKEND - getBookings.js (Lambda)
// Endpoint per ottenere la lista di prenotazioni con paginazione e arricchimento dei dati ospite.

import AWS from 'aws-sdk';

// DynamoDB client usa il ruolo della Lambda
const dynamo = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION || 'eu-north-1' });

const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

// Header CORS completi
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // o metti http://localhost:3000 per dev
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

export const handler = async (event) => {

  // 1️⃣ Preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // 2️⃣ Parse body della POST
    const { limit = 50, lastKey = null } = JSON.parse(event.body || "{}");

    // 3️⃣ Scan prenotazioni con paginazione
    const scanParams = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey || undefined,
    };

    const bookingsData = await dynamo.scan(scanParams).promise();
    let bookings = bookingsData.Items || [];

    // 4️⃣ Filtra prenotazioni tra 7 giorni fa e 7 giorni futuro
    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date(now); sevenDaysFuture.setDate(now.getDate() + 7);

    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    // 5️⃣ BatchGet dati ospiti
    if (bookings.length > 0) {
      const guestIds = bookings.map(b => ({ guestId: b.guestId }));
      const batchParams = { RequestItems: { [GUESTS_TABLE]: { Keys: guestIds } } };
      const guestsData = await dynamo.batchGet(batchParams).promise();

      const guestsMap = {};
      (guestsData.Responses[GUESTS_TABLE] || []).forEach(g => { guestsMap[g.guestId] = g; });
      bookings.forEach(b => { b.guest = guestsMap[b.guestId] || null; });
    }

    // 6️⃣ Risposta POST
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        bookings,
        lastKey: bookingsData.LastEvaluatedKey || null
      })
    };

  } catch (err) {
    console.error("Errore DynamoDB:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Errore server", error: err.message })
    };
  }
};
