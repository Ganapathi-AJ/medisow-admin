// import * as admin from "firebase-admin";

// // Check if Firebase Admin is already initialized
// if (!admin.apps.length) {
//   // If using environment variables (recommended for security)
//   if (process.env.FIREBASE_PRIVATE_KEY) {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         // The private key needs to have newlines replaced
//         privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//       }),
//     });
//   } else {
//     // Fallback to your project credentials (not recommended for production)
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: "medisowapp",
//         clientEmail: "firebase-adminsdk-1vcv2@medisowapp.iam.gserviceaccount.com",
//         privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAA8/OAbgGOFYK\nJ1oOaw2qs67amiMGnjkhPtDJEkXvKfXVHv++iKjkVvQ2UuLR5ATSLsLh47OUkfEc\nP9l88pjmWWr1gSli8cRkoBeeBpTacjtwQazFXQXoTsq4O0Jw0Y+xkZIhaaC83/4V\nDGZ42+sgWyAM/BsMLDikJ7k6p2knSZK4IfOiRj9eMfTVpyq7eKEQ3pmF2tA/z489\nn+3wyXU7XF/9qTOJXwWNdgMsQWfdNgNK96UJAg9FudrdBFEBJ3cEeICDqLo4rLhH\ngd4gu0AHBLBT0l6aNjzBqL1ZhzHTiuIdZdw+52n/SboONVlM+Vy6oQml1tADVYEl\nYbZ00BepAgMBAAECggEAANeAhvO6KKx1X2E0g3WT31ofIYhOGOoxqjKaKosj1CsA\nssSKbsNdbup6IVaoUuknOvwerckeLmLh9H9AEp4GNDeZI8OUsuoIKEA7m7puef7g\nHtWkVE+K3X8uNPm+n96h38bTpfQf6iQREoIYui8wo2H+htdRviDIaYPTQATOgkGf\nazcis9Dx//FrwMWDxQKheOhKpLTkiqtU5PgdYFmCG//0yXU8eUQe5DOrxZ6TdLQz\nuxsDniCkJkUG4KAnoq3or9kXfWcz7pW6XlhEiYwJ1yNatlGot2efChBW8CElXVUY\n71XmF2uRQ/2NdS1h/nkws0WQmWbEiNKLjqg+B19EHwKBgQDbgG2dDC8TLNTCGEQp\nBJDndOGaKG3uKK/4NhYnEjnFY6K6IcdwoHLiDW2b9aYu8QVgUsvCCEn2w0iu4tII\n+0JgyR/2GZ/8Z2GbmNTUfyb7HCVijwCFWMMDrL4GQ36spUToRod2POpjc/EMnpRd\naXh0huncPXzPlt4ghIkbMggEzwKBgQDf8Vkf6fSrLbVvUXV6gOLXDy2NW/nDf4YJ\n3Li7eumseVeqgwt/JsNBYp1inv0VhO+7mlE7NPnx3v1AX/wFlsOXUbJPu/8MAnB0\nOALhig/vTiqlQZfcmc21iPncSuRRkAiVN13BNn8l9hBPT9tk6V+0UKOmXtTGBgL3\nZCdA7NIqBwKBgGHLq4qwFf02GSjNBPk9do4ZDjbP0oKskBJHjsEjpqeiR6skR6aP\nZf//OZml7b+2VM3gtbWiWcneofCBUFD+GUnj8iCEtDoRmXRouFJgwG5a0PFDg1jl\n/iUR/qvtwG+NRtEyM0Jjy4455ujXcoTX6/oG7gTZRFV9A0R7qFZ8iQQTAoGAFlLT\nxJeo2SuMS5V+NYEFm9SagN3rTu62aONE0wOUqanK8GdxzPILQshW0g7xQaTn1Pa0\nJEfKpq7I5hLrZ4843iu5r7MY4JSZqywuNVdy8TMEk0avocD/PZpy9d/NVMgb4uwK\n/4i0Mg+OXqmiQDP3Y10qgxou8bKFty2XsCQrax8CgYEAkqs2zgYRja6xvfiFkqFc\nGBDciiN5yEAljCCXtp44zcjsmu8+0r8qeTPHMItk5jWra8wYJMedL6W+OYsGdDB6\nV3fGblJQeRQA0eMpX3pdrzX2NKrUjHuO3mEM03RT16uwcCxK6LKHRvyr+qo/+6ok\nd86+SaVLU6vLR1iDEr/piss=\n-----END PRIVATE KEY-----\n",
//       }),
//     });
//   }
// }

// export default admin;

import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'medisowapp',
      clientEmail: 'firebase-adminsdk-1vcv2@medisowapp.iam.gserviceaccount.com',
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAA8/OAbgGOFYK\nJ1oOaw2qs67amiMGnjkhPtDJEkXvKfXVHv++iKjkVvQ2UuLR5ATSLsLh47OUkfEc\nP9l88pjmWWr1gSli8cRkoBeeBpTacjtwQazFXQXoTsq4O0Jw0Y+xkZIhaaC83/4V\nDGZ42+sgWyAM/BsMLDikJ7k6p2knSZK4IfOiRj9eMfTVpyq7eKEQ3pmF2tA/z489\nn+3wyXU7XF/9qTOJXwWNdgMsQWfdNgNK96UJAg9FudrdBFEBJ3cEeICDqLo4rLhH\ngd4gu0AHBLBT0l6aNjzBqL1ZhzHTiuIdZdw+52n/SboONVlM+Vy6oQml1tADVYEl\nYbZ00BepAgMBAAECggEAANeAhvO6KKx1X2E0g3WT31ofIYhOGOoxqjKaKosj1CsA\nssSKbsNdbup6IVaoUuknOvwerckeLmLh9H9AEp4GNDeZI8OUsuoIKEA7m7puef7g\nHtWkVE+K3X8uNPm+n96h38bTpfQf6iQREoIYui8wo2H+htdRviDIaYPTQATOgkGf\nazcis9Dx//FrwMWDxQKheOhKpLTkiqtU5PgdYFmCG//0yXU8eUQe5DOrxZ6TdLQz\nuxsDniCkJkUG4KAnoq3or9kXfWcz7pW6XlhEiYwJ1yNatlGot2efChBW8CElXVUY\n71XmF2uRQ/2NdS1h/nkws0WQmWbEiNKLjqg+B19EHwKBgQDbgG2dDC8TLNTCGEQp\nBJDndOGaKG3uKK/4NhYnEjnFY6K6IcdwoHLiDW2b9aYu8QVgUsvCCEn2w0iu4tII\n+0JgyR/2GZ/8Z2GbmNTUfyb7HCVijwCFWMMDrL4GQ36spUToRod2POpjc/EMnpRd\naXh0huncPXzPlt4ghIkbMggEzwKBgQDf8Vkf6fSrLbVvUXV6gOLXDy2NW/nDf4YJ\n3Li7eumseVeqgwt/JsNBYp1inv0VhO+7mlE7NPnx3v1AX/wFlsOXUbJPu/8MAnB0\nOALhig/vTiqlQZfcmc21iPncSuRRkAiVN13BNn8l9hBPT9tk6V+0UKOmXtTGBgL3\nZCdA7NIqBwKBgGHLq4qwFf02GSjNBPk9do4ZDjbP0oKskBJHjsEjpqeiR6skR6aP\nZf//OZml7b+2VM3gtbWiWcneofCBUFD+GUnj8iCEtDoRmXRouFJgwG5a0PFDg1jl\n/iUR/qvtwG+NRtEyM0Jjy4455ujXcoTX6/oG7gTZRFV9A0R7qFZ8iQQTAoGAFlLT\nxJeo2SuMS5V+NYEFm9SagN3rTu62aONE0wOUqanK8GdxzPILQshW0g7xQaTn1Pa0\nJEfKpq7I5hLrZ4843iu5r7MY4JSZqywuNVdy8TMEk0avocD/PZpy9d/NVMgb4uwK\n/4i0Mg+OXqmiQDP3Y10qgxou8bKFty2XsCQrax8CgYEAkqs2zgYRja6xvfiFkqFc\nGBDciiN5yEAljCCXtp44zcjsmu8+0r8qeTPHMItk5jWra8wYJMedL6W+OYsGdDB6\nV3fGblJQeRQA0eMpX3pdrzX2NKrUjHuO3mEM03RT16uwcCxK6LKHRvyr+qo/+6ok\nd86+SaVLU6vLR1iDEr/piss=\n-----END PRIVATE KEY-----\n",
    }),
  });
}

export default admin;