require("dotenv").config();	//package that allows us to allow env variables to persist via .env file
const	express 				= require("express"),
		app 					= express(),
		bodyParser 				= require("body-parser"),
		request 				= require("request"),
		methodOverride 			= require("method-override"),
		expressSanitizer		= require("express-sanitizer"),
		mongoose 				= require("mongoose"),
		flash					= require("connect-flash"),
		seedDB					= require("./seeds"),
		passport				= require("passport"),
		LocalStrategy			= require("passport-local"),
		passportLocalMongoose	= require("passport-local-mongoose")

// requiring models
const	Campground 				= require("./models/campground"),
		Comment					= require("./models/comment"),
		User					= require("./models/user")
		
// requiring routes
const	commentRoutes			= require("./routes/comments"),
		campgroundRoutes		= require("./routes/campgrounds"),
		indexRoutes				= require("./routes/index")

// APP CONFIG
let url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp"	// backup that provides default DB
mongoose.connect(url, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false});		//connects to best environment, has 2 outcomes

// telling express to use these packages
app.use(express.static(__dirname + "/public"));	// tells express to look in public directory for custom stylesheets. dirname refers to root YelpCamp folder 
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));	//argument is what to look for in url
app.use(expressSanitizer());	// this must go after bodyParser
app.set("view engine", "ejs"); 
app.use(flash());	// must be added before passport config
//seedDB();	// removes all campgrounds and adds 3 default campgrounds with a comment in each

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
	// defining two differ vars for our flash messages
	res.locals.error = req.flash("error");	
	res.locals.success = req.flash("success");	
	next();	// to make this middleware move to next code
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);	//all routes in this file will have /campgrounds appended to it
app.use("/campgrounds/:id/comments", commentRoutes);

// Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
