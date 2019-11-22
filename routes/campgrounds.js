const	express 		= require('express'),
		router 			= express.Router(),	// adding all the routes to the router object
		Campground 		= require('../models/campground'),
		middleware		= require('../middleware'),	// no need to include index.js 'cause its a special file already required in express node_modules
		NodeGeocoder 	= require('node-geocoder'),
		multer			= require('multer'),
		cloudinary 		= require('cloudinary')
 
// configuration for google maps
const options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};
let geocoder = NodeGeocoder(options);

//configuration for Multer
const storage = multer.diskStorage({
	filename: (req, file, callback) => {
		callback(null, Date.now() + file.originalname);	// naming file
	}
});
const imageFilter = (req, file, cb) => {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {	
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter });

cloudinary.config({ 
	cloud_name: 'zeinkap', 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
	req.body.campground.description = req.sanitize(req.body.campground.description);	// sanitize description field
	
	geocoder.geocode(req.body.location, (err, data) => {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			console.log(err);
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		// Create a new campground and save to DB
		cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
			if(err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			// add cloudinary url for the image to the campground object under image property
			req.body.campground.image = result.secure_url;
			// add image's public_id to campground object
			req.body.campground.imageId = result.public_id;
			// add author to campground
			req.body.campground.author = {
				id: req.user._id,
				username: req.user.username
			}

			Campground.create(req.body.campground, (err, campground) => {
				if(err) {
					req.flash("error", err.message);
					console.log(err);
					return res.redirect('back');
				} else {
					req.flash("success", "Campground has been added.");
					console.log("Created the following campground:");
					console.log(campground);
					res.redirect("/campgrounds/" + campground._id);   //although there are 2 of these routes, will redirect to GET by default
				}			  
			});
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
			return res.redirect("/campgrounds");
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), (req, res) => {
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
			req.flash("error", "Invalid address");
			return res.redirect("back");
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		//following method takes 3 arguments (id, newData, callback).
		Campground.findById(req.params.id, async (err, updatedCampground) => {
			if(err) {
				req.flash("error", "You do not have permission to do that.");
				console.log(err);
				return res.redirect("back");
			} else {
				if (req.file) {
					try {
						await cloudinary.v2.uploader.destroy(updatedCampground.imageId);
						let result = await cloudinary.v2.uploader.upload(req.file.path);
						updatedCampground.imageId = result.public_id;
						updatedCampground.image = result.secure_url;
					} catch(err) {
						req.flash("error", err.message);
						return res.redirect("back");
					}
				}
				// update fields
				updatedCampground.name = req.body.campground.name;
				updatedCampground.price = req.body.campground.price;
				req.body.campground.description = req.sanitize(req.body.campground.description);
				updatedCampground.description = req.body.campground.description;
				updatedCampground.lat = req.body.campground.lat;
				updatedCampground.lng = req.body.campground.lng;
				updatedCampground.location = req.body.campground.location;

				updatedCampground.save();
				req.flash("success", `Updated ${updatedCampground.name}`);
				console.log(updatedCampground);
				return res.redirect("/campgrounds/" + updatedCampground._id);
			}
		});
	});
});

// 7. DESTROY route - Removing campground 
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, async (err, deletedCampground) => {
		if(err) {
			req.flash("error", err.message);
			console.log(err);
			return res.redirect("back");
		} 
		try {
			await cloudinary.v2.uploader.destroy(deletedCampground.imageId);
			deletedCampground.remove();
			req.flash("success", `Deleted ${deletedCampground.name}`);
			console.log("Deleted the following campground:");
			console.log(deletedCampground);
			return res.redirect("/campgrounds");
		} catch(err) {
			if(err) {
				req.flash("error", err.message);
				return res.redirect("back");
			}
		}
	});
});

// function for searching for campgrounds
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;