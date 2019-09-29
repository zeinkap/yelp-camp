const   Campground 	= require("../models/campground"),
        Comment 	= require("../models/comment")

// all middleware here. Take 3 params.
let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    // if user is logged in...
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err) {
                console.log(err);
                res.redirect("back");	// takes user to the previous page they were on 
            } else {
                // does user own the campground?
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();	// runs code that is in the route
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {	//if user is not logged in...
        res.redirect("back");	
    }
}

middlewareObj.checkCommentOwnership = (req, res, next) => {
    // if user is logged in...
	if(req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			if(err) {
				console.log(err);
				res.redirect("back");
			} else {
				// does user own the comment?
				if (foundComment.author.id.equals(req.user._id)) {	// req.user is from passport
					next();	// moves on to run code in route handler
				} else {
					res.redirect("back");
				}
			}
		});
	} else {	//if user is not logged in...
		res.redirect("back");	
	}
}

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = middlewareObj;
