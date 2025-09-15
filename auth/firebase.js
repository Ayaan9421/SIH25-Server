import 'dotenv/config';
import admin from 'firebase-admin';
import ee from '@google/earthengine'; 

const serviceAccount = {
    type: process.env.GCP_TYPE,
    project_id: process.env.GCP_PROJECT_ID,
    private_key_id: process.env.GCP_PRIVATE_KEY_ID,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GCP_CLIENT_EMAIL,
    client_id: process.env.GCP_CLIENT_ID,
    auth_uri: process.env.GCP_AUTH_URI,
    token_uri: process.env.GCP_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GCP_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GCP_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GCP_UNIVERSE_DOMAIN,
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

ee.data.authenticateViaPrivateKey(
  serviceAccount,
  () => {
    console.log('GEE Authentication successful.');
    // Once authenticated, initialize the GEE library.
    ee.initialize(
      null, null,
      () => {
        console.log('Google Earth Engine client library initialized successfully.');
      },
      (err) => {
        // This error occurs if the GEE library fails to initialize
        // after a successful authentication.
        console.error('GEE initialization error:', err);
      }
    );
  },
  (err) => {
    // This error occurs if the authentication itself fails.
    // A common cause is Step 1 or 2 not being completed.
    console.error('GEE authentication error:', err);
  }
);

export default admin;
