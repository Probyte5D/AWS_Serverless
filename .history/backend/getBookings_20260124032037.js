// BACKEND - getBookings.js (Lambda)
// Query efficiente delle prenotazioni negli ultimi 7 giorni usando GSI con partition key fissa

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, BatchGetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamo = DynamoDBDocumentClient.from(client);

const BOOKINGS_TABLE = process.env.BOOKINGS_TABLE;
const GUESTS_TABLE = process.env.GUESTS_TABLE;

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const limit = body?.limit || 50;
    const lastKey = body?.lastKey || undefined;

    // Calcolo date 7 giorni fa e 7 giorni avanti
    const now = new Date();
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date(now); sevenDaysFuture.setDate(now.getDate() + 7);

    // Query sul GSI BookingDateIndex con partition key fissa
    const queryParams = {
      TableName: BOOKINGS_TABLE,
      IndexName: "BookingDateIndex",          // il GSI deve avere pk come partition key
      KeyConditionExpression: "pk = :pk AND bookingDate BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":pk": "allBookings",                 // partition key fissa
        ":start": sevenDaysAgo.toISOString(),
        ":end": sevenDaysFuture.toISOString()
      },
      Limit: limit,
      ExclusiveStartKey: lastKey
    };

    const bookingsData = await dynamo.send(new QueryCommand(queryParams));
    let bookings = bookingsData.Items || [];

    // Arricchimento con dati ospite
    const guestIds = bookings.map(b => ({ guestId: b.guestId })).filter(g => g.guestId);
    if (guestIds.length > 0) {
      const batchParams = { RequestItems: { [GUESTS_TABLE]: { Keys: guestIds } } };
      const guestsData = await dynamo.send(new BatchGetCommand(batchParams));

      const guestsMap = {};
      (guestsData.Responses?.[GUESTS_TABLE] || []).forEach(g => { guestsMap[g.guestId] = g; });
      bookings.forEach(b => { b.guest = guestsMap[b.guestId] || null; });
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        bookings,
        lastKey: bookingsData.LastEvaluatedKey || null
      })
    };

  } catch (err) {
    console.error("Errore Lambda getBookings:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Errore server", error: err.message })
    };
  }
};
