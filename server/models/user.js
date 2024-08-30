const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    picture:{
        type:"String"
    },
    templates: [
        {
            type: Schema.ObjectId,
            ref: "Template"
        }
    ],
    interviews: [
        {
            type: Schema.ObjectId,
            ref: "Interview"
        }
    ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
