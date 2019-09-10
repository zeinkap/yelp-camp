const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

//AUTH ROUTES
router.get("/", (req, res) => {
    res.render("login");
});

router.get("/secret", (req, res) => {
    res.render("secret");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;   // we do not save password to DB
    User.register(new User({username: username}), password, (err, user) => {
        if(err) {
            console.log(err);
            return res.render("register");
        } else {
            // after user created and no error, then user will be authenticated (serialize method also run). Using local strategy (may use google).
            passport.authenticate("local")(req, res, function() {
                //after user is logged in
                res.redirect("/secret");
            });
        }
    });
});

module.exports = router;