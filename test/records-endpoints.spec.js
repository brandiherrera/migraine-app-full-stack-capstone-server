const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers.js')

describe('Records Endpoints', () => {
    let db

    const {
        testUsers,
        testArticles,
        testComments,
    } = helpers.makeArticlesFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/records', () => {
        context(`Given no records`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/records')
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })
    })

    describe('GET /api/records', () => {
        context(`Given there are records`, () => {
            const testItems = fixtures.makeRecordsArray()
            beforeEach('insert records', () => {
                return testItems
            })
            it(`responds with 200 and records`, () => {
                const expectedItems = fixtures.makeRecordsArray()
                return supertest(app)
                    .get('/api/records')
                    // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedItems)
            })

        })
    })
})