require('dotenv').config()

process.env.NODE_ENV = 'test'
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL
    || "postgresql://dunder_mifflin@localhost/migraine-app-test"
process.env.JWT_SECRET = 'test-jwt-secret'

const { expect } = require('chai')
const supertest = require('supertest')

global.expect = expect
global.supertest = supertest