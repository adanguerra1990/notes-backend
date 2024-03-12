require('dotenv').config()

const PORT = process.env.PORT

const MONGOOSE_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONDODB_URI
    : process.env.MONGOOSE_URI

module.exports = {
    MONGOOSE_URI,
    PORT
}