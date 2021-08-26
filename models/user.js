const mongoose = require('mongoose')


const exerciseSchema = new mongoose.Schema({
    description :{
        type : String,
        required : true
    },
    duration : {
        type : Number,
        required : true
    },
    date : {
        type : String,
        required : true
    }
});

const Exercises = mongoose.model('exercises', exerciseSchema)



let userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    log : [exerciseSchema]
})



const User = mongoose.model('users-exercises', userSchema);


module.exports = {
    User,
    Exercises
}