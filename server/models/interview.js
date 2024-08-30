const mongoose = require("mongoose");
const { Schema } = mongoose;

const interviewSchema = new Schema({
    candidateName: {
        type: "String"
    },
    candidateEmail: {
        type: "String"
    },
    result: [
        {
            template: {
                type: Schema.ObjectId,
                ref: "Template",
                required: true
            },
            parameterValues: [Number],
            note: {
                type: String
            },
        }
    ],
    overallNote: {
        type: String
    }
}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);
module.exports = Interview;
