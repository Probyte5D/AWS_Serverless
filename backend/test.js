const { getBookings } = require('./getBookings');

let result = getBookings({ limit: 50 });
console.log("Prima pagina:", result.bookings.length, "record");

if(result.lastKey){
    result = getBookings({ limit: 50, lastKey: result.lastKey });
    console.log("Seconda pagina:", result.bookings.length, "record");
}
