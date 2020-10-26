const mongoose = require('mongoose');
const { Schema } = mongoose;
let ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    is_professor: { type: Boolean, required: true },
    timestamps: { required: true }
});
const User = mongoose.model('User', userSchema, 'user');

const seatingLayoutSchema = new Schema({
    name: { type: Number, required: true },
    capacity: { type: Number, required: true },
    dimensions: [{ type: Number, required: true }, { type: Number, required: true }],
    layout: [[{ type: Number, required: true }]], 
    default: { type: Boolean, required: true },
    description: { type: String },
    timestamps: { required: true }
})
const SeatingLayout = mongoose.model('SeatingLayout', seatingLayoutSchema, 'seatingLayout');

const courseSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    admin: { type: ObjectId, ref: 'user' },
    professor: { type: ObjectId, ref: 'user' },
    students: [ { type: ObjectId, ref: 'user' } ],
    max_capacity: { type: Number, required: true },
    attendence_threshold: { type: Number, required: true},
    attendence: [
        {
            date: Date,
            absent_students: [ { type: ObjectId, ref: 'user' } ],
            seating_arrangement: [[ { type: ObjectId, ref: 'user' } ]],
            course_type: { type: String, required: true },
            mandatory: { type: Boolean, requried: true }
        }
    ],
    seating_layout: { type: ObjectId, ref: 'seatingLayout', requried: true },
    always_mandatory: { type: Boolean, requried: true },
    timestamps: { required: true }
});
const Course = mongoose.model('course', courseSchema, 'course');

module.exports = {User, Course, SeatingLayout};

/********************************
 * Schema Property Explainations*
 * =============================*
 * This was created to better explain certain properties in the schema
 * 
 * ---------------------
 * seatingLayoutSchema |
 * ---------------------
 *      layout:  A 2D array of integers. Each element in the array represents the coordinates of seats. Each integer
 *                represents the status of the seat. The representation of each integer is explained in the legend below
 *                
 *                Layout integer legend:
 *                0 = Dark grey for locked - seat exists but won't let students sit there
 *                1 = light grey for open access - seat exists, can be sat in, but can't be reserved
 *                2 = white for selected access - seat exists, can be chosen to sit in or be reserved
 *                3 = light blue for extended access - seat exists, can be chosen to sit in or be reserved, saved for accessibility
 *                4 = light green for reserved - seat exists, has been reserved by a student
 * 
 *      default: a boolean value which indicates whether the seatingLayout is a default or custom layout
 * 
 * -------------
 * courseSchema|
 * -------------
 *      attendence: An array of objects which contain the required elements for recordording a single day of attendence.
 *          -   seating_layout: The ObjectId of the chosen seating layout from the seating layout schema.
 *          -   seating_arrangement: A 2D array of identical coordinates as the seating_layout array. Each element represents a seat in the class
 *                                   and each element holds the ObjectId of students in the seats.
 *          -   course_type: a string which indicates whether the course is a Lecture, Lab or Tutorial.
 *          -   mandatory: A boolean value which indicates if a specifc class had mandatory attendence.
 *          
 *      always_mandatory: a boolean value which indicates whether all classes should be mandatory.
 * 
 **********************************************/
