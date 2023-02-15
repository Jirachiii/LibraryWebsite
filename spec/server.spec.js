import supertest from 'supertest'
import {app} from '../server.js'

describe('GET /', () => {
    it('should return 200 OK', () => {
        supertest(app)
        .get('/')
        .expect(200)
    })
})