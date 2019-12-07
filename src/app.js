require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
// const records = require('./records.json')

// const RecordsService = require('./records/records-service')

const recordsRouter = require('./records/records-router')
const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors({
    origin: CLIENT_ORIGIN
})
);

app.use('/api/records', recordsRouter)
app.use('/api/records/:record_id', recordsRouter)
// app.get('/api/records', (req, res, next) => {
//     RecordsService.getAllRecords(
//         req.app.get('db')
//     )
//     .then(records => {
//         res.json(records)
//     })
//     .catch(next)
// })

app.get('/api/*', (req, res) => {
    res.json({ ok: true });
});

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app