const   express     = require("express"),
        router      = express.Router()
        
const {
    apiIsLoggedIn, 
} = require("../middleware");

const { 
    apiPostLogin,
    apiLogout,
    apiPostSignup,
    apiGetProfile
} = require("../controllers/index")
        
// root route
router.get("/", (req, res, next) => {
    res.status(200).send('Welcome to YelpCamp!')
});

router.post("/login", apiPostLogin);

router.get("/logout", apiLogout);

router.post("/sign-up", apiPostSignup);

router.get("/profile/:id", apiGetProfile);

module.exports = router;