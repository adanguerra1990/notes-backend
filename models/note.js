const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGOOSE_URI

console.log('Conectando..', url)

mongoose.connect(url)
    .then(result => {
        console.log('Conectado a mongoDB')
    })
    .catch((error) => {
        console.log('Error de Conexion a mongoDB', error.message)
    })

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
}) 

module.exports = mongoose.model('Note', noteSchema)

