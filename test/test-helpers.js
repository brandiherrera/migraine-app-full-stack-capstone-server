
function makeUsersArray() {
    return [
        {
            id: 1,
            email: 'test-user-1',
            password: 'password',
        },
        {
            id: 2,
            email: 'test-user-2',
            password: 'password1',
        },
        {
            id: 3,
            email: 'test-user-3',
            password: 'password',
        },
        {
            id: 4,
            email: 'test-user-4',
            password: 'password',
        },
    ]
}

function makeRecordsArray(users) {
    return [
        {
            "comment": "level 7 pain",
            "date_created": "01/10/2019",
            "id": "1",
            "symptom": "prodrome",
            "treatment": "caffeine",
            "trigger": "lack of sleep",
        },
        {
            "comment": "came on while sleeping ",
            "date_created": "08/15/2019",
            "id": "2",
            "symptom": "aura",
            "treatment": "medicine, sleep",
            "trigger": "food",
        },
        {
            "comment": "dark room helped",
            "date_created": "11/01/2019",
            "id": "3",
            "symptom": "blurred vision, headache prior",
            "treatment": "caffeine, medicine",
            "trigger": "dehydration",
        }
    ]
}
// }

function makeRecordsFixtures() {
    const testUsers = makeUsersArray()
    const testRecords = makeRecordsArray(testUsers)
    // const testRecords = makeRecordsArray(records)
    return { testUsers, testRecords }
}

// function cleanTables(db) {
//     return db.transaction(trx =>
//       trx.raw(
//         `TRUNCATE
//           migraine_records,
//           migraine_users
//         `
//       )
//         .then(() =>
//           Promise.all([
//             trx.raw(`ALTER SEQUENCE migraine_records_id_seq minvalue 0 START WITH 1`),
//             trx.raw(`ALTER SEQUENCE migraine_users_id_seq minvalue 0 START WITH 1`),
//             trx.raw(`SELECT setval('migraine_records_id_seq', 0)`),
//             trx.raw(`SELECT setval('migraine_users_id_seq', 0)`),
//           ])
//         )
//     )
//   }
function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
          migraine_records
        `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE migraine_records_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('migraine_records_id_seq', 0)`),
                ])
            )
    )
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

function makeAuthHeader(user) {
    const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
    return `basic ${token}`
}

module.exports = {
    makeRecordsArray,
    makeRecordsFixtures,
    cleanTables,
    seedRecordsTables,
    makeAuthHeader,
}