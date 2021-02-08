const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        unique:true
    },
    recipes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
      }]
})

module.exports = mongoose.model('Author', authorSchema)