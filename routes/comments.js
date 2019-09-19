const express = require("express");
const router = express.Router({mergeParams: true});     //this merges params from campground and comments, so :id can be defined 
const Campground = require("../models/campground");
const Comment = require("../models/comment");

//NEW route
router.get("/new", isLoggedIn, (req, res) => {
	//find campground by id
	Campground.findById(req.params.id, (err, campground) => {
		if(err) {
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
});

//CREATE Route 
router.post("/", isLoggedIn, (req, res) => {	// adding middleware here too, so comment cannot be inserted via postman
	//lookup campground using id
	Campground.findById(req.params.id, (err, campground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if(err) {
					console.log(err);
				} else {
					// add username and id to comment. Then save. 
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					//console.log(comment);
					campground.comments.push(comment);	//connect new comment to campground
					campground.save();
					res.redirect("/campgrounds/" + campground._id); // redirect campground to show page
				}
			});
		}
	});
});

//custom defined middleware. Takes these 3 params.
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;