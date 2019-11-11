// each time server starts it will wipe all previous data and add new campgrounds with comments in DB
const   mongoose = require("mongoose"),
        Campground = require("./models/campground"),
        Comment = require("./models/comment")
 
// add some campgrounds data in array
let data = [
    {
        name: "Crystal Springs",
        image: "https://www.playcrystalsprings.com/images/crystal_springs_homepagebanner_2019a.jpg",
        price: "19.99",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur."
    },
    {
        name: "South Mineral Campground",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/06/d6/5e/4b/south-mineral-campground.jpg",
        price: "29.99",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur."
    },
    {
        name: "Belmont Lake State Park",
        image: "https://cdn.newsday.com/polopoly_fs/1.9409204.1411691967!/httpImage/image.jpg_gen/derivatives/landscape_768/image.jpg",
        price: "39.99",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur."
    }
]

function seedDB() {
    // remove all campgrounds
    Campground.remove({}, (err) => {
        if (err) {
            console.log(err);
        }
        console.log("Removed all campgronuds!");
        // add few campgrounds
        // data.forEach((seed) => {
        //     Campground.create(seed, (err, campground) => {
        //         if (err) {
        //             console.log("Error occured when adding campground. See below");
        //             console.log(err);
        //         } else {
        //             console.log("Added a campground");
        //             //create a comment. This same comment will be added to all campgrounds.
        //             Comment.create({
        //                 text: "This is an automated comment.",
        //                 author: "Homer Simpsons"
        //             }, (err, comment) => {
        //                 if (err) {
        //                     console.log("Error occured when creating comment. See below");
        //                     console.log(err);
        //                 } else {
        //                     campground.comments.push(comment);
        //                     campground.save();
        //                     console.log("Added new comment");
        //                 }
        //             })
        //         }
        //     });
        //});
    });

}

module.exports = seedDB;