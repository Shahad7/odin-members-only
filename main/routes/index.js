var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const userController = require("../controllers/userController");

/* GET home page. */
router.get("/", function (req, res, next) {
    if (req.user) {
        res.render("index");
    } else {
        /*you would have to manually pass the req object to ejs to retrive the 
        req.session.messasges[]
        set by passport.authenticate() when you're using failureRedirect with failureMessage.
        Otherwise just redirect and pass error messages manually from the strategy
        */
        //res.render("login", { req: req });
        res.redirect("/login");
    }
});

router.get("/login", userController.login_get);

router.post("/login", userController.login_post);

router.get("/signup", userController.signup_get);

router.post("/signup", userController.signup_post);

module.exports = router;
