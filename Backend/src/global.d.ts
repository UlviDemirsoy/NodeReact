namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: string;
        PORT: string;
        FRONTEND_URL: string;
        ADMIN_TYPE: string;
        ADMIN_PROJECT_ID: string;
        ADMIN_PRIVATE_KEY_ID: string;
        ADMIN_PRIVATE_KEY: string;
        ADMIN_CLIENT_EMAIL: string;
        ADMIN_CLIENT_ID: string;
        ADMIN_AUTH_URI: string;
        ADMIN_TOKEN_URI: string;
        ADMIN_AUTH_PROVIDER_X509_CERT_URL: string;
        ADMIN_CLIENT_X509_CERT_URL: string;
        ADMIN_UNIVERSE_DOMAIN: string;
        USER_API_KEY: string;
        USER_AUTH_DOMAIN: string;
        USER_PROJECT_ID: string;
        USER_STORAGE_BUCKET: string;
        USER_MESSAGING_SENDER_ID: string;
        USER_APP_ID: string;


    }
}