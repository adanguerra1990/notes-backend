const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('contraceña como argumento')
    console.log(process.argv.length)
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://ajguerra160790:${password}@cluster0.6vc0dsl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
    content: 'JavaScript es facil',
    important: false,
})

// note.save().then(result => {
//     console.log('nota guardada!')
//     mongoose.connection.close()
// })

Note.find({important: true}).then(result => {
    result.forEach(note => {
        console.log(note)
    });
    mongoose.connection.close()
})