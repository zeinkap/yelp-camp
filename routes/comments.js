const	express 		= require("express"),
		router 			= express.Router({mergeParams: true}),	//this merges params from campground and comments, so :id can be defined 
		Campground 		= require("../models/campground"),
		Comment 		= require("../models/comment"),
		middleware		= require("../middleware")	// dont need to include index.js cuz its a special file already required in express node_modules

//NEW route
router.get("/new", middleware.isLoggedIn, (req, res) => {
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
router.post("/", middleware.isLoggedIn, (req, res) => {	// adding middleware here too, so comment cannot be inserted via postman
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

// EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err) {
			res.redirect("back");
			console.log(err)
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});	// campground_id  also gets passed into edit form 
		}
	});
});

// UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err) {
			res.redirect("back");
			console.log(err);
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY route - delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err, deletedComment) => {
		if(err) {
			res.redirect("back");
			console.log(err);
		} else {
			console.log("Deleted the following comment:");
			console.log(deletedComment);
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;