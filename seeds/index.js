// this file will run separately on its own, separate from node app
// each time server starts it will wipe all previous data and add new campgrounds with comments in DB
const   Campground      = require("../models/campground"),
        Comment         = require("../models/comment"),
        mongoose        = require("mongoose"),
        cities          = require("./cities")

const { places, descriptors, images } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp_camp', { 
	useUnifiedTopology: true, 
	useNewUrlParser: true, 
	useCreateIndex: true, 
})
	.then(() => console.log('Database connected'))
	.catch(err => console.log(`Connection Error: ${err.message}`));	

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    try {
        await Campground.deleteMany({});
        await Comment.deleteMany({});
        for (let i = 0; i < 50; i++) {
            const random1000 = Math.floor(Math.random() * 1000);
            const randomPrice = (Math.random() * 100) + 1;
            const sRandomPrice = randomPrice.toFixed(2); // converts num to string and rounds to 2 decimal places
            const campground = new Campground({
                location: `${cities[random1000].city}, ${cities[random1000].state}`,
                lat: `${cities[random1000].latitude}`,
                lng: `${cities[random1000].longitude}`,
                name: `${sample(descriptors)} ${sample(places)}`,
                price: sRandomPrice,
                image: sample(images),
                author: {
                    id: "5fd5700a50b8663a2862cda2",
                    username: "zeinkap"
                },
                description: "Lorem ipsum dolor sit amet, nec tritani meliore ad, ut qui dicat tation veniam. Pro et eius necessitatibus, meis paulo vivendum ad his, te inani tractatos liberavisse has. Usu graeco iuvaret disputationi an. Eu duo assum intellegebat disputationi, pri et erat commodo nostrud, erroribus voluptaria appellantur vim eu."

            })
            const comment = new Comment({
                text: "This is an automated comment.",
                author: {
                    id: "5fd5700a50b8663a2862cda2",
                    username: "zeinkap"
                }
            })
            comment.save();
            await campground.comments.push(comment);
            await campground.save();
        } 
        console.log("All campgrounds and comments removed. New campgrounds added!");
    } catch (err) {
        console.log(err);
    }  
}

seedDB().then(() => {
    mongoose.connection.close();
})