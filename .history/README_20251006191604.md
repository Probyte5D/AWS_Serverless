Property Management Platform - Admin Dashboard
Descrizione

Questa piattaforma permette di gestire le prenotazioni degli ospiti tramite un backend Node.js + AWS DynamoDB e un frontend React + Redux.
Il sistema supporta la paginazione lato backend per evitare payload troppo grandi, filtrando solo le prenotazioni ±7 giorni rispetto alla data corrente.

Struttura del progetto
progetto/
│
├─ backend/
│   ├─ server.js           # Express server
│   ├─ getBookings.js      # Funzione per leggere bookings da DynamoDB con paginazione e batchGet guests
│   ├─ seed.js             # Script per popolare DynamoDB con prenotazioni e guest
│   ├─ package.json
│   └─ .env                # Credenziali AWS (accessKey, secretKey, region)
│
└─ frontend/
    ├─ src/
    │   ├─ redux/
    │   │   └─ bookingsSlice.js  # Redux slice con fetchBookings e gestione paginazione
    │   ├─ App.js
    │   └─ ... altri componenti
    ├─ package.json
    └─ ...

Prerequisiti

Node.js v18+

AWS Account con DynamoDB

Tabelle DynamoDB: Bookings e Guests

AWS IAM User con chiavi di accesso (Access Key ID e Secret Key)

Setup Backend

Installare dipendenze:

cd backend
npm install


Creare file .env con le tue credenziali AWS:

AWS_ACCESS_KEY_ID=TUO_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=TUO_SECRET_ACCESS_KEY
AWS_REGION=eu-north-1


Popolare DynamoDB con dati di test (200 bookings + guest):

node seed.js


Avviare il server Express:

node server.js


Server in ascolto su http://localhost:5000.

Setup Frontend

Installare dipendenze:

cd frontend
npm install


Avviare il frontend React:

npm start


Dashboard disponibile su http://localhost:3000.

Funzionamento principale
Backend (getBookings.js)

Paginazione: usa Limit e ExclusiveStartKey per caricare solo blocchi di prenotazioni.

Filtro date: prende solo prenotazioni ±7 giorni rispetto a oggi.

BatchGet guest: recupera tutti i guest dei bookings in un'unica chiamata (evita troppe richieste).

LastKey: restituisce chiave per la pagina successiva.

Frontend (bookingsSlice.js)

fetchBookings(lastKey) richiama backend e aggiorna Redux store.

state.list accumula le prenotazioni.

Load More usa lastKey per caricare pagine successive.

Problemi risolti
Problema	Soluzione
Payload troppo grande (HTTP 413)	Backend carica prenotazioni a blocchi con Limit + ExclusiveStartKey
Troppe chiamate a DynamoDB per guest	batchGet per recuperare tutti i guest in una chiamata
Prenotazioni fuori range di date	Filtro ±7 giorni rispetto a oggi
Frontend crash quando action.payload.bookings undefined	fallback `action.payload.bookings
Testing

Avvia backend e frontend.

Apri la dashboard, vedrai le prime 50 prenotazioni.

Premi Load More per caricare le successive.

Controlla console backend per eventuali errori DynamoDB.