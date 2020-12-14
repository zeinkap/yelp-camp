const mongoose = require("mongoose");
const Comment = require("./comment");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
	name: {
		type: String,
		required: [true, 'campground must have a name'],
		trim: true,
		maxlength: 100
	},
	price: {
		type: String,
		required: [true, 'campground must have a price']
	},
	image: {
		type: String
	},
	imageId: String,
	description: {
		type: String,
		required: [true, 'campground must have a description']
	},
	location: {
		type: String,
		required: [true, 'campground must have a location']
	},
	lat: Number,
	lng: Number,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: Schema.Types.ObjectId,
			ref: "User"
		},
		username: String 
	},
	comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

// using post middleware for deleting associated data
campgroundSchema.post('findOneAndDelete', async (campground) => {
	if(campground.comments.length) {
		const res = await Comment.deleteMany({ _id: { $in: campground.comments } })
		console.log(res);
	}
})

module.exports = mongoose.model("Campground", campgroundSchema);