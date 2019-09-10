const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);   // will add bunch of methods from our package to the user schema for us to use
module.exports = mongoose.model("User", userSchema);