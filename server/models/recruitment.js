const mongoose = require("mongoose");
const { Schema } = mongoose;

const recruitmentSchema = new Schema({
    name: {
        type: "String"
    },
    description: {
        type: "String"
    },
    applications: [
        {
            type: Schema.ObjectId,
            ref: "Application"
        }
    ],
    hiringStarts: {
        type: "Date"
    },
    hiringEnds: {
        type: "Date"
    }
});

const Recruitment = new mongoose.model("Recruitment",recruitmentSchema);

module.exports = Recruitment;