const Note = require('../models/note')

const inicialNotes = [
    {
        content: 'HTML es facil',
        important: true,
    },
    {
        content: 'CSS es facil',
        important: false,
    }
]

const nonExistingId = async () => {
    const note = new Note({ content: 'Se eliminara pronto' })
    await note.save()
    await note.deleteOne()

    return note._id.toString()
}

const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

module.exports = {
    inicialNotes, nonExistingId, notesInDb
}