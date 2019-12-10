const path = require('path')
const express = require('express')
const xss = require('xss')
const RecordsService = require('./records-service')
// const { requireAuth } = require('../middleware/basic-auth')
const { requireAuth } = require('../middleware/jwt-auth')

const recordsRouter = express.Router()
const jsonParser = express.json()

const serializeRecord = record => ({
    id: record.id,
    date_created: record.date_created,
    trigger: record.trigger,
    symptom: record.symptom,
    treatment: record.treatment,
    comment: xss(record.comment),
})

recordsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        RecordsService.getAllRecords(req.app.get('db'))
        .then(records => {
            res.json(records)
        })
        .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { /*date_created,*/ trigger, symptom, treatment, comment } = req.body
        const newRecord = { /*date_created,*/ trigger, symptom, treatment, comment } 

        for (const [key, value] of Object.entries(newRecord)) 
            if (value == null) 
                return res.status(400).json({
                    error: {message: `Missing '${key}' in request body`}
                })
                
            newRecord.user_id = req.user.id
            
        RecordsService.insertRecord(
            req.app.get('db'),
            newRecord
        )
            .then(record => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `${record.id}`))
                    .json(serializeRecord(record))
            })
            .catch(next)
    })

recordsRouter
    .route('/:record_id')
    .all(requireAuth)
    .all((req, res, next) => {
        RecordsService.getById(
            req.app.get('db'),
            req.params.record_id
        )
            .then(record => {
                if (!record) {
                    return res.status(404).json({
                        error: { message: `Record doesn't exist` }
                    })
                }
                res.record = record // save the record for the next middleware
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeRecord(res.record))
    })
    .delete((req, res, next) => {
        RecordsService.deleteRecord(
            req.app.get('db'),
            req.params.record_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
        })
    // .patch(jsonParser, (req, res, next) => {
        
    // })

module.exports = recordsRouter

