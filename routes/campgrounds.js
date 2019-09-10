const express = require("express");
const router = express.Router();    // adding all the routes to the router object
const Campground = require("../models/campground");

// 1. INDEX route - shows all campgrounds
router.get("/", (req, res) => {
	//rather than getting from array we will retrieve camps from DB
	Campground.find({}, (err, allCampgrounds) => {	//campgrounds here is placeholder for the data coming back from DB from out .find
	if(err) {
		console.log(err);
	} else {
		res.render("campgrounds/index", {campgrounds : allCampgrounds});	//rendering index file along with the data sent under the first name campgrounds
	}
	});
});

// 2. CREATE route - add new campground to DB
router.post("/", (req, res) => {     //not same as GET, we are following REST convention format
	//sanitizer here
	req.body.campground.description = req.sanitize(req.body.campground.description);	//taking what its equal to and sanitizing it
	// Create campground and save to DB
	Campground.create(req.body.campground, (err, newCampground) => {	//the req.body.campground object (from the form) contains all the input values
		if(err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");   //event though there are 2 of these routes, it will redirect to GET by default
		}			  
	});
});

// 3. NEW route - shows form to create new campground
router.get("/new", (req, res) => { 
    res.render("campgrounds/new");
});

// 4. SHOW route - shows info about a specific campground. ***This should always come after NEW route or else it will overide it. id comes from mongo DB
router.get("/:id", (req, res) => {	
	//find campground with provided ID from url and using mongoose function findbyid
	//populating comments array (which was associated with campground) so it's not just an id
	Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {	//foundCampground serves as placeholder for our data that we get back from DB
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});	//campground is just name we give, more importantly the value of id we found will be displayed
		}
	});
});

// 5. EDIT route - editing a campground
router.get("/:id/edit", (req, res) => {
	//need to find that campground data from id so it prefills form
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// 6. UPDATE route - updating details of an existing campground
router.put("/:id", (req, res) => {
	req.body.campground.description = req.sanitize(req.body.campground.description);
	//following method takes 3 arguments (id, newData, callback) // the newData is our input name from form
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updateCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// 7. DESTROY route - Removing campground 
router.delete("/:id", (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

router.get("*", (req, res) => {
	res.send("Error! Page not found");
});

module.exports = router;