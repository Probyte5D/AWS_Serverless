// BACKEND - getBookings.js
// Endpoint per ottenere la lista di prenotazioni con paginazione e arricchimento dei dati ospite.
// Risolve il problema HTTP 413 (Payload Too Large) limitando i risultati e usando chiamate batch più efficienti.

import AWS from 'aws-sdk';
import dotenv from 'dotenv';
// carico le variabili AWS dal file .env
dotenv.config(); 

// Configuro  variabili d 'ambiente credenziali AWS (region, access key, secret key).
// La regione impostata (es. eu-north-1) indica dove si trovano fisicamente le tabelle DynamoDB.
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
// DynamoDB DocumentClient > permette di lavorare con oggetti JavaScript (JSON friendly)
// invece che con il formato binario “low-level” di DynamoDB. Più leggibile e pratico.
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
// DynamoDB restituisce una LastEvaluatedKey per continuare la scansione dalla prossima pagina.
// Se presente, la salvo come lastKey così il frontend può chiedere la pagina successiva.

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

    // AGGIUNGERE INFO OSPITI / RIDURRE LE CHIAMATE E IL PESO DELLA RISPOSTA
// Arricchimento dei dati (guest info) per ogni prenotazione:
// - Aggiungiamo i dati dell’ospite (nome, email, ecc.) usando una sola chiamata BatchGet.
//   Questo evita di fare una chiamata per ogni prenotazione, che sarebbe lenta.
// - Creiamo una mappa (guestsMap) per arricchire ogni booking con le informazioni dell’ospite corrispondente.
// - .map() è un metodo JavaScript che trasforma un array in un altro array. 
//   Qui lo usiamo per estrarre tutti i guestId dalle prenotazioni e creare un array di oggetti 
//   come richiesto da DynamoDB: { guestId: "123" }.

// BatchGet:
// - Prende dal DB un array di dati completi delle persone con questi ID: G01, G02, G03.
// - Esempio di struttura restituita: { guestId: "G01", name: "Anna", email: "anna@email.com" }

// guestsMap (oggetto):
// - Organizza i dati restituiti da BatchGet in una “rubrica”
// - Serve per trovare subito i dati di G01 nella tabella Guests (nome, email associati)
// - Esempio struttura:
//   {
//     "G01": { guestId: "G01", name: "Anna", email: "anna@email.com" },
//     "G02": { guestId: "G02", name: "Luca", email: "luca@email.com" }
//   }

// forEach finale:
// - Unisce le due tabelle: per ogni prenotazione aggiunge la chiave `guest`
// - Esempio risultato finale:
//   { bookingId: 1, guestId: "G01", guest: { guestId: "G01", name: "Anna", email: "anna@email.com" } }


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
//Restituiamo i risultati e la chiave lastKey per caricare la pagina successiva
    return {
      bookings,
      lastKey: bookingsData.LastEvaluatedKey || null,
    };

  } catch (err) {
    console.error("Errore DynamoDB:", err);
    throw err;
  }
}
