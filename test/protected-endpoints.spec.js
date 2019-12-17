const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
// const { requireAuth } = require('../src/middleware/jwt-auth')

describe('Protected endpoints', function () {
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

    afterEach('cleanup', () => helpers.cleanTables(db))

    beforeEach('insert records', () =>
        helpers.seedRecordsTables(
            db,
            testUsers,
            testRecords,
        )
    )
    
    const protectedEndpoints = [
        {
            name: 'GET /api/users/:user_id/records/',
            path: '/api/users/1/records',
            method: supertest(app).get,
        },
        {
            name: 'GET /api/users/:user_id/records/:record_id',
            path: '/api/users/1/records/1',
            method: supertest(app).get,
        },
        {
            name: 'POST /api/users/:user_id/records',
            path: '/api/users/1/records',
            method: supertest(app).post,
        },
    ]

    protectedEndpoints.forEach(endpoint => {
        describe(endpoint.name, () => {
            
            it(`responds 401 'Missing bearer token' when no bearer token`, () => {
                return endpoint.method(endpoint.path)
                // return supertest(app)
                // .get(endpoint.path)
                    .expect(401, { error: `Missing bearer token` })
            })

            it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
                const validUser = testUsers[0]
                const invalidSecret = 'bad-secret'
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
                const invalidUser = { email: 'user-not-existy', id: 1 }
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, { error: `Unauthorized request` })
            })

            // it(`responds with 200 and an empty list`, () => {
            //     before('cleanup', () => helpers.cleanTables(db))
            //     const validUser = testUsers[0]
            //     return endpoint.method(endpoint.path)
            //     // return supertest(app)
            //         // .get('/api/users/:user_id/records')
            //         // .set('Authorization', `bearer ${process.env.API_TOKEN}`)
            //         .set('Authorization', helpers.makeAuthHeader(validUser))
            //         .expect(200, [])
            // })
        })
    })
    // protectedEndpoints[0].map(endpoint => {
    //     describe('GET /api/users/:user_id/records', () => {
    //         context(`Given no records`, () => {
    //             it(`responds with 200 and an empty list`, () => {
    //                 const validUser = testUsers[0]
    //                 return endpoint.method(endpoint.path)
    //                 // return supertest(app)
    //                     // .get('/api/users/:user_id/records')
    //                     // .set('Authorization', `bearer ${process.env.API_TOKEN}`)
    //                     .set('Authorization', helpers.makeAuthHeader(validUser))
    //                     .expect(200, [])
    //             })
    //         })
    
    //         context('Given there are records in the database', () => {
    //             beforeEach('insert records', () =>
    //                 helpers.seedRecordsTables(
    //                     db,
    //                     testUsers,
    //                     testRecords
    //                 )
    //             )
    //             it('responds with 200 and all of the records', () => {
    //                 const validUser = testUsers[0]
    //                 const expectedRecords = testRecords.map(record =>
    //                     helpers.makeExpectedRecord(
    //                         testUsers,
    //                         record,
    //                     )
    //                 )
    //                 return supertest(app)
    //                     .get('/api/users/:user_id/records')
    //                     .set('authorization', helpers.makeAuthHeader(validUser))
    //                     .expect(200, expectedRecords)
    //             })
    //         })
    //     })
    // })
})