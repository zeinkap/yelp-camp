const	express 		= require("express"),
		router 			= express.Router(),	// adding all the routes to the router object
		Campground 		= require("../models/campground"),
		middleware		= require("../middleware")	// no need to include index.js 'cause its a special file already required in express node_modules

// 1. INDEX route - shows all campgrounds
router.get("/", (req, res) => {
	//Retrieving campgrounds from DB
	Campground.find({}, (err, allCampgrounds) => {
	if(err) {
		console.log(err);
	} else {
		res.render("campgrounds/index", {campgrounds : allCampgrounds});
	}
	});
});

// 2. CREATE route - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => {     
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	req.body.description = req.sanitize(req.body.description);	// sanitize description field
	let author = {
		id: req.user._id,
		username: req.user.username
	}
	let newCampground = {name: name, image: image, description: desc, author: author}
	// Create campground and save to DB
	Campground.create(newCampground, (err, newlyCreated) => {	//the req.body.campground object (from the form) contains all the input values
		if(err) {
			console.log(err);
		} else {
			console.log("Created the following campground:")
			console.log(newlyCreated);
			res.redirect("/campgrounds");   //although there are 2 of these routes, will redirect to GET by default
		}			  
	});
});

// 3. NEW route - shows form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => { 
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
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

// 6. UPDATE route - updating details of an existing campground
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	// prevent user from sending code in description field 
	req.body.campground.description = req.sanitize(req.body.campground.description);
	//following method takes 3 arguments (id, newData, callback) // the newData is our input name from form 
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// 7. DESTROY route - Removing campground 
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err, deletedCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			console.log("Deleted the following campground:");
			console.log(deletedCampground);
			res.redirect("/campgrounds");
		}
	});
});

// router.get("*", (req, res) => {
// 	res.send("Error! Page not found");
// });

module.exports = router;