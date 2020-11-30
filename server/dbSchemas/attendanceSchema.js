const mongoose = require('mongoose');
const { Schema } = mongoose;
let ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    is_professor: { type: Boolean, required: true },
},
{ 
    timestamps: true 
});
const User = mongoose.model('user', userSchema, 'user');

const seatingLayoutSchema = new Schema({
    name: { type: String, required: true, unique : true },
    capacity: { type: Number, required: true },
    created_by: { type: ObjectId, ref: 'user'},
    dimensions: [{ type: Number, required: true }, { type: Number, required: true }],
    layout: [[{ type: Number, required: true }]], 
    default: { type: Boolean, required: true },
    description: { type: String }
},
{ 
    timestamps: true 
});
const SeatingLayout = mongoose.model('seatingLayout', seatingLayoutSchema, 'seatingLayout');

const sectionSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    admin: { type: ObjectId, ref: 'user' },
    professor: { type: ObjectId, ref: 'user' },
    max_capacity: { type: Number, required: true },
    registered_students: [ { type: ObjectId, ref: 'user' } ],
    class_list: [
        {
            name: String ,
            email: String
        } 
    ],
    attendance_threshold: { type: Number, required: true},
    attendance: [
        {
            date: Date,
            absent_students: [ { type: ObjectId, ref: 'user' } ],
            mandatory: { type: Boolean, required: true }
        }
    ],
    seating_layout: { type: ObjectId, ref: 'seatingLayout', required: true },
    seating_arrangement: [[ { type: ObjectId, ref: 'user' } ]],
    always_mandatory: { type: Boolean, required: true },
},
{ 
    timestamps: true 
});
const Section = mongoose.model('section', sectionSchema, 'section');
const ArchivedSection = mongoose.model('archivedSection', sectionSchema, 'archivedSection');

module.exports = {User, Section, SeatingLayout, ArchivedSection};

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
 * 
 *      default: a boolean value which indicates whether the seatingLayout is a default or custom layout
 * 
 * -------------
 * sectionSchema|
 * -------------
 *      class_list: An array of object which represent the name and email of some students. 
 *                  These students come from an excel file which a professor can upload while creating a section.
 *                  The students in the class list will have their attendance tracked even if they are not registered for the section in the application.
 *                  (This means if students aren't registered they will be added in the reports marked as absent).
 *                  *Note that this is only used if the section is set to be mandatory.
 * 
 *      attendence: An array of objects which contain the required elements for recordording a single day of attendence.
 *          -   seating_layout: The ObjectId of the chosen seating layout from the seating layout schema.
 *          -   seating_arrangement: A 2D array of identical coordinates as the seating_layout array. Each element represents a seat in the class
 *                                   and each element holds the ObjectId of students in the seats.
 *          -   section_type: a string which indicates whether the section is a Lecture, Lab or Tutorial.
 *          -   mandatory: A boolean value which indicates if a specifc class had mandatory attendence.
 *          
 *      always_mandatory: a boolean value which indicates whether all classes should be mandatory.
 **********************************************/
