const	express 				= require("express"),
		app 					= express(),
		port					= 3000,
		bodyParser 				= require("body-parser"),
		request 				= require("request"),
		methodOverride 			= require("method-override"),
		expressSanitizer		= require("express-sanitizer"),
		mongoose 				= require("mongoose"),
		Campground 				= require("./models/campground"),
		Comment					= require("./models/comment"),
		User					= require("./models/user"),
		seedDB					= require("./seeds"),
		passport				= require("passport"),
		localStrategy			= require("passport-local"),
		passportLocalMongoose	= require("passport-local-mongoose"),
		session 				= require("express-session")
		

// requiring routes
const	commentRoutes			= require("./routes/comments"),
		campgroundRoutes		= require("./routes/campgrounds"),
		indexRoutes				= require("./routes/index")

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));	// tells express to look in public directory for custom stylesheets. dirname refers to root YelpCamp folder 
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));	//argument is what to look for in url
app.use(expressSanitizer());	// this must go after bodyParser
app.set("view engine", "ejs"); 
app.use(session({
	secret: "zein is da best",	//this secret will be used to encode/decode the sessions
	resave: false,
	saveUninitialized: false
}));
// To use passport, you must have these two:
app.use(passport.initialize());
app.use(passport.session());

// used to read the session, take data from session that is encoded. We are defining this on the User
passport.serializeUser(User.serializeUser());	// encodes session and puts it back in
passport.deserializeUser(User.deserializeUser());	// decoding the session 

seedDB();	// will remove all campgrounds and add 3 default campgrounds with a comment in each

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


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);	//all routes in this file will have /campgrounds appended to it
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(port, () => {
	console.log("Listening on port 3000");
});
