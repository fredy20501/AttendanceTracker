const mongoose = require('mongoose');

let ObjectId = mongoose.Types.ObjectId;

const userSchema = new mongoose.Schema({
    email: { type: String },
    name: { type: String },
    password: { type: String },
    is_professor: { type: Boolean },
    student_number: String
})

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    admin: { type: ObjectId, required: true },
    professor: ObjectId,
    students: [ObjectId],
    max_capacity: Number,
    attendence: [
        {
            date: Date,
            absent_students: [ObjectId],
            seating_arrangement: [ObjectId]
        }
    ],
    date_created: { type: Date }
})

// const userSchema = new mongoose.Schema({
//     username : {type: String, unique: true},
//     password : {type:String},
//     firstname: String, 
//     lastname: String
// });

const User = mongoose.model('user', userSchema);
module.exports = User;