module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: /*process.env.CLIENT_ORIGIN || */'https://brandiherrera-migraine-app-full-stack-capstone-react.now.sh',
    DATABASE_URL: process.env.DATABASE_URL,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}