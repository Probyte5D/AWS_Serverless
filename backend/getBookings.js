// BACKEND - getBookings.js
// Lambda AWS per recuperare le prenotazioni in un range temporale di ±7 giorni
// Utilizza:
// - DynamoDB + GSI (pk + bookingDate) per query efficienti
// - BatchGet per arricchire i dati guest
// - Compressione gzip per ridurre payload e tempi di risposta

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchGetCommand
} from "@aws-sdk/lib-dynamodb";
import zlib from "zlib";

// Client DynamoDB
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamo = DynamoDBDocumentClient.from(client);

// Tabelle configurate via environment variables (best practice)
const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE;
const GUESTS_TABLE = process.env.GUESTS_TABLE;

// Headers CORS per API Gateway
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

export const handler = async (event) => {
  // Gestione preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // Parsing sicuro del body (può arrivare come stringa o oggetto)
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Parametri di paginazione
    const limit = body?.limit || 50;
    const lastKey = body?.lastKey || undefined;

    // --------------------------------------------------
    // Calcolo range temporale:
    // da 7 giorni nel passato a 7 giorni nel futuro
    // --------------------------------------------------
    const now = new Date();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const sevenDaysFuture = new Date(now);
    sevenDaysFuture.setDate(now.getDate() + 7);

    // Conversione in formato YYYY-MM-DD
    // Necessario per il corretto ordinamento e confronto su DynamoDB
    const startDate = sevenDaysAgo.toISOString().split("T")[0];
    const endDate = sevenDaysFuture.toISOString().split("T")[0];

    // --------------------------------------------------
    // Query DynamoDB tramite GSI:
    // - pk fisso ("allBookings")
    // - bookingDate come sort key
    // Uso BETWEEN per limitare i risultati al range richiesto
    // --------------------------------------------------
    const queryParams = {
      TableName: BOOKINGS_TABLE,
      IndexName: "BookingDateIndex", // GSI progettato per query per data
      KeyConditionExpression:
        "pk = :pk AND bookingDate BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":pk": "allBookings",
        ":start": startDate,
        ":end": endDate
      },
      Limit: limit,
      ExclusiveStartKey: lastKey
    };

    const bookingsData = await dynamo.send(
      new QueryCommand(queryParams)
    );

    let bookings = bookingsData.Items || [];

    // --------------------------------------------------
    // Arricchimento dati guest
    // - Estrazione dei guestId presenti nelle prenotazioni
    // - BatchGet per minimizzare il numero di chiamate a DynamoDB
    // --------------------------------------------------
    const guestIds = bookings
      .map(b => ({ guestId: b.guestId }))
      .filter(g => g.guestId);

    if (guestIds.length > 0) {
      const batchParams = {
        RequestItems: {
          [GUESTS_TABLE]: {
            Keys: guestIds
          }
        }
      };

      const guestsData = await dynamo.send(
        new BatchGetCommand(batchParams)
      );

      // Mappa guestId → guest per accesso O(1)
      const guestsMap = {};
      (guestsData.Responses?.[GUESTS_TABLE] || []).forEach(g => {
        guestsMap[g.guestId] = g;
      });

      // Associazione dei dati guest a ciascuna booking
      bookings.forEach(b => {
        b.guest = guestsMap[b.guestId] || null;
      });
    }

    // --------------------------------------------------
    // Costruzione risposta JSON
    // --------------------------------------------------
    const responseBody = JSON.stringify({
      bookings,
      lastKey: bookingsData.LastEvaluatedKey || null
    });

    // --------------------------------------------------
    // Compressione gzip:
    // - Riduce la dimensione del payload
    // - Migliora performance di rete e costi
    // - Richiede encoding base64 per API Gateway
    // --------------------------------------------------
    const compressedBody = zlib.gzipSync(responseBody);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Encoding": "gzip"
      },
      body: compressedBody.toString("base64"),
      isBase64Encoded: true
    };

  } catch (err) {
    // Logging per CloudWatch
    console.error("Errore Lambda getBookings:", err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        message: "Errore server",
        error: err.message
      })
    };
  }
};
