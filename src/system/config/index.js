module.exports = {
    // Theme - 'test1', 'test2', 'test3'
    THEME: 'test3',

    // Port
    PORT: {
        MAIN: 3000,
        API: 3001,
        DASHBOARD: 3002,
    },
    // Database
    DB: {
        URI: 'mongodb://localhost:27017/myapp',
        BACK_UP: {
            STATUS: false,
            URI: 'mongodb://localhost:27017/myapp_backup',
        },
    },
    // JWT
    JWT: {
        SECRET: 'your_jwt_secret',
        EXPIRES_IN: '1h',
    },
    // API
    API: {
        VERSION: 'v1',
        CORS: {
            ORIGIN: 'http://localhost:3001',
            CREDENTIALS: true
        }
    },
    // CLIENT AND SECRET KEYS
    KEYS: {
        GOOGLE: {
            CLIENT_ID: 'your_google_client_id',
            CLIENT_SECRET: 'your_google_client_secret',
        },
        NOWPAYMENTS: {
            API_KEY: 'your_nowpayments_api_key',
            SECRET_KEY: 'your_nowpayments_secret_key',
            IPN: 'http://localhost:3000/api/v1/nowpayments/ipn',

        },
    },
    // SMTP
    SMTP: {
        STATUS: false, // Enable/Disable email system
        HOST: 'smtp.gmail.com',
        PORT: 465,
        SECURE: true, // true for 465, false for other ports
        USER: 'your_email@gmail.com',
        PASS: 'your_email_password',
        FROM: '"MyApp" <no-reply@myapp.com>',
    },
    // Internal Encryption
    ENCRYPTION: {
        KEY: '12345678901234567890123456789012', // 32 bytes
        IV: '1234567890123456', // 16 bytes
    },


}