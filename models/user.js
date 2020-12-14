const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    username: {
		type: String,
		required: [true, 'username is required'],
		maxlength: 100
	},
    password: {
		type: String,
		required: [true, 'password is required'],
		minlength: 6
    },
    password2: {
		type: String,
		required: [true, 'password2 is required'],
		minlength: 6
	},
    isPaid: { type: Boolean, default: false },
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    avatar: {
		type: String,
		maxlength: 50
	},
    firstName: {
		type: String,
		required: [true, 'first name is required'],
		maxlength: 100
	},
    lastName: {
		type: String,
		required: [true, 'last name is required'],
		maxlength: 100
	},
    email: {
		type: String,
        required: [true, 'email is required'],
        trim: true,
		unique: true
	},
    createdOn: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false }
});

// extend model object
UserSchema.plugin(passportLocalMongoose);   // will add bunch of methods from our package to the user schema for us to use

module.exports = mongoose.model("User", UserSchema);