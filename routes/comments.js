const	express 		= require("express"),
		router 			= express.Router({mergeParams: true}),	//merges params from campground and comments so :id can be defined 
		Campground 		= require("../models/campground"),
		Comment 		= require("../models/comment")
		
const { 
	checkCommentOwnership, 
	isLoggedIn, 
	isPaid 
} = require("../middleware");

//router.use(isLoggedIn, isPaid);

//NEW route
router.get("/new", isLoggedIn, (req, res) => {
	//find campground by id
	Campground.findById(req.params.id, (err, campground) => {
		if(err) {
			req.flash("error", "Something went wrong.");
			console.log(err);
		} else {
			res.render("comments/new", { campground });	// rendering page with the campground object that was found
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
					req.flash("error", "Something went wrong.");
					console.log(err);
				} else {
					// add username and id to comment. Then save. 
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					//console.log(comment);
					campground.comments.push(comment);	//connect new comment to campground
					campground.save();
					req.flash("success", "Your comment has been added.");
					res.redirect("/campgrounds/" + campground._id); // redirect to show page
				}
			});
		}
	});
});

// EDIT route
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err) {
			req.flash("error", "You do not have permission to do that.");
			res.redirect("back");
			console.log(err)
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});	// campground_id  also gets passed into edit form 
		}
	});
});

// UPDATE route
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err) {
			req.flash("error", "You do not have permission to do that.");
			res.redirect("back");
			console.log(err);
		} else {
			req.flash("success", "Your comment has been updated.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY route - delete comment
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err, deletedComment) => {
		if(err) {
			req.flash("error", "You do not have permission to do that.");
			res.redirect("back");
			console.log(err);
		} else {
			req.flash("success", "Your comment has been deleted.");
			console.log("Deleted the following comment:");
			console.log(deletedComment);
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;