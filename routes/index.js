const   express     = require("express"),
        router      = express.Router(),
        User        = require("../models/user"),
        passport    = require("passport")

router.get("/", (req, res) => {
    res.render("landing");
});

//AUTH ROUTES
router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {    // register is a method provided by passportLocalMongoose
        if(err) {
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("/register");  // return used to quickly get out of call back
        } else {
            // after user created and no error, then user will be authenticated (serialize method also run). Using local strategy.
            passport.authenticate("local")(req, res, function() {
                //after user is logged in 
                req.flash("success", "Welcome to YelpCamp " + user.username + "!");
                res.redirect("/campgrounds");
            });
        }
    });
});

router.get("/login", (req, res) => {
    res.render("login"); // message will come from what we stated in our isLoggedIn middleware
});
// passport addded as middleware (runs before callback, between start and end of route) 
// Dont need to specify username/password (passport gets it from req.body and authenticates with whats in DB)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",     
    failureRedirect: "/login"
}), (req, res) => { // dont need callback code but will just keep to show middleware
    if (failureRedirect) {
        req.flash("error", "Invalid Username or Password. Please try again.");
    }
}); 
// after authenticating, user is serialized and stores in session object provided by express-session.

router.get("/logout", (req, res) => {
    req.logout();   //using passport to expire session
    req.flash("success", "You have logged out.");
    res.redirect("/campgrounds");
});

module.exports = router;