// each time server starts it will wipe all previous data and create new campgrounds with comments to generated
// will be doing error-driven development
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment = require("./models/comment");

// add some campgrounds data in array
let data = [
    {
        name: "Cloud's nest",
        image: "http://www.camp-liza.com/wp-content/uploads/2017/10/20170708_093155_HDR-1.jpg",
        description: "This is like a dream sky nest!"
    },
    {
        name: "Compound Park",
        image: "https://cdn.pixabay.com/photo/2017/08/06/02/32/camp-2587926_960_720.jpg",
        description: "A massive 100+ campsite field waiting to be ravaged by you"
    },
    {
        name: "Belmon Lake State Park",
        image: "https://www.pinetreesociety.org/wp-content/uploads/2017/10/cabins-960x600.jpg",
        description: "Full sky test"
    }
]

function seedDB() {
    // remove all campgrounds
    Campground.remove({}, (err) => {
        if (err) {
            console.log(err);
        }
        console.log("removed all campgronuds!");
        // add few campgrounds
        data.forEach((seed) => {
            Campground.create(seed, (err, campground) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("added a campground");
                    //create a comment. This same comment will be added to all campgrounds.
                    Comment.create({
                        text: "This place looks great. Looking forward to swimming, rolling, hiking and camping in it",
                        author: "Homer"
                    }, (err, comment) => {
                        if (err) {
                            console.log(err);
                        } else {
                            campground.comments.push(comment);
                            campground.save();
                            console.log("Created new comment");
                        }
                    })
                }
            });
        });
    });

}

module.exports = seedDB;