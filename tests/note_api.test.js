const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')


const api = supertest(app)

mongoose.set('bufferTimeoutMS', 30000)

test('Devuelve las notas en formato json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('hay 2 notas ', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(5)
})

test('la primera nota es sobre el método HTTP', async () => {
  const response = await api.get('/api/notes')

  expect(response.body[0].content).toBe('HTML es facil')
})

afterAll(() => {
    mongoose.connection.close()
})
