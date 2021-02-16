const mongoose = require("mongoose");
const {Schema } = mongoose;

const TaskSchema = new Schema({
    title: {type: String, require: true},
    description: {type: String, require: false},
    priority: {type: String, require: true},
    date: {type: Date, require: true}
    //author: {type: String, required: true}
});

module.exports = mongoose.model("Task", TaskSchema);