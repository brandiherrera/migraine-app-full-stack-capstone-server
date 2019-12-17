const express = require('express')
const xss = require('xss')
const path = require('path')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const UsersService = require('./users-service')
const RecordsService = require('../records/records-service')
const { requireAuth } = require('../middleware/jwt-auth')

const jsonParser = express.json()

const serializeUser = user => ({
    user_id: user.id,
    first_name: xss(user.first_name),
    last_name: xss(user.last_name),
    email: xss(user.email),
    password: xss(user.password),
    date_created: new Date(user.date_created),
})

const serializeRecord = record => ({
    id: record.id,
    date_created: record.date_created,
    trigger: record.trigger,
    symptom: record.symptom,
    treatment: record.treatment,
    comment: xss(record.comment),
})

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { first_name, last_name, email, password } = req.body
        for (const field of ['first_name', 'last_name', 'email', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
        const passwordError = UsersService.validatePassword(password)

        if (passwordError)
            return res.status(400).json({ error: passwordError })

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            email
        )
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` })

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            first_name,
                            last_name,
                            email,
                            password: hashedPassword,
                            // date_created: 'now()',
                        }
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        const { user_id } = req.params;
        UsersService.getById(req.app.get('db'), user_id)
            .then(user => {
                if (!user) {
                    return res
                        .status(404)
                        .send({ error: { message: `User doesn't exist.` } })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(UsersService.serializeUser(res.user))
    })
    .delete((req, res, next) => {
        const { user_id } = req.params;
        UsersService.deleteUser(
            req.app.get('db'),
            user_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

usersRouter
    .route('/:user_id/records')
    .all(requireAuth)
    .all((req, res, next) => {
        const { user_id } = req.params;
        UsersService.getRecordsById(req.app.get('db'), user_id)
            .then(record => {
                if (!record) {
                    return res
                        .status(404).json({ error: { message: `No records exist.` } })
                    // .send({ error: { message: `User doesn't exist.` } })
                }
                res.record = record
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.record)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { location, time, onset, intensity, trigger, symptom, treatment, comment } = req.body
        const newRecord = { /*date,*/ location, time, onset, intensity, trigger, symptom, treatment, comment }

        for (const [key, value] of Object.entries(newRecord))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        newRecord.user_id = req.user.id

        RecordsService.insertUserRecord(
            req.app.get('db'),
            newRecord
        )
            .then(record => {
                res
                    .status(201)
                    // .location(path.posix.join(req.originalUrl, `${req.user.id}/records/${record.id}`))
                    .json(serializeRecord(record))
            })
            .catch(next)
    })
    // TODO -- Need to make a delete service for this endpoint and (??add into code)
    .delete((req, res, next) => {
        const { user_id } = req.params;
        UsersService.deleteUser(
            req.app.get('db'),
            user_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

usersRouter
    .route('/:user_id/records/:record_id')
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
    .get((req, res) => {
        res.json(res.record)
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
         .patch(jsonParser, (req, res, next) => {
            const { location, time, onset, intensity, trigger, symptom, treatment, comment } = req.body
            const recordToUpdate = { location, time, onset, intensity, trigger, symptom, treatment, comment }
        
           RecordsService.updateRecord(
             req.app.get('db'),
             req.params.record_id,
             recordToUpdate
           )
             .then(numRowsAffected => {
               res.status(204).end()
             })
             .catch(next)
          })

usersRouter
    .route('/:user_id/stats')
    .all(requireAuth)
    // .all((req, res, next) => {
    //     const { user_id } = req.params;
    //     UsersService.getHighestTrigger(req.app.get('db'), user_id)
    //         .then(trigger => {
    //             if (!trigger) {
    //                 return res
    //                     // .status(404).json({ error: { message: `No records exist.` } })
    //                 .send({ error: { message: `No triggers recorded yet.` } })
    //             }
    //             res.trigger = trigger
    //             next()
    //         })
    //         .catch(next)
    // })
    .all((req, res, next) => {
        const { user_id, location, time, onset, intensity, trigger, symptom, treatment } = req.params;
        // let stat = [ location, time, onset, intensity, trigger, symptom, treatment, comment ]
        UsersService.getHighestStat(req.app.get('db'), user_id, location, time, onset, intensity, trigger, symptom, treatment)
            .then(data => {
                if (!data) {
                    return res
                        // .status(404).json({ error: { message: `No records exist.` } })
                    .send({ error: { message: `No statistic recorded yet.` } })
                }
                res.data = data
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(res.data)
    })
// recordsRouter
// .route('/:user_id/records')
// // .all(requireAuth)
// .get((req, res, next) => {
//     RecordsService.getAllRecords(req.app.get('db'))
//     .then(records => {
//         res.json(records)
//     })
//     .catch(next)
// })
// .post(requireAuth, jsonParser, (req, res, next) => {
//     const { /*date_created,*/ trigger, symptom, treatment, comment } = req.body
//     const newRecord = { /*date_created,*/ trigger, symptom, treatment, comment } 

//     for (const [key, value] of Object.entries(newRecord)) 
//         if (value == null) 
//             return res.status(400).json({
//                 error: {message: `Missing '${key}' in request body`}
//             })

//         newRecord.user_id = req.user.id

//     RecordsService.insertRecord(
//         req.app.get('db'),
//         newRecord
//     )
//         .then(record => {
//             res
//                 .status(201)
//                 .location(path.posix.join(req.originalUrl, `${record.id}`))
//                 .json(serializeRecord(record))
//         })
//         .catch(next)
// })

module.exports = usersRouter