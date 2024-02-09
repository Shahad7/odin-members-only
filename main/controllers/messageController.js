const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.new_message = [
    body("title")
        .isLength({ min: 3, max: 30 })
        .notEmpty()
        .withMessage("title required")
        .escape(),
    body("content")
        .isLength({ min: 3, max: 300 })
        .notEmpty()
        .withMessage("content required")
        .escape(),

    asyncHandler(async function (req, res, next) {
        const errors = validationResult(req);
        const message = new Message({
            title: req.body.title,
            content: req.body.content,
            timestamp: new Date(),
            sender: req.user._id,
        });
        if (errors.isEmpty()) {
            await message.save();
            res.redirect("/");
        } else {
            const messages = await Message.find()
                .populate("sender", "name")
                .exec();
            res.render("index", {
                errors: errors.array(),
                message: message,
                messages: messages,
            });
        }
    }),
];

exports.delete_message = asyncHandler(async function (req, res, next) {
    console.log(req.params.message_id);
    await Message.findByIdAndDelete(req.params.message_id);
    res.redirect("/");
});
