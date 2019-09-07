const express = require("express");
const router = express.Router({mergeParams: true});     //this merges params from campground and comments, so :id can be defined 
const Campground = require("../models/campground");
const Comment = require("../models/comment");

//NEW route
router.get("/new", (req, res) => {
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
router.post("/", (req, res) => {
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
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
	//create new comment
	//connect new comment to campground
	//redirect campground to show page
});

// router.get("*", (req, res) => {
// 	res.send("Error! Page not found");
// });

module.exports = router;