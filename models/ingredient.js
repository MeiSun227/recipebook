const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
    ingredientName:{
        type:String,
        required: true
    },
    ingredientAmount:{
        type:String,
        required:true
    },
    recipe:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Recipe'
    }
})

module.exports = mongoose.model('Ingredient', ingredientSchema)