require("dotenv").config();		// to allow env variables to persist via .env file

const	express 				= require("express"),
		app 					= express(),
		path					= require("path"),
		methodOverride 			= require("method-override"),
		mongoose 				= require("mongoose"),
		morgan					= require("morgan"),	// HTTP request logger middleware
		flash					= require("connect-flash"),
		passport				= require("passport"),
		LocalStrategy			= require("passport-local"),
		passportLocalMongoose	= require("passport-local-mongoose"),
		URL 					= process.env.DATABASE_URL || "mongodb://localhost:27017/yelp_camp",
		PORT 					= process.env.PORT || 3000

// requiring models
const	Campground 				= require("./models/campground"),
		Comment					= require("./models/comment"),
		notifications			= require("./models/notification"),
		User					= require("./models/user")
		
// requiring routes
const	commentRoutes			= require("./routes/comments"),
		campgroundRoutes		= require("./routes/campgrounds"),
		indexRoutes				= require("./routes/index"),
		restCampgroundRoutes	= require("./routes/restCampgrounds"),
		restIndex				= require("./routes/restIndex")

// APP CONFIG
mongoose.connect(URL, { 
	useUnifiedTopology: true, 
	useNewUrlParser: true, 
	useCreateIndex: true, 
})
	.then(() => console.log('Database is connected'))
	.catch(err => console.log(`Connection Error: ${err.message}`));	

app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, '/views'));	

// app.use() is applied to all requests
app.use(express.static(path.join(__dirname, 'public')));	// to serve files from public directory
app.use(express.urlencoded({ extended: true }));	// to parse req.body as url encoded data
//app.use(express.json());
app.use(methodOverride("_method"));	
app.use(morgan('tiny'));	// using predefined format string
app.use(flash());	// must be added before passport config

// creating local variable to apply to all files
app.locals.moment = require("moment");

//PASSPORT CONFIG
app.use(require("express-session")({	// creates session for every unique user across multiple http requests
	secret: process.env.SECRET,	//this secret will be used to encode/decode the sessions
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

app.use(async(req, res, next) => {
	res.locals.currentUser = req.user;		// req.user comes from passport and we need currentUser var for front end
	if (req.user) {
		try {
			// populating only notications that are not read yet
			let user = await User.findById(req.user._id).populate("notifications", null, { isRead: false }).exec();	
			res.locals.notifications = user.notifications.reverse();	// reverse to order by desc and see most recent first
		} catch(err) {
			console.log(err.message);
		}
	}
	// for the flash messages
	res.locals.error = req.flash("error");	
	res.locals.success = req.flash("success");	
	return next();	// to move to next middleware/ route handler
});

// mounting routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/api", restIndex)
app.use("/api/campgrounds", restCampgroundRoutes)

// if user vists any page outside of specified routes
app.use((req, res) => {
	res.status(404).send('Page not found.')
})

app.listen(PORT, () => {
    console.log(`App is live on port ${PORT}`);
});