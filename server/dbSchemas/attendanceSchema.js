const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    is_professor: { type: Boolean, required: true },
    student_number: String
});
const User = mongoose.model('User', userSchema, 'user');

const courseSchema = new Schema({
    name: { type: String, required: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    date_created: { type: Date, required: true }
});
const Course = mongoose.model('Course', courseSchema, 'course');

const sectionSchema = new Schema({
    courseSchema_id: { type: mongoose.Schema.Types.ObjectId, ref: 'course', required: true },
    number: { type: String, required: true, trim: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    students: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user' } ],
    max_capacity: { type: Number, required: true },
    attendence: [
        {
            date: Date,
            absent_students: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user' } ],
            seating_arrangement: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user' } ]
        }
    ]
});
const Section = mongoose.model('Section', sectionSchema, 'section');


module.exports = {User, Course, Section};
