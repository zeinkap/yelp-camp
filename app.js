const	express 			= require("express"),
		app 				= express(),
		bodyParser 			= require("body-parser"),
		request 			= require("request");
		methodOverride 		= require("method-override"),
		expressSanitizer	= require("express-sanitizer"),
		mongoose 			= require("mongoose");
		Campground 			= require("./models/campground");
		seedDB				= require("./seeds");

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});	// to get rid of warning errors
app.use(express.static("public"));	// to tell express to also look in public directory for custom css/js files 
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));	//argument is what to look for in url
app.use(expressSanitizer());	// this must go after bodyParser
app.set("view engine", "ejs"); 

seedDB();

//adds campground to DB
// Campground.create(
// 	{
// 		name: "Granite Hill",
// 		image: "https://assets.simpleviewinc.com/simpleview/image/fetch/q_60/https://assets.simpleviewinc.com/simpleview/image/upload/crm/poconos/Waterfalls-Bushkill-Falls-3-PoconoMtns0_6c255fcc-a099-e9fa-f98f91bcfd3d7649.jpg",
// 		description: "This place is huge, but no bathrooms. The scenery is pretty nice and relaxing."
// 	}, (err, campground) => {
// 	if(err) {
// 		console.log("There is an error!");
// 		console.log(err);
// 	} else {
// 		console.log("Newly created campground: ");
// 		console.log(campground);
// 	}
// });

app.get("/", (req, res) => {
    res.redirect("/campgrounds");
});

// 1. INDEX route - shows all campgrounds
app.get("/campgrounds", (req, res) => {
	//rather than getting from array we will retrieve camps from DB
	Campground.find({}, (err, campgrounds) => {	//campgrounds here is placeholder for the data coming back from DB from out .find
	if(err) {
		console.log(err);
	} else {
		res.render("index", {campgrounds : campgrounds});	//rendering index file along with the data sent under the first name campgrounds
	}
	});
});

// 2. NEW route - shows form to create new campground
app.get("/campgrounds/new", (req, res) => { //this route is where form will be shown
    res.render("new");
});

// 3. CREATE route - add new campground to DB
app.post("/campgrounds", (req, res) => {     //not same as GET, we are following REST convention format
	//sanitizer here
	req.body.campground.description = req.sanitize(req.body.campground.description);	//taking what its equal to and sanitizing it
	// Create campground and save to DB
	Campground.create(req.body.campground, (err, newCampground) => {	//the req.body.campground object (from the form) contains all the input values
		if(err) {
			console.log(err);
		} else {
			res.redirect("/campgrounds");   //event though there are 2 of these routes, it will redirect to GET by default
		}			  
	});
});

// 4. SHOW route - shows info about a specific campground. ***This should always come after NEW route or else it will overide it. id comes from mongo DB
app.get("/campgrounds/:id", (req, res) => {	
	//find campground with provided ID from url and using mongoose function findbyid
	//populating comments array (which was associated with campground) so it's not just an id
	Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {	//foundCampground serves as placeholder for our data that we get back from DB
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			//render show template with that campground
			res.render("show", {campground: foundCampground});	//campground is just name we give, more importantly the value of id we found will be displayed
		}
	});
});

// 5. EDIT route - editing a campground
app.get("/campgrounds/:id/edit", (req, res) => {
	//need to find that campground data from id so it prefills form
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.render("edit", {campground: foundCampground});
		}
	});
});

// 6. UPDATE route - updating details of an existing campground
app.put("/campgrounds/:id", (req, res) => {
	req.body.campground.description = req.sanitize(req.body.campground.description);
	//following method takes 3 arguments (id, newData, callback) // the newData is our input name from form
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updateCampground) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// 7. DESTROY route - Removing campground 
app.delete("/campgrounds/:id", (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
});

app.get("*", (req, res) => {
	res.send("Error! Page not found");
});

app.listen(3000, () => {
	console.log("Listening to port 3000");
});
