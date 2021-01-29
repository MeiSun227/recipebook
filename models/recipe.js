const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    cookTime:{
        type:Number,
        required:true,
    },
    direction:{
        type:[String],
        required:true
    },
    tags:{
        type:[String]
    },
    cuisine:{
        type:String
    },
    published:{
        type:Number
    },
    author:{
        type:String
    }

})
module.exports = mongoose.model('Recipe', recipeSchema)