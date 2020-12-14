const	express 		= require("express"),
		router 			= express.Router()	// adding all the routes to the router object
 
const { 
	checkCampgroundOwnership, 
	isLoggedIn,
} = require("../middleware");

const {
	options,
    geocoder,
    storage, 
    imageFilter,
	upload,
	cloudinary,
	searchCampround,
	addCampground,
	showCampground,
	editCampground,
	updateCampground,
	deleteCampground,
} = require("../controllers/campgrounds");


// INDEX route - shows all campgrounds
router.get("/", searchCampround);

// CREATE route - add new campground to DB
router.post("/", isLoggedIn, upload.single("image"), addCampground);

// NEW route - shows form to create new campground
router.get("/new", isLoggedIn, (req, res) => { 
    res.render("campgrounds/new");
});

// SHOW route - shows info about a specific campground
router.get("/:id", showCampground);

// EDIT route - editing a campground
router.get("/:id/edit", checkCampgroundOwnership, editCampground);

// UPDATE route - updating details an existing campground
router.put("/:id", checkCampgroundOwnership, upload.single('image'), updateCampground);

// DESTROY route - Removing campground 
router.delete("/:id", checkCampgroundOwnership, deleteCampground);

// to search for campgrounds
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;