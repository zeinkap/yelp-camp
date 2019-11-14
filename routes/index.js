const   express     = require("express"),
        router      = express.Router(),
        passport    = require("passport"),
        User        = require("../models/user"),
        Campground  = require("../models/campground")

// root route
router.get("/", (req, res) => {
    res.render("landing");
});

// show register form
router.get("/register", (req, res) => {
    res.render("register");
});

// handle signup logic
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username, 
        avatar: req.body.avatar,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    });

    if(req.body.adminCode === 'secret123') {
        newUser.isAdmin = true;
    }
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
                console.log(newUser);
                res.redirect("/campgrounds");
            });
        }
    });
});

// show login form
router.get("/login", (req, res) => {
    res.render("login"); // message will come from what we stated in our isLoggedIn middleware
});

// handle login logic
// passport addded as middleware (runs before callback, between start and end of route) 
// Dont need to specify username/password (passport gets it from req.body and authenticates with whats in DB)
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",     
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) => { // dont need callback code but will just keep to show middleware
}); 
// after authenticating, user is serialized and stores in session object provided by express-session.

// logout route
router.get("/logout", (req, res) => {
    req.logout();   //using passport to expire session
    req.flash("success", "You have logged out.");
    res.redirect("/campgrounds");
});

// User Profile
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err) {
            req.flash("error", "User profile was not found.");
            console.log(err);
            return res.redirect("/");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
            if(err) {
                req.flash("error", "Something went wrong");
                console.log(err);
                return res.redirect("/");
            }
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        });
    });
});

module.exports = router;