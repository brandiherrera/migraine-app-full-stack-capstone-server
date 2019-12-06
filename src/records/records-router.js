const express = require('express')
// const xss = require('xss')
const records = require('../records.json')

const recordsRouter = express.Router()

recordsRouter
    .route('/')
    .get((req, res, next) => {
        req.app.get(records)
        .then(records => {
            res.json(records)
        })
        .catch(next)
    })