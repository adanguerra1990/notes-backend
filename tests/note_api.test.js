const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)


const Note = require('../models/note')


beforeEach(async () => {
  await Note.deleteMany({})

  let noteObject = new Note(helper.inicialNotes[0])
  await noteObject.save()

  noteObject = new Note(helper.inicialNotes[1])
  await noteObject.save()
}, 30000)

test('Devuelve las notas en formato json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 30000)

test('todas las notas son devueltas', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(helper.inicialNotes.length)
}, 30000)

test('una nota específica está dentro de las notas devueltas', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)
  console.log(contents)
  expect(contents).toContain(
    'CSS es facil'
  )
}, 30000)

test('se puede agregar una nota válida', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }
  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.inicialNotes.length + 1)

  const contents = notesAtEnd.map(r => r.content)  
  expect(contents).toContain(
    'async/await simplifies making async calls'
  )
})

test('Nota sin contenido no se agrega', async () => {
  const newNote = {
    important: true
  }
  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDb()
  console.log('response', notesAtEnd)

  expect(notesAtEnd).toHaveLength(helper.inicialNotes.length)
}, 30000)


afterAll(() => {
  mongoose.connection.close()
})
