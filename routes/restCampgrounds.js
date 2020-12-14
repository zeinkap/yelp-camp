const	express 	= require("express"),
        router 		= express.Router()

const { 
    apiCheckCampgroundOwnership,
    apiIsLoggedIn
} = require("../middleware");

const {
	options,
    geocoder,
    storage, 
    imageFilter,
	upload,
	cloudinary,
	apiGetAllCampgrounds,
	apiAddCampground,
	apiGetCampground,
	apiUpdateCampground,
	apiDeleteCampground
} = require("../controllers/campgrounds");

// get all campgrounds
router.get("/", apiGetAllCampgrounds);
// get a campground
router.get("/:id", apiGetCampground)
// add new campground
router.post("/new",  apiAddCampground)
// update campground
router.put("/:id/update", apiCheckCampgroundOwnership, apiUpdateCampground)
// delete campground
router.put("/:id/delete", apiCheckCampgroundOwnership, apiDeleteCampground)

// router.get("*", (req, res, next) => {
// 	res.send("Sorry, an error occured. Please try again.")
// })
module.exports = router;