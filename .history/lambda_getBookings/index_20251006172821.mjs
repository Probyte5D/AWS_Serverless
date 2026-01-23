// index.mjs
import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient();
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

export const handler = async (event) => {
  // Calcola intervallo 7 giorni fa - 7 giorni avanti
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysFuture = new Date(now);
  sevenDaysFuture.setDate(now.getDate() + 7);

  try {
    // Leggi tutti i bookings (scan)
    const bookingsData = await dynamo.scan({ TableName: BOOKINGS_TABLE }).promise();
    let bookings = bookingsData.Items || [];

    // Filtra per data
    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    // Arricchisci ogni booking con dati guest
    for (let booking of bookings) {
      const guestData = await dynamo.get({
        TableName: GUESTS_TABLE,
        Key: { guestId: booking.guestId }
      }).promise();
      booking.guest = guestData.Item || null;
    }

    // Paginazione
    const pageSize = 50;
    const page = event.queryStringParameters?.page
      ? parseInt(event.queryStringParameters.page)
      : 1;

    const paginated = bookings.slice((page - 1) * pageSize, page * pageSize);

    return {
      statusCode: 200,
      body: JSON.stringify({
        page,
        total: bookings.length,
        bookings: paginated
      })
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server error", error })
    };
  }
};
