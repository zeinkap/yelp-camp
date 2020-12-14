const User = require("../models/user"),
    Campground = require("../models/campground"),
    Notification = require("../models/notification"),
    passport = require("passport"),
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


module.exports = {
    getLanding(req, res, next) { res.render("landing") },    // implicit return

    getSignup(req, res, next) { res.render("sign-up") },

    async postSignup(req, res, next) {
        try {
            const newUser = await new User(req.body);
            // check if new account is of admin status
            if (req.body.adminCode === 'secret123') newUser.isAdmin = true;
            await User.register(newUser, req.body.password);
            // log the user in, authenticate using local strategy
            passport.authenticate("local")(req, res, () => {
                // after user is logged in 
                req.flash("success", `Welcome to YelpCamp, ${newUser.username}!`);
                console.log(newUser);
                return res.redirect("/campgrounds");
            });
        } catch (error) {
            req.flash("error", error.message);
            console.log(error);
            return res.redirect("back");
        }
    },

    getLogin(req, res, next) { res.render("login") },

    postLogin(req, res, next) {
        // passport gets username/password from req.body and authenticates with whats in DB
        const { username } = req.body;
        passport.authenticate('local', (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.redirect("/login"); 
            req.logIn(user, (err) => {
                req.flash("success", `Welcome, ${username}!`);
                return res.redirect("/campgrounds");
            });
        }) (req, res, next);
    },

    logout(req, res, next) {
        req.logout(); // using passport to expire session
        req.flash("success", "You have logged out.");
        return res.redirect("/campgrounds");
    },

    async getProfile(req, res, next) {
        try {
            const foundUser = await User.findById(req.params.id);
            const campgrounds = await Campground.find().where("author.id").equals(foundUser._id).exec();
            return res.render("users/show", { foundUser, campgrounds });
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
        
    },

    async seeOtherUserProfiles(req, res, next) {
        try {
            const user = await User.findById(req.params.id).populate('followers').exec();
            return res.render("profile", { user }); // if both variable and value are same we can just pass user
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
    },

    async followUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id); // finding user that wants to be followed
            user.followers.push(req.user._id); // pushing user that is logged into followers array
            await user.save();
            req.flash('success', `Successfully followed ${user.username}!`);
            return res.redirect('/users/' + req.params.id);
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
    },

    async getNotifications(req, res, next) {
        try {
            const user = await User.findById(req.user._id).populate({
                path: 'notifications',
                options: {
                    sort: {
                        "_id": -1   //sort in desc order
                    }
                } 
            }).exec();
            let allNotifications = user.notifications;
            return res.render('notifications/index', { allNotifications });
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
    },

    async handleNotifications(req, res, next) {
        try {
            const notification = await Notification.findById(req.params.id);
            notification.isRead = true; // started off as false
            await notification.save();
            return res.redirect(`/campgrounds/${notification.campgroundId}`);
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
    },

    async checkout(req, res, next) {
        try {
            if (req.user.isPaid) {
                req.flash('success', 'Your account is already paid');
                return res.redirect('/campgrounds');
            }
            return res.render('checkout', { amount: 20 });
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
    },

    async pay(req, res, next) {
        const {
            paymentMethodId,
            items,
            currency
        } = req.body;

        const amount = 2000;

        try {
            // Create new PaymentIntent with a PaymentMethod ID from the client.
            const intent = await stripe.paymentIntents.create({
                amount,
                currency,
                payment_method: paymentMethodId,
                error_on_requires_action: true,
                confirm: true
            });

            console.log("💰 Payment received!");

            req.user.isPaid = true;
            await req.user.save();
            // The payment is complete and the money has been moved
            // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

            // Send the client secret to the client to use in the demo
            res.send({
                clientSecret: intent.client_secret
            });
        } catch (e) {
            // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
            // See https://stripe.com/docs/declines/codes for more
            if (e.code === "authentication_required") {
                res.send({
                    error: "This card requires authentication in order to proceeded. Please use a different card."
                });
            } else {
                res.send({
                    error: e.message
                });
            }
        }
    },

    apiPostLogin(req, res, next) {
        // passport gets username/password from req.body and authenticates with whats in DB
        const { username } = req.body;
        console.log(username);
        passport.authenticate('local', (err, user, info) => {
            if (err) res.status(401).send("Sorry, please try again.")
            if (!user) res.status(400).send("Incorrect username/password. Please try again.")
            req.logIn(user, (err) => {
                res.status(200).json(`Welcome, ${username}!`);
            });
        }) (req, res, next);
    },

    apiLogout(req, res, next) {
        req.logout(); // using passport to expire session
        res.status(200).send("Logged out.");
    },

    async apiPostSignup(req, res, next) {
        try {
            const newUser = await new User(req.body);
            console.log(newUser);
            // check if passwords match
            if (newUser.password != newUser.password2) res.status(400).send("Passwords do not match");
            // check if new account is of admin status
            if (req.body.adminCode === 'secret123') newUser.isAdmin = true;
            // check if email exists
            const emailExists = await User.findOne({email: newUser.email});
            if(emailExists) return res.status(400).send("Email already exists");

            // save user
            await User.register(newUser, req.body.password);
            // log the user in, authenticate using local strategy
            passport.authenticate("local")(req, res, () => {
                res.status(200).json(`Welcome to YelpCamp, ${newUser.username}!`);
            });
        } catch (error) {
            res.status(400).json(error);
        }
    },

    async apiGetProfile(req, res, next) {
        try {
            const user = await User.findById(req.params.id);
            const campgrounds = await Campground.find().where("author.id").equals(foundUser._id).exec();
            res.status(200).json(`Profile => ${user}, list of campgrounds => ${campgrounds}`);
        } catch (error) {
            res.status(400).json(error);
        }
    },

}