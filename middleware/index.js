const   Campground 	= require("../models/campground"),
        Comment 	= require("../models/comment")

const middleware = {
    
    // function that takes another function (i.e route handler) and wraps it in a promise
    // Promise.resolve will resolve with whatever value our route handler returns
    asyncErrorHandler: (fn) => 
        (req, res, next) => {
            Promise.resolve(fn(req, res, next))
                .catch(next);   // if promise rejected comes here to give error to express middleware to handler
    },
    
    checkCampgroundOwnership: (req, res, next) => {
        // if user is logged in...
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, (err, foundCampground) => {
                if (err || !foundCampground) {
                    req.flash("error", "Sorry that campground does not exist!");
                    console.log(err);
                    res.redirect("/campgrounds");	
                } else if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    // does user own the campground?
                        req.campground = foundCampground;
                        next();	// runs code that is in the route
                    } else {
                        req.flash("error", "You do not have permission to do that.");
                        res.redirect("back");
                    }
            });
        } else {	//if user is not logged in...
            req.flash("error", "You need to be logged in to do that.");
            res.redirect("back");	
        }
    },

    apiCheckCampgroundOwnership: (req, res, next) => {
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, (err, foundCampground) => {
                if (err || !foundCampground) {
                    res.status(404).send("Sorry that campground does not exist!");
                } else if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                        req.campground = foundCampground;
                        next();	
                    } else res.status(403).send("You do not have permission to do that.")
            });
        // if user not logged in
        } else res.status(401).send("You need to be logged in to do that.")
    },

    checkCommentOwnership: (req, res, next) => {
        // if user is logged in...
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, (err, foundComment) => {
                if(err || !foundComment) {
                    req.flash("error", "Sorry that comment does not exist!");
                    console.log(err);
                    res.redirect("/campgrounds");
                } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {    // req.user is from passport
                    // does user own the comment?
                        req.comment = foundComment;
                        next();	// moves on to run code in route handler
                    } else {
                        req.flash("error", "You do not have permission to do that.");
                        res.redirect("back");
                    }
            });
        } else {	//if user is not logged in...
            req.flash("error", "You need to be logged in to do that.");
            res.redirect("back");	
        }
    },

    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        // req.flash() to display a message. Must be done before redirect.
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/login");
    },

    apiIsLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
            res.status(200).send("User has successfully logged in.");
        } 
        res.status(401).send("You need to be logged in to do that.")
    },

    isPaid: (req, res, next) => {
        if (req.user.isPaid) return next();
        req.flash("error", "Please pay registration fee before continuing");
        res.redirect("/checkout");
    }

};

module.exports = middleware;
