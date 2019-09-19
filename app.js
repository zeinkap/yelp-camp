const	express 				= require("express"),
		app 					= express(),
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
		LocalStrategy			= require("passport-local"),
		passportLocalMongoose	= require("passport-local-mongoose")
		

// requiring routes
const	commentRoutes			= require("./routes/comments"),
		campgroundRoutes		= require("./routes/campgrounds"),
		indexRoutes				= require("./routes/index")

// APP CONFIG
mongoose.connect("mongodb+srv://zeinkap:Zkap9611@cluster0-f0jxn.mongodb.net/test?retryWrites=true&w=majority")
//mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true});
app.use(express.static(__dirname + "/public"));	// tells express to look in public directory for custom stylesheets. dirname refers to root YelpCamp folder 
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));	//argument is what to look for in url
app.use(expressSanitizer());	// this must go after bodyParser
app.set("view engine", "ejs"); 
//seedDB();	// remove all campgrounds and add 3 default campgrounds with a comment in each

//PASSPORT CONFIG
app.use(require("express-session")({	// creates session for every unique user across multiple http requests
	secret: "zein is da best",	//this secret will be used to encode/decode the sessions
	resave: false,
	saveUninitialized: false
}));
// middleware configured with express so web server can use passport. Order matters. Must have these:
app.use(passport.initialize());
app.use(passport.session());

// for passport to accept username and password for user authentication via checking mongo DB
passport.use(new LocalStrategy(User.authenticate()));	//authenticate() is a method that comes with package passportLocalMongoose (from user.ejs)
// used to read the session, take data from session that is encoded. We are defining this on the User
passport.serializeUser(User.serializeUser());	// encodes session and puts it back in
passport.deserializeUser(User.deserializeUser());	// decoding the session 

// passing user to every single template using res.locals
app.use((req, res, next) => {
	res.locals.currentUser = req.user;	
	next();	// to make this middleware move to next code
});

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


// Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

// app.listen(3000, () => {
// 	console.log("Listening on port 3000");
// });
