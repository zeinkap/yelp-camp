const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    createdOn: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, default: false }
});

// extend model object
UserSchema.plugin(passportLocalMongoose);   // will add bunch of methods from our package to the user schema for us to use

module.exports = mongoose.model("User", UserSchema);