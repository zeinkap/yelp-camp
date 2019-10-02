const   Campground 	= require("../models/campground"),
        Comment 	= require("../models/comment")

// all middleware here. Take 3 params.
let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    // if user is logged in...
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err || !foundCampground) {
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
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    // if user is logged in...
	if(req.isAuthenticated()) {
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
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    // req.flash() always used to display any type of message. Must be done before redirect.
    req.flash("error", "You need to be logged in to do that.");   // A key and value is passed to next route. Message only lasts for one request and does not persist.
    res.redirect("/login");
}

module.exports = middlewareObj;
