const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers.js')

describe('Records Endpoints', () => {
    let db

    const {
        testUsers,
        testRecords,
    } = helpers.makeRecordsFixtures()

    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.email}:${user.password}`).toString('base64')
        return `bearer ${token}`
    }

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

    describe('GET /api/records', () => {
        context(`Given no records`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/records')
                    .set('Authorization', `bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })

        context('Given there are records in the database', () => {
            beforeEach('insert records', () =>
                helpers.seedRecordsTable(
                    db,
                    testUsers,
                    testRecords
                )
            )
            it('responds with 200 and all of the records', () => {
                const expectedRecords = testRecords.map(record =>
                    helpers.makeExpectedRecord(
                        testUsers,
                        record,
                    )
                )
                return supertest(app)
                    .get('/api/records')
                    .set('authorization', `bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedRecords)
            })
        })

    })
    // })

    // describe('GET /api/records', () => {
    //     context(`Given there are records`, () => {
    //         const testItems = helpers.makeRecordsArray()
    //         beforeEach('insert records', () => {
    //             return testItems
    //         })
    //         it(`responds with 200 and records`, () => {
    //             const expectedItems = helpers.makeRecordsArray()
    //             return supertest(app)
    //                 .get('/api/records')
    //                 .set('authorization', `bearer ${process.env.API_TOKEN}`)
    //                 .expect(200, expectedItems)
    //         })

    //     })
    // })
})