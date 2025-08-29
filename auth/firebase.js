import 'dotenv/config';
import admin from 'firebase-admin';

// Parse the service account JSON from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);

admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
});

export default admin;
