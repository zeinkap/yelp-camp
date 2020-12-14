const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    username: String,
    campgroundId: String,
    isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);