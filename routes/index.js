const   express     = require("express"),
        router      = express.Router();

const {
    isLoggedIn, 
    asyncErrorHandler
} = require("../middleware");

const { 
    getLanding, 
    getSignup, 
    postSignup, 
    getLogin, 
    postLogin, 
    logout, 
    getProfile, 
    seeOtherUserProfiles, 
    followUser, 
    getNotifications, 
    handleNotifications 
} = require('../controllers/index')
        
// root route
router.get("/", getLanding);

// show sign-up form
router.get("/sign-up", getSignup);

// handle signup logic
router.post("/sign-up", asyncErrorHandler(postSignup));

// show login form
router.get("/login", getLogin);

// handle login logic
// passport addded as middleware (runs before callback, between start and end of route) 
// Dont need to specify username/password (passport gets it from req.body and authenticates with whats in DB)
router.post("/login", postLogin);
// after authenticating, user is serialized and stores in session object provided by express-session.

// logout route
router.get("/logout", logout);

// Logged in user's profile
router.get("/profile/:id", asyncErrorHandler(getProfile)); 

// seeing user's profile
router.get("/users/:id", asyncErrorHandler(seeOtherUserProfiles));

// follow user
router.get("/follow/:id", isLoggedIn, asyncErrorHandler(followUser));

// view all notifications
router.get("/notifications", isLoggedIn, asyncErrorHandler(getNotifications));

// handle notifications
router.get("/notifications/:id", isLoggedIn, asyncErrorHandler(handleNotifications));

module.exports = router;