const mongoose = require("mongoose");
const { Schema } = mongoose;

const templateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    parameters: [
        {
            question: {
                type: String,
                required: true
            }
        }
    ],
    expectedDuration: {
        type: Number
    }
});

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;
