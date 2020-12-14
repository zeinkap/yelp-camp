const User          = require("../models/user"),
    Campground      = require("../models/campground"),
    Notification    = require("../models/notification"),
    NodeGeocoder 	= require("node-geocoder"),
    multer			= require("multer"),
    cloudinary 		= require("cloudinary")

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
let upload = multer({ storage, fileFilter: imageFilter });

cloudinary.config({ 
	cloud_name: 'zeinkap', 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
});
    
module.exports = {
    // configuration for google maps
    options,
    geocoder,
    storage, 
    imageFilter,
    upload,
    cloudinary,

    async searchCampround(req, res, next) {
        try {
            let noMatch = null;
            if (req.query.search) {
                // Get all campgrounds from DB
                const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                let matchedCampground = await Campground.find({$or: [{name: regex}, {location: regex}]});
                if (matchedCampground.length < 1) {
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index", {campgrounds : matchedCampground, noMatch});
            } else {
                // if search has nothing in it, get all campgrounds from DB
                let allCampgrounds = await Campground.find({})
                res.render("campgrounds/index", {campgrounds : allCampgrounds, noMatch});
            }
        } catch (error) {
            req.flash("error", error.message);
            console.log(error);
        }
    },

    async addCampground(req, res, next) {
        try {
            let { name, price, description, lat, lng, location, image, imageId, author } = req.body.campground;
            
            // setting geocoder location
            let data = await geocoder.geocode(req.body.location);
            if (!data.length) {
                req.flash("error", "Please enter a valid location.")
                return res.redirect("back");
            } 
            
            lat = data[0].latitude;
            lng = data[0].longitude;
            location = data[0].formattedAddress;

            // setting cloudinary image
            let result = await cloudinary.v2.uploader.upload(req.file.path);
            image = result.secure_url;  // add cloudinary url for image to campground object under image property
            imageId = result.public_id; // add public_id of image to campground object

            // add author to campground
            author = {
                id: req.user._id,
                username: req.user.username,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
            }
            //console.log('This is the author! =>', author.id, author.username);
            // Create a new campground and save to DB
            const campground = new Campground({ name, price, description, lat, lng, location, image, imageId, author });
            await campground.save();

            // add followers
            const user = await User.findById(req.user._id).populate("followers");
            let newNotification = {
                username: req.user.username,
                campgroundId: campground._id
            }

            for (const follower of user.followers) {
                let notification = new Notification(newNotification);
                await follower.notifications.push(notification);	// pushing into all the follower's notifications
                await follower.save();
            }

            // redirect back to campgrounds page
            req.flash("success", "Campground has been added.");
            console.log(`Created the following campground: ${campground}`);
            return res.redirect(`/campgrounds/${campground._id}`);
        } catch (error) {
            req.flash("error", error.message);
            console.log(error);
            return res.redirect("back");
        }
    },

    async showCampground(req, res, next) {
        //find campground with provided ID from url and using mongoose function findbyid
	    //populating comments array (which was associated with campground) so it's not just an id
        try {
            const { id } = req.params;
            const campground = await Campground.findById(id).populate("comments");
            //console.log(campground);
            res.render("campgrounds/show", { campground });
        } catch (error) {
            req.flash('error', 'Sorry, that campground does not exist.');
            console.log(error);
            return res.redirect("/campgrounds");
        }
    },

    async editCampground(req, res, next) {
        try {
            const { id } = req.params;
            const campground = await Campground.findById(id);

            res.render("campgrounds/edit", { campground });
            if (!campground) {
                return res.status(400).send("Sorry, campground not found.");
            }
        } catch (error) {
            req.flash("error", "You do not have permission to do that.");
            console.log(error);
            res.redirect("/campgrounds");
        }   
    },

    async updateCampground(req, res, next) {
        try {
            let { name, price, description, lat, lng, location } = req.body.campground
            //console.log(name, price, description, lat, lng, location);

            let data = await geocoder.geocode(req.body.location);
            if (!data.length) {
                req.flash("error", "Please enter a valid location.");
                return res.redirect("back");
            }

            latitude = data[0].latitude;
            longitude = data[0].longitude;
            location = data[0].formattedAddress;

            const { id } = req.params;
            let campground = await Campground.findById(id);

            // update image on cloudinary
            if (req.file) {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
            }

            // update fields with user input
            campground.name = name;
            campground.price = price;
            campground.description = description;
            campground.lat = lat;
            campground.lng = lng;
            campground.location = location;

            // save updated campground to DB
            await campground.save();
            req.flash("success", `Updated details for ${campground.name}`);
            console.log(campground);
            return res.redirect(`/campgrounds/${id}`);
        } catch (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }
    },
    
    async deleteCampground(req, res, next) {
        try {
            const { id } = req.params;
            let campground = await Campground.findById(id);
            //console.log(campground);
            // remove image from cloudinary
            await cloudinary.v2.uploader.destroy(campground.imageId);
            // delete campground from DB
            await campground.deleteOne();

            req.flash("success", `Deleted ${campground.name}`);
            console.log(`Deleted the campground: ${campground}`);
            return res.redirect("/campgrounds");
        } catch (error) {
            req.flash("error", error.message);
            console.log(error);
            return res.redirect("back");
        }
    },

    // -------------------------For API routes--------------------------
    async apiGetAllCampgrounds(req, res, next) {
        try {
            const campgrounds = await Campground.find({});
            res.status(200).json(campgrounds);
        } catch (error) {
            res.status(404).send("Sorry, an error occured. Please try again.")
        }
    },

    async apiGetCampground(req, res, next) {
        try {
            const campground = await Campground.findById(req.params.id).populate("comments").exec();
            res.status(200).json(campground);
        } catch (error) {
            res.status(404).send("Sorry, no campground matching that ID was found. Please try again.")
        }
    },

    async apiAddCampground(req, res, next) {
        try {
            let description = req.body.campground.description;
            // setting geocoder location
            let data = await geocoder.geocode(req.body.location);
            let latitude = req.body.campground.lat;
            let longitude = req.body.campground.lng;
            let location = req.body.campground.location;
            if (!data.length) {
                res.sendStatus(404) // Not found
            }  
            latitude = data[0].latitude;
            longitude = data[0].longitude;
            location = data[0].formattedAddress;
            
            // setting cloudinary image
            let result = await cloudinary.v2.uploader.upload(req.file.path);
            let image = req.body.campground.image;
            let imageId = req.body.campground.imageId;
            let author = req.body.campground.author
            
            image = result.secure_url;  // add cloudinary url for image to campground object under image property
            imageId = result.public_id; // add public_id of image to campground object
            // add author to campground
            author = {
                id: req.user._id,
                username: req.user.username
            }
    
            // Create a new campground and save to DB
            const campground = new Campground(req.body.campground);
            await campground.save();
            const user = await User.findById(req.user._id).populate("followers").exec();
            let newNotification = {
                username: req.user.username,
                campgroundId: campground._id
            }
            for (const follower of user.followers) {
                let notification = new Notification(newNotification);
                await follower.notifications.push(notification);	// pushing into all the follower's notifications
                await follower.save();
            }
            // send status code
            res.status(201).json(`Created campground => ${campground}`);
        } catch (error) {
            res.status(404).send(error)
        }
    },

    async apiUpdateCampground(req, res, next) {
        try {
            let latitude = req.body.campground.lat;
            let longitude = req.body.campground.lng;
            let location = req.body.campground.location;

            let data = await geocoder.geocode(req.body.location);
            if (!data.length) {
                res.status(400).send("Please enter a valid location.")
            }
            latitude = data[0].latitude;
            longitude = data[0].longitude;
            location = data[0].formattedAddress;
    
            let updatedCampground = await Campground.findById(req.params.id);
            if (req.file) {
                    await cloudinary.v2.uploader.destroy(updatedCampground.imageId);
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
                    updatedCampground.imageId = result.public_id;
                    updatedCampground.image = result.secure_url;
            }
            // update fields with user input
            updatedCampground.name = req.body.campground.name;
            updatedCampground.price = req.body.campground.price;
            updatedCampground.description = req.body.campground.description;
            updatedCampground.lat = req.body.campground.lat;
            updatedCampground.lng = req.body.campground.lng;
            updatedCampground.location = req.body.campground.location;

            // save updated campground info to DB
            await updatedCampground.save();
            res.status(201).json(`Updated => ${updatedCampground.name}`)
        } catch (error) {
            res.status(404).send(error);
        }
    },

    async apiDeleteCampground(req, res, next) {
        try {
            const campground = await Campground.findById(req.params.id);
            await cloudinary.v2.uploader.destroy(campground.imageId, options = { invalidate: true });
            await campground.findOneAndDelete();
            res.status(201).json(`Deleted => ${campground.name}`)
        } catch (error) {
            res.status(404).send(error);
        }
    }
}