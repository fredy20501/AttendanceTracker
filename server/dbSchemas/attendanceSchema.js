const mongoose = require('mongoose');
const { Schema } = mongoose;
let ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
    email: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    is_professor: { type: Boolean, required: true }
});
const User = mongoose.model('user', userSchema, 'users');

const courseSchema = new Schema({
    name: { type: String, required: true, trim: true },
    admin: { type: ObjectId, ref: 'user' },
    professor: { type: ObjectId, ref: 'user' },
    students: [ { type: ObjectId, ref: 'user' } ],
    max_capacity: { type: Number, required: true },
    attendence: [
        {
            date: Date,
            absent_students: [ { type: ObjectId, ref: 'user' } ],
            seating_arrangement: [ { type: ObjectId, ref: 'user' } ]
        }
    ],
    date_created: { type: Date, required: true }
});
const Course = mongoose.model('course', courseSchema, 'course');

module.exports = {User, Course};
