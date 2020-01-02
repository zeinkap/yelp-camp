const   express     = require("express"),
        router      = express.Router(),
        passport    = require("passport"),
        User        = require("../models/user"),
        Campground  = require("../models/campground"),
        Notification = require("../models/notification"),
        middleware	= require("../middleware")

// root route
router.get("/", (req, res) => {
    res.render("landing");
});

// show sign-up form
router.get("/sign-up", (req, res) => {
    res.render("sign-up");
});

// handle signup logic
router.post("/sign-up", (req, res) => {
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
            return res.redirect("/sign-up");  // return used to quickly get out of call back
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

// Logged in user's profile
router.get("/profile/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err) {
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("back");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec( (err, campgrounds) => {
            if(err) {
                req.flash("error", err.message);
                console.log(err);
                return res.redirect("back");
            }
            res.render("users/show", { user:foundUser, campgrounds: campgrounds });
        })
    }); 
});

// seeing user's profile
router.get("/users/:id", async function(req, res) {
    try {
        let user = await User.findById(req.params.id).populate('followers').exec();
        res.render("profile", { user });    // if both variable and value are same we can just pass user
    } catch (err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("back");
    }
});

// follow user
router.get("/follow/:id", middleware.isLoggedIn, async function(req, res) {
    try {
        let user = await User.findById(req.params.id);  // finding user that wants to be followed
        user.followers.push(req.user._id);  // pushing user that is logged into followers array
        user.save();
        req.flash('success', `Successfully followed ${user.username}!`);
        res.redirect('/users/' + req.params.id);
    } catch(err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("back");
    }
});

// view all notifications
router.get("/notifications", middleware.isLoggedIn, async function(req, res) {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: { sort: { "_id": -1 }} //sorting in descending order
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
    } catch(err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("back");
    }
});

// handle notifications
router.get("/notifications/:id", middleware.isLoggedIn, async function(req, res) {
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true; // started off as false
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`);
    } catch(err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("back");
    }
});

module.exports = router;