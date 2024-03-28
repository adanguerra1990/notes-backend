const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)

const Note = require('../models/note')

beforeEach(async () => {
  await Note.deleteMany({})

  // const noteObjects = helper.inicialNotes
  //   .map(note => new Note(note))
  // const promiseArray = noteObjects.map(note => note.save())
  // await Promise.all(promiseArray)

  await Note.insertMany(helper.inicialNotes)
}, 30000)

describe('cuando inicialmente hay algunas notas guardadas', () => {
  test('Devuelve las notas en formato json', async () => {
    console.log('entró en la prueba')
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('todas las notas son devueltas', async () => {
    const response = await api.get('/api/notes')

    expect(response.body).toHaveLength(helper.inicialNotes.length)
  })

  test('una nota específica está dentro de las notas devueltas', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)
    expect(contents).toContain(
      'CSS es facil'
    )
  })
})

describe('ver una nota específica', () => {
  test('se puede ver una nota con un id valido ', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultNote.body).toEqual(noteToView)
  })

  test('falla con el código de estado 404 si la nota no existe', async () => {
    const validNoneexistingId = await helper.nonExistingId()

    await api
      .get(`/api/notes/${validNoneexistingId}`)
      .expect(404)
  })

  test('falla con el código de estado 400 si el id no es válido', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(400)
  })

})

describe('adición de una nueva nota', () => {
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

  test('falla con el código de estado 400 si los datos no son válidos', async () => {
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
})

describe('Eliminacion de una nota', () => {
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
})

describe('Cuando inicialmente hay una usuario en db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      username: 'root',
      name: 'Adan Guerra',
      passwordHash
    })

    await user.save()
  })

  test('la creación se realiza correctamente con un nuevo nombre de usuario', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ajguerra',
      name: 'Alan Guerra',
      password: 'guerraa'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  });

  test('la creación falla con el código de estado y el mensaje adecuados si el nombre de usuario ya está en uso', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  });


});


afterAll(() => {
  mongoose.connection.close()
})