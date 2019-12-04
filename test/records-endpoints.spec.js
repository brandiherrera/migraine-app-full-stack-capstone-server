const fixtures = require('./records.fixture.js')
const app = require('../src/app')

describe('Records Endpoints', () => {
    // let fixtures

    // describe('GET /api/records', () => {
    //     context(`Given no records`, () => {
    //         it(`responds with 200 and an empty list`, () => {
    //           return supertest(app)
    //             .get('/api/records')
    //             // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
    //             .expect(200, [])
    //         })
    //       })
    // })

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