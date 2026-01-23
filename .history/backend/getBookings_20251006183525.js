// backend/getBookings.js
import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-north-1' });
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

// Funzione per ottenere prenotazioni da DynamoDB con paginazione
export async function getBookings({ limit = 50, lastKey = null }) {
  try {
    // Scan DynamoDB con limit e paginazione
    const scanParams = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey || undefined,
    };

    const bookingsData = await dynamo.scan(scanParams).promise();
    let bookings = bookingsData.Items || [];

    // Filtra prenotazioni ±7 giorni
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date();
    sevenDaysFuture.setDate(now.getDate() + 7);

    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    // Arricchisci con dati guest usando batchGet
    if (bookings.length > 0) {
      const guestIds = bookings.map(b => ({ guestId: b.guestId }));
      const batchParams = {
        RequestItems: {
          [GUESTS_TABLE]: {
            Keys: guestIds
          }
        }
      };

      const guestsData = await dynamo.batchGet(batchParams).promise();
      const guestsMap = {};
      (guestsData.Responses[GUESTS_TABLE] || []).forEach(g => {
        guestsMap[g.guestId] = g;
      });

      bookings.forEach(b => {
        b.guest = guestsMap[b.guestId] || null;
      });
    }

    return {
      bookings,
      lastKey: bookingsData.LastEvaluatedKey || null,
    };

  } catch (err) {
    console.error("Errore DynamoDB:", err);
    throw err;
  }
}
