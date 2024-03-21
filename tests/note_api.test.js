const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Note = require('../models/note')

beforeEach(async () => {
  await Note.deleteMany({})
  console.log('Despejada')

  // const noteObjects = helper.inicialNotes
  //   .map(note => new Note(note))
  // const promiseArray = noteObjects.map(note => note.save())
  // await Promise.all(promiseArray)

  await Note.insertMany(helper.inicialNotes)

  console.log('Done')
}, 30000)

test('Devuelve las notas en formato json', async () => {
  console.log('entró en la prueba')
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
  expect(notesAtEnd).toHaveLength(helper.inicialNotes.length)
}, 30000)

test('se puede ver una nota específica ', async () => {
  const notesAtStart = await helper.notesInDb()

  const noteToView = notesAtStart[0]

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(resultNote.body).toEqual(noteToView)
})

test('Una nota se puede Eliminar', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(
    helper.inicialNotes.length - 1
  )

  const contents = notesAtEnd.map(r => r.content)

  expect(contents).not.toContain(noteToDelete.content)
})



afterAll(() => {
  mongoose.connection.close()
})