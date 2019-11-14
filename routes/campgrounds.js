const	express 		= require("express"),
		router 			= express.Router(),	// adding all the routes to the router object
		Campground 		= require("../models/campground"),
		middleware		= require("../middleware"),	// no need to include index.js 'cause its a special file already required in express node_modules
		NodeGeocoder 	= require('node-geocoder')
 
let options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

let geocoder = NodeGeocoder(options);

// 1. INDEX route - shows all campgrounds
router.get("/", (req, res) => {
	let noMatch = null;
	if(req.query.search) {
		//Get all campgrounds from DB
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({$or: [{name: regex}, {location: regex}]}, (err, allCampgrounds) => {
			if(err) {
				req.flash("error", "Something went wrong.");
				console.log(err);
			} else {
				if(allCampgrounds.length < 1) {
					noMatch = "No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds : allCampgrounds, noMatch: noMatch});
			}
		});
	// else search has nothing in it
	} else {
		//Get all campgrounds from DB
		Campground.find({}, (err, allCampgrounds) => {
		if(err) {
			req.flash("error", "Something went wrong.");
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds : allCampgrounds, noMatch: noMatch});
		}
		});
	}
});

// 2. CREATE route - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
	// get data from form and add to campgronuds array     
	let name = req.body.name;
	let price = req.body.price;
	let image = req.body.image;
	let desc = req.body.description;
	req.body.description = req.sanitize(desc);	// sanitize description field
	let author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			console.log(err);
			return res.redirect('back');
		}
		let lat = data[0].latitude;
		let lng = data[0].longitude;
		let location = data[0].formattedAddress;
		let newCampground = {name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng};
		// Create a new campground and save to DB
		Campground.create(newCampground, (err, newlyCreated) => {
			if(err) {
				req.flash("error", "Something went wrong.");
				console.log(err);
			} else {
				req.flash("success", "Campground has been added.");
				console.log("Created the following campground:")
				console.log(newlyCreated);
				res.redirect("/campgrounds");   //although there are 2 of these routes, will redirect to GET by default
			}			  
		});
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
		if(err || !foundCampground) {
			req.flash('error', 'Sorry, that campground does not exist!');
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
		if(!foundCampground) {
			return res.status(400).send("Item not found.");   // will break out of middleware if its true
		}
		if(err) {
			req.flash("error", "You do not have permission to do that.");
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// 6. UPDATE route - updating details of an existing campground
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
		  req.flash('error', 'Invalid address');
		  return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		// prevent user from sending code in description field 
		req.body.campground.description = req.sanitize(req.body.campground.description);
		//following method takes 3 arguments (id, newData, callback). The newData is our input name from form 
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
			if(err) {
				req.flash("error", "You do not have permission to do that.");
				console.log(err);
				res.redirect("/campgrounds");
			} else {
				req.flash("success", "Successfully updated " + updatedCampground.name);
				console.log(updatedCampground);
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
});

// 7. DESTROY route - Removing campground 
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err, deletedCampground) => {
		if(err) {
			req.flash("error", "You do not have permission to do that.");
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			req.flash("success", deletedCampground.name + " has been deleted.");
			console.log("Deleted the following campground:");
			console.log(deletedCampground);
			res.redirect("/campgrounds");
		}
	});
});

// function for searching for campgrounds
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;