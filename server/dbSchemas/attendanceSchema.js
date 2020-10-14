import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { type: String, required:true},
    name: { type: String, required: true },
    password: { type: String, required: true },
    is_student: { type: Boolean, required: true},
    is_professor: { type: Boolean, required: true },
    student_number: String
})

const courseSchema = new Schema({
    name: { type: String, required: true },
    admin: { type: userSchema._id, required: true },
    date_created: { type: Date, required: true }
})

const sectionSchema = new Schema({
    course_id: { type:courseSchema.id, requried: true},
    number: { type:String, required: true},
    professor: userSchema.id,
    students:[ userSchema.id ],
    max_capacity: Number,
    attendence: [
        {
            date: Date,
            absent_students: [userSchema.id],
            seating_arrangement: [userSchema.id]
        }
    ]
})