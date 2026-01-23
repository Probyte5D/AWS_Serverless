// backend/getBookings.js
import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-north-1' });
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

// Funzione per ottenere prenotazioni da DynamoDB con paginazione
export async function getBookings({ limit = 50, lastKey = null }) {
  try {
    // Scan DynamoDB (puoi anche usare Query se hai indice su bookingDate)
    const scanParams = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey || undefined,
    };

    const bookingsData = await dynamo.scan(scanParams).promise();
    let bookings = bookingsData.Items || [];

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date();
    sevenDaysFuture.setDate(now.getDate() + 7);

    // Filtra le prenotazioni ±7 giorni
    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    // Arricchisci con dati guest
    for (let booking of bookings) {
      const guestData = await dynamo
        .get({ TableName: GUESTS_TABLE, Key: { guestId: booking.guestId } })
        .promise();
      booking.guest = guestData.Item || null;
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
