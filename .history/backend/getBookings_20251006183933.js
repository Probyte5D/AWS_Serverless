// backend/getBookings.js
import AWS from 'aws-sdk';

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'eu-north-1' });
const BOOKINGS_TABLE = "Bookings";
const GUESTS_TABLE = "Guests";

// Funzione per ottenere prenotazioni da DynamoDB con paginazione
export async function getBookings({ limit = 50, lastKey = null }) {
  try {
    // 🔹 Problema senza paginazione:
    // Se facessimo `dynamo.scan({ TableName: BOOKINGS_TABLE })` senza Limit/LastKey,
    // caricheremmo TUTTE le prenotazioni in memoria. Con 200+ bookings,
    // il payload diventa enorme → HTTP 413 Payload Too Large.
    //
    // ✅ Soluzione:
    // Usiamo `Limit` + `ExclusiveStartKey` per caricare solo un "blocco" di prenotazioni.
    const scanParams = {
      TableName: BOOKINGS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey || undefined,
    };

    const bookingsData = await dynamo.scan(scanParams).promise();
    let bookings = bookingsData.Items || [];

    // 🔹 Problema senza filtro:
    // Senza filtrare le date, potremmo inviare prenotazioni vecchie o troppo future,
    // aumentando ancora il payload.
    //
    // ✅ Soluzione:
    // Filtriamo ±7 giorni rispetto ad oggi.
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysFuture = new Date();
    sevenDaysFuture.setDate(now.getDate() + 7);

    bookings = bookings.filter(b => {
      const date = new Date(b.bookingDate);
      return date >= sevenDaysAgo && date <= sevenDaysFuture;
    });

    // 🔹 Problema senza batchGet:
    // Se facessimo `dynamo.get` per ogni booking singolarmente,
    // per 50+ prenotazioni faremmo 50+ chiamate separate a DynamoDB → lento e costoso.
    //
    // ✅ Soluzione:
    // Usiamo `batchGet` per prendere **tutti i guest in un'unica chiamata**.
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

      // Mappiamo i guest per assegnarli facilmente ai booking
      const guestsMap = {};
      (guestsData.Responses[GUESTS_TABLE] || []).forEach(g => {
        guestsMap[g.guestId] = g;
      });

      bookings.forEach(b => {
        b.guest = guestsMap[b.guestId] || null;
      });
    }

    // 🔹 Problema senza lastKey:
    // Senza `LastEvaluatedKey`, il frontend non saprebbe quando richiedere la pagina successiva.
    // Con paginazione a blocchi, dobbiamo restituire la chiave per la prossima pagina.
    //
    // ✅ Soluzione:
    // Restituiamo `lastKey` così il frontend può fare richieste successive senza mai
    // mandare tutti i dati in un'unica volta.
    return {
      bookings,                       // solo i record della pagina corrente
      lastKey: bookingsData.LastEvaluatedKey || null, // chiave per la pagina successiva
    };

  } catch (err) {
    console.error("Errore DynamoDB:", err);
    throw err;
  }
}
