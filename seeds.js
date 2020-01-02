// each time server starts it will wipe all previous data and add new campgrounds with comments in DB
const   mongoose = require("mongoose"),
        Campground = require("./models/campground"),
        Comment = require("./models/comment")

let seeds = [
    {
        name: "Crystal Springs",
        image: "https://www.playcrystalsprings.com/images/crystal_springs_homepagebanner_2019a.jpg",
        price: "19.99",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur.",
        location: "Geneva, Switzerland"
    },
    {
        name: "South Mineral Campground",
        image: "https://media-cdn.tripadvisor.com/media/photo-s/06/d6/5e/4b/south-mineral-campground.jpg",
        price: "29.99",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur.",
        location: "Brussels, Belgium"
    },
    {
        name: "Belmont Lake State Park",
        image: "https://cdn.newsday.com/polopoly_fs/1.9409204.1411691967!/httpImage/image.jpg_gen/derivatives/landscape_768/image.jpg",
        price: "39.99",
        description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu. Phaedrum vituperatoribus eu quo, id modus perfecto his, pro vide dignissim et. Everti liberavisse ad duo, mei facer graeco intellegam an. Vel ad tation vivendo scribentur.",
        location: "Stockholm, Sweden"
    }
];

async function seedDB() {
    try {
        await Campground.remove({});
        console.log('Campgrounds removed');
        await Comment.remove({});
        console.log('Comments removed');
        for(const seed of seeds) {
            let campground = await Campground.create(seed);
            console.log('Campground created');
            let comment = await Comment.create({
                text: "This is an automated comment.",
                author: "Homer Simpsons"
            });
            console.log('Comment created');
            campground.comments.push(comment);
            campground.save();
            console.log('Comment added to campground');
        }
    } catch (err) {
        console.log(err);
    }  
}

module.exports = seedDB;