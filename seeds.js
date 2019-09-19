// each time server starts it will wipe all previous data and create new campgrounds with comments to generated
// will be doing error-driven development
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
 
// add some campgrounds data in array
let data = [
    {
        name: "Cloud's Acorn Nest",
        image: "http://www.camp-liza.com/wp-content/uploads/2017/10/20170708_093155_HDR-1.jpg",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur."
    },
    {
        name: "Dairy Milk Site",
        image: "https://cdn.pixabay.com/photo/2017/08/06/02/32/camp-2587926_960_720.jpg",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur."
    },
    {
        name: "Belmont Lake State Park",
        image: "https://www.pinetreesociety.org/wp-content/uploads/2017/10/cabins-960x600.jpg",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur."
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