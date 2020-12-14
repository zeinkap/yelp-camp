const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
		type: String,
		maxlength: 300
	},
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);

