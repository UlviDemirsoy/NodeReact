import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../config/config.env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these variables or not set up a .env file at all


interface firebaseAdmin{
    type: string | undefined;
    project_id: string | undefined;
    private_key_id: string | undefined;
    private_key: string | undefined;
    client_email: string | undefined;
    client_id: string | undefined;
    auth_uri:string | undefined;
    token_uri: string | undefined;
    auth_provider_x509_cert_url: string | undefined;
    client_x509_cert_url: string | undefined;
    universe_domain: string | undefined;

}
interface firebase{
    apiKey:  string | undefined;
    authDomain:  string | undefined;
    projectId: string | undefined;
    storageBucket:  string | undefined;
    messagingSenderId:  string | undefined;
    appId:  string | undefined;
}
interface Config {
    NODE_ENV: string;
    PORT: string;
    FRONTEND_URL: string;
    FIREBASE_ADMIN: firebaseAdmin;
    FIREBASE: firebase;
}

// Loading process.env as ENV interface

const getConfig = (): Config => {
    return {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        FRONTEND_URL: process.env.FRONTEND_URL,
        FIREBASE_ADMIN: {
            type : process.env.ADMIN_TYPE,
            project_id: process.env.ADMIN_PROJECT_ID,
            private_key_id: process.env.ADMIN_PRIVATE_KEY_ID,
            private_key: JSON.parse(process.env.ADMIN_PRIVATE_KEY),
            client_email: process.env.ADMIN_CLIENT_EMAIL,
            client_id: process.env.ADMIN_CLIENT_ID,
            auth_uri: process.env.ADMIN_AUTH_URI,
            token_uri: process.env.ADMIN_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.ADMIN_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.ADMIN_CLIENT_X509_CERT_URL,
            universe_domain: process.env.ADMIN_UNIVERSE_DOMAIN,
        },
        FIREBASE: {
            apiKey: process.env.USER_API_KEY,
            authDomain: process.env.USER_AUTH_DOMAIN,
            projectId: process.env.USER_PROJECT_ID,
            storageBucket: process.env.USER_STORAGE_BUCKET,
            messagingSenderId: process.env.USER_MESSAGING_SENDER_ID,
            appId: process.env.USER_APP_ID,
        }


    };
};

const config = getConfig();

export default config;

