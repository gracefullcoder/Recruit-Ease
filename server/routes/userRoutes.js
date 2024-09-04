const express = require("express");
const router = express.Router();
const { wrapAsync } = require("../utils/wrapAsyncAndExpressError");
const User = require("../models/user");
const Template = require("../models/template");
const Interview = require("../models/interview");

router.post("/login", wrapAsync(async (req, res) => {
    console.log("in");
    const { emailId, name, picture } = req.body;
    const user = await User.findOne({ emailId });

    if (!user) {
        const newUser = new User({ name, emailId, picture });
        await newUser.save();
        return res.status(200).json({ success: true, message: "Welcome to Peer Link" });
    }

    return res.status(200).json({ success: true, message: "Logged In Successfully!" });
}));

router.post("/user", wrapAsync(async (req, res) => {
    const { emailId } = req.body;
    const userDetails = await User.findOne({ emailId })
        .populate({
            path: 'templates'
        })
        .populate({
            path: 'interviews',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'result.template',
                model: 'Template'
            }
        }); console.log(userDetails);
    res.status(200).json({ succes: true, message: userDetails });
}))

router.post("/template/:id", wrapAsync(async (req, res) => {
    const { name, parameters, expectedDuration } = req.body;
    const { id } = req.params;
    console.log(parameters);
    let ParametersData = parameters.map(p => ({ question: p }))
    const newTemplate = new Template({ name, parameters: ParametersData, expectedDuration });
    await newTemplate.save();
    console.log(newTemplate);
    await User.findOneAndUpdate({ emailId: id }, { $push: { templates: newTemplate } });
    res.status(200).json({ success: true, message: newTemplate });
}))

router.post("/interview", wrapAsync(async (req, res) => {
    const { name, emailId, templatesUsed, interviewerMail } = req.body;
    console.log(templatesUsed);
    const templates = await Template.find({ _id: { $in: templatesUsed } });
    const result = templates.map((template) => {
        return {
            template: template._id,
            parameterValues: Array(template.parameters.length).fill(0),
        }
    })
    console.log(result);
    const interview = new Interview({ candidateName: name, candidateEmail: emailId, result, overallNote: "" });
    await interview.save();
    await User.findOneAndUpdate({ emailId: interviewerMail }, { $push: { interviews: interview } });
    res.status(200).json({ success: true, message: { interviewId: interview._id } });
}))

router.post("/interview/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { templateId, parameterValues } = req.body;
    console.log(parameterValues, templateId);
    if (templateId == true) {
        const updateDetails = await Interview.findOneAndUpdate({ _id: id }, { overallNote: parameterValues }, { new: true });
        console.log(updateDetails);
    }
    else if (typeof (parameterValues) == "string") {
        const updateDetails = await Interview.findOneAndUpdate({ _id: id, "result.template": templateId }, { $set: { "result.$.note": parameterValues } }, { new: true });
        console.log(updateDetails);
    } else {
        const updateDetails = await Interview.findOneAndUpdate({ _id: id, "result.template": templateId }, { $set: { "result.$.parameterValues": parameterValues } }, { new: true });
        console.log(updateDetails);
    }
    res.status(200).json({ success: true, message: "Data Saved" });
}))


router.get("/interview/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { templateId, parameterValues } = req.body;
    console.log(parameterValues, templateId);
    const interviewDetails = await Interview.findById(id);
    res.status(200).json({ success: true, message: interviewDetails });
}))



module.exports = router;

