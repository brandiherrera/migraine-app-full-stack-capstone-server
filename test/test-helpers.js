const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            email: 'test-user-1',
            password: 'password1',
        },
        {
            id: 2,
            email: 'test-user-2',
            password: 'password1',
        },
        {
            id: 3,
            email: 'test-user-3',
            password: 'password1',
        },
        {
            id: 4,
            email: 'test-user-4',
            password: 'password',
        },
    ]
}

function makeRecordsArray() {
    return [
        {
            id: 1,
            user_id: 1,
            date_created: '2019-12-18T08:31:20.468Z',
            location: 'Home',
            time: 'Morning',
            onset: 'Prodrome',
            intensity: 6,
            trigger: 'lack of sleep',
            symptom: 'prodrome',
            treatment: 'caffeine',
            comment: 'level 7 pain'
        },
        {
            id: 2,
            user_id: 2,
            date_created: '2019-12-18T08:31:20.468Z',
            location: 'Home',
            time: 'Morning',
            onset: 'Prodrome',
            intensity: 8,
            trigger: 'food',
            symptom: 'aura',
            treatment: 'medicine, sleep',
            comment: 'came on while sleeping '
        },
        {
            id: 3,
            user_id: 1,
            date_created: '2019-12-18T08:31:20.468Z',
            location: 'Home',
            time: 'Morning',
            onset: 'Prodrome',
            intensity: 4,
            trigger: 'dehydration',
            symptom: 'blurred vision, headache prior',
            treatment: 'caffeine, medicine',
            comment: 'dark room helped'
        }
    ]
        }
        // {
        //     "comment": "level 7 pain",
        //     // "date_created": "01/10/2019",
        //     "location": "Home",
        //     "time": "Morning",
        //     "onset": "Prodrome",
        //     "intensity": 6,
        //     "id": 1,
        //     "user_id": 1,
        //     "symptom": "prodrome",
        //     "treatment": "caffeine",
        //     "trigger": "lack of sleep",
        // },
        // {
        //     "comment": "came on while sleeping ",
        //     // "date_created": "08/15/2019",
        //     "location": "Home",
        //     "time": "Morning",
        //     "onset": "Prodrome",
        //     "intensity": 8,
        //     "id": 2,
        //     "user_id": 2,
        //     "symptom": "aura",
        //     "treatment": "medicine, sleep",
        //     "trigger": "food",
        // },
        // {
        //     "comment": "dark room helped",
        //     // "date_created": "11/01/2019",
        //     "location": "Home",
        //     "time": "Morning",
        //     "onset": "Prodrome",
        //     "intensity": 4,
        //     "id": 3,
        //     "user_id": 1,
        //     "symptom": "blurred vision, headache prior",
        //     "treatment": "caffeine, medicine",
        //     "trigger": "dehydration",
        // }
//     ]
// }
// }

function makeExpectedRecord(users, record = []) {
    const user = users
        .find(user => user.id == record.user_id)

    return {
        id: record.id,
        user_id: record.user_id,
        date_created: record.date_created,
        location: record.location,
        time: record.time,
        onset: record.onset,
        intensity: record.intensity,
        trigger: record.trigger,
        symptom: record.symptom,
        treatment: record.treatment,
        comment: record.comment,
    }
}

function makeRecordsFixtures() {
    const testUsers = makeUsersArray()
    const testRecords = makeRecordsArray(testUsers)
    return { testUsers, testRecords }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
          migraine_records,
          migraine_users
        `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE migraine_records_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE migraine_users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('migraine_records_id_seq', 0)`),
                    trx.raw(`SELECT setval('migraine_users_id_seq', 0)`),
                ])
            )
    )
}

function seedRecordsTables(db, users, records = []) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('migraine_records').insert(records)
        // update the auto sequence to match the forced id values
        await trx.raw(
            `SELECT setval('migraine_records_id_seq', ?)`,
            [records[records.length - 1].id],
        )
    })
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('migraine_users').insert(preppedUsers)
        .then(() =>
            // update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('migraine_users_id_seq', ?)`,
                [users[users.length - 1].id],
            )
        )
}


function seedMaliciousrecord(db, user, record) {
    return seedUsers(db, [user])
        .then(() =>
            db
                .into('migraine_records')
                .insert([record])
        )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.email,
        algorithm: 'HS256',
    })
    return `bearer ${token}`
}

module.exports = {
    makeRecordsArray,
    makeRecordsFixtures,
    cleanTables,
    seedRecordsTables,
    seedMaliciousrecord,
    makeAuthHeader,
    seedUsers,
    makeExpectedRecord,
    // makeThisRecord,
}