var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const userController = require("../controllers/userController");
const messageController = require("../controllers/messageController");
const Message = require("../models/message");

/* GET home page. */
router.get(
    "/",
    asyncHandler(async function (req, res, next) {
        if (req.user) {
            const messages = await Message.find()
                .populate("sender", "name")
                .exec();

            res.render("index", { messages: messages });
        } else {
            /*you would have to manually pass the req object to ejs to retrive the 
        req.session.messasges[]
        set by passport.authenticate() when you're using failureRedirect with failureMessage.
        Otherwise just redirect and pass error messages manually from the strategy
        */
            //res.render("login", { req: req });
            res.redirect("/login");
        }
    })
);

router.get("/login", userController.login_get);

router.post("/login", userController.login_post);

router.get("/signup", userController.signup_get);

router.post("/signup", userController.signup_post);

router.get("/logout", userController.logout);

router.post("/new_message", messageController.new_message);

router.post("/join_club", userController.join_club);

router.get("/delete_message/:message_id", messageController.delete_message);

module.exports = router;
