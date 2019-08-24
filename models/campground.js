const mongoose = require("mongoose");

//declare schema and model then export.
const campgroundSchema = new mongoose.Schema({
	name: String,
	image: {
		type: String,
		default: "https://www.visitflorida.com/content/visitflorida/en-us/places-to-stay/campgrounds-florida/_jcr_content/full_width/vf_image.img.1280.500.jpg"
	},
	description: {
		type: String,
		default: "This is a default description"
	},
	//need to associate comment with campground.
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Campground", campgroundSchema); //now the model is being sent out of the file