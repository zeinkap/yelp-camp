const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

//AUTH ROUTES
router.get("/secret", isLoggedIn, (req, res) => {   //if user is logged in then the secret page will be shown
    res.render("secret");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {    // register is a method provided by passportLocalMongoose
        if(err) {
            console.log(err);
            return res.render("register");  // return used to quickly get out of call back
        } else {
            // after user created and no error, then user will be authenticated (serialize method also run). Using local strategy.
            passport.authenticate("local")(req, res, function() {
                //after user is logged in 
                res.redirect("/campgrounds");
            });
        }
    });
});

router.get("/login", (req, res) => {
    res.render("login");
});
// passported addded as middleware (runs before callback, between start and end of route) 
// Dont need to specify username/password (passport gets it from req.body and authenticates with whats in DB)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",     
    failureRedirect: "/login"
}), (req, res) => { // dont need callback code but will just keep to show middleware
}); 
// after authenticating, user is serialized and stores in session object provided by express-session.

router.get("/logout", (req, res) => {
    req.logout();   //using passport to expire session
    res.redirect("/campgrounds");
});

//writing our own middleware. Always takes these 3 params.
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;