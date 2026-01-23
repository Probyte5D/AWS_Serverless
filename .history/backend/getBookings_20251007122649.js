// importo AWS e DOTENV
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
// carico le variabili AWS dal file .env
dotenv.config(); 

//configuro variabili d’ambiente, credenziali (region, access key, secret key) quindi stoccola north eu
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
//configuro DynamoDB DocumentClient> permette di lavorare con oggetti JavaScript invece di formati binari, booking e guest sono le due tabelle crate da me su aws dynamo
const dynamo = new AWS.DynamoDB.DocumentClient();
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

// la funzione principale per paginazione>per ottenere prenotazioni da DynamoDB con paginazione, ossia con limit(n elemtn per pag) ed ExclusiveStartKey che sere per continuare la scansione da dove si era fermata la pagina precedente evitiamo di caricare tutte le prenotazioni in un’unica risposta (che causava l’errore HTTP 413 Payload Too Large).
export async function getBookings({ limit = 50, lastKey = null }) {
  try {
    const scanParams = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey || undefined,
    };

    const bookingsData = await dynamo.scan(scanParams).promise();
    let bookings = bookingsData.Items || [];
//Filtro intervallo temporale con metodo filter degli array per ottenere in prenotazioni comprese tra 7 giorni fa e 7 giorni futuri> meno carico e risposta più leggera.
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date();
    sevenDaysFuture.setDate(now.getDate() + 7);

    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    if (bookings.length > 0) {
      const guestIds = bookings.map(b => ({ guestId: b.guestId }));
      const batchParams = {
        RequestItems: {
          [GUESTS_TABLE]: { Keys: guestIds }
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
