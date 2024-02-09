const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const Message = require("../models/message");

/* simple authentication below,it's important to pass the args to middleware and call
req.login and redirect as a callback to login this way*/
exports.login_post = function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
        if (err) next(err);
        if (!user) {
            res.render("login", { err: info });
        } else {
            req.login(user, (err) => {
                if (err) next(err);
                res.redirect("/");
            });
        }
    })(req, res, next);
};

/*
you can use successRedirect simply as well
exports.login_post = [
    passport.authenticate("local", {
        failureRedirect: "/",
        failureMessage: true,
    }),
    function (req, res) {
        res.redirect("/");
    },
];*/

exports.login_get = function (req, res, next) {
    res.render("login");
};

exports.signup_get = function (req, res, next) {
    res.render("signup");
};

exports.signup_post = [
    body("name").isLength({ min: 3, max: 50 }).escape(),
    body("email")
        .trim()
        .isEmail()
        .withMessage("invalid email")
        .escape()
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error("email already in use :(");
            }
            return true;
        }),

    body("password")
        .isLength({ min: 4 })
        .withMessage("min lenght : 4")
        .escape(),
    body("confirm_password")
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage("passwords don't match"),
    body("admin_code")
        .trim()
        .escape()
        .custom((value) => {
            if (value.length != 0 && value != "")
                return value === process.env.ADMINCODE;
            else return true;
        })
        .withMessage("admin code incorrect!"),
    asyncHandler(async function (req, res, next) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            await bcrypt.hash(
                req.body.password,
                10,
                async (err, hashedPassword) => {
                    if (!err) {
                        const user = new User({
                            email: req.body.email,
                            name: req.body.name,
                            password: hashedPassword,
                            status:
                                req.body.admin_code === process.env.ADMINCODE
                                    ? "admin"
                                    : "non-member",
                        });

                        await user.save();
                        res.redirect("/login");
                    } else {
                        errors = errors.array().push(err);
                        res.render("signup", {
                            user: {
                                email: req.body.email,
                                name: req.body.name,
                                password: req.body.password,
                                confirm_password: req.body.confirm_password,
                            },
                            errors: errors,
                        });
                    }
                }
            );
        } else
            res.render("signup", {
                user: {
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password,
                    confirm_password: req.body.confirm_password,
                },
                errors: errors.array(),
            });
    }),
];

exports.logout = function (req, res, next) {
    req.logout((err) => {
        if (err) next(err);
        else res.redirect("/");
    });
};

exports.join_club = [
    body("secret_code")
        .notEmpty()
        .withMessage("enter the code or else out!")
        .escape()
        .custom((value) => {
            if (value.length != 0) return value === process.env.CODE;
            else return true;
        })
        .withMessage("wrong code oopsie :("),
    asyncHandler(async function (req, res, next) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            if (req.body.secret_code === process.env.CODE) {
                const user = await User.updateOne(
                    { _id: req.user._id },
                    { $set: { status: "member" } }
                );
                res.redirect("/");
            }
        } else {
            const messages = await Message.find()
                .populate("sender", "name")
                .exec();
            res.render("index", {
                club_errors: errors.array(),
                messages: messages,
            });
        }
    }),
];
