const   User = require("../models/user"),
        Campground  = require("../models/campground"),
        Notification = require("../models/notification"),
        passport = require("passport")

module.exports = {
    getLanding(req, res, next) {
        res.render("landing");
    },

    getSignup(req, res, next) {
        res.render("sign-up");
    },

    async postSignup(req, res, next) {
        try {
            const newUser = new User(req.body);
            if(req.body.adminCode === 'secret123') newUser.isAdmin = true;

            await User.register(newUser, req.body.password);
            // user will be authenticated (serialize method also run) using local strategy
            passport.authenticate("local")(req, res, function() {
                //after user is logged in 
                req.flash("success", "Welcome to YelpCamp " + user.username + "!");
                console.log(newUser);
                res.redirect("/campgrounds");
            });
        } catch (err) {
            req.flash("error", err.message);
            console.log(err);
            return res.redirect("back");
        }
    },

    getLogin(req, res, next) {
        res.render("login");
    },

    postLogin(req, res, next) {
        // passport gets username/password from req.body and authenticates with whats in DB
        const { username } = req.body;
        passport.authenticate('local', (err, user, info) => {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/login'); }
            req.login(user, function(err) {
                if (err) { 
                    req.flash("failure", "Invalid username or password. Please try again.")
                    return next(err); 
                }
                req.flash("success", `Welcome, ${username}!`);
                return res.redirect("/campgrounds");
            });
          })(req, res, next);
    },

    logout(req, res, next) {
        req.logout();   //using passport to expire session
        req.flash("success", "You have logged out.");
        res.redirect("/campgrounds");
    },

    async getProfile(req, res, next) {
        const foundUser = await User.findById(req.params.id);
        const campgrounds = await Campground.find().where("author.id").equals(foundUser._id).exec();
        res.render("users/show", { foundUser, campgrounds });
    },

    async seeOtherUserProfiles(req, res, next) {
        let user = await User.findById(req.params.id).populate('followers').exec();
        res.render("profile", { user });    // if both variable and value are same we can just pass user
    },

    async followUser(req, res, next) {
        let user = await User.findById(req.params.id);  // finding user that wants to be followed
        user.followers.push(req.user._id);  // pushing user that is logged into followers array
        user.save();
        req.flash('success', `Successfully followed ${user.username}!`);
        res.redirect('/users/' + req.params.id);
    },

    async getNotifications(req, res, next) {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: { sort: { "_id": -1 }} //sorting in descending order
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
    },

    async handleNotifications(req, res, next) {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true; // started off as false
        notification.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`);
    }

}
        