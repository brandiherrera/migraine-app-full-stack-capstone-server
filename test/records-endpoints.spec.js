const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers.js')
const xss = require('xss')
// const UsersService = require('../src/users/users-service')

const serializeRecord = record => ({
    id: record.id,
    // date_created: record.date_created,
    intensity: record.intensity,
    location: record.location,
    onset: record.onset,
    symptom: record.symptom,
    time: record.time,
    trigger: record.trigger,
    symptom: record.symptom,
    treatment: record.treatment,
    comment: xss(record.comment),
})

describe('Records Endpoints', () => {
    let db

    const {
        testUsers,
        testRecords,
    } = helpers.makeRecordsFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))
    // before('clean the table', () => db('migraine_records').truncate())

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/users/:user_id/records', () => {
        context(`Given no records`, () => {
            beforeEach('insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )
            it(`responds with 200 and an empty list`, () => {
                // const recordId 
                const validUser = testUsers[0]
                return supertest(app)
                    .get(`/api/users/3/records`)
                    // .set('Authorization', `bearer ${process.env.API_TOKEN}`)
                    .set('Authorization', helpers.makeAuthHeader(validUser))
                    .expect(200, [])
            })
        })

        context('Given there are records in the database', () => {
            beforeEach('insert records', () =>
                helpers.seedRecordsTables(
                    db,
                    testUsers,
                    testRecords
                )
            )
            // it('responds with 200 and all of the records', () => {
            //     const validUser = testUsers[0]
            //     // console.log(validUser)
            //     // console.log(testRecords)
            //     const expectedRecords = testRecords.map(record =>
            //         helpers.makeExpectedRecord(
            //             testUsers,
            //             record,
            //         )
            //     )
            //     const userRecords = testRecords.filter(u => u.user_id === 1)
            //     console.log(userRecords)
            //     // console.log(app.get('/api/users/1/records'))
            //     return supertest(app)
            //         .get('/api/users/1/records')
            //         .set('authorization', helpers.makeAuthHeader(validUser))
            //         .expect(200, /*serializeRecord(userRecords)*/ userRecords)
            // })

            // it.skip('responds with 200 and all of the records', () => {
            //     const expectedRecords = testRecords.map(record =>
            //         helpers.makeExpectedRecord(
            //             testUsers,
            //             record,
            //         )
            //     )
            //     return supertest(app)
            //         .get('/api/records')
            //         .set('authorization', `bearer ${process.env.API_TOKEN}`)
            //         .expect(200, expectedRecords)
            // })
        })
    })

    // describe.skip('GET /api/records', () => {

    //     context('Given there are records in the database', () => {
    //         beforeEach('insert records', () =>
    //             helpers.seedRecordsTables(
    //                 db,
    //                 testUsers,
    //                 testRecords
    //             )
    //         )
    //         it('responds with 200 and all of the records', () => {
    //             const expectedRecords = testRecords.map(record =>
    //                 helpers.makeExpectedRecord(
    //                     testUsers,
    //                     record,
    //                 )
    //             )
    //             return supertest(app)
    //                 .get('/api/records')
    //                 .set('authorization', `bearer ${process.env.API_TOKEN}`)
    //                 .expect(200, expectedRecords)
    //         })
    //     })

    // })
})