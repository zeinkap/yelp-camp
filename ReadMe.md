# YelpCamp
* Add Landing Page
* Add campgrounds page that lists all campgrounds

# Each campground will have (for now):
* Name
* Image
* description

# For layout and styling
* Create our header and footer partials
* Add in Bootstrap styling

# Creating new campgrounds
* Setup new campground POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form

# Style the campgrounds page
* Add better header/title
* Move campgrounds display in a grid

# Style the Navbar and form
* Add navbar to all templates
* Style new campground form

# Add Mongoose
* Install and configure mongoose
* Setup campground model
* Use campground model inside of our routes

# Show page
* Review the RESTful routes
* Add description to our campground model
* Show db.collection.drop()
* Add a show route/template

# Different types of Restful Routes:
- INDEX which is like /dogs and is GET request that displays a list of all dogs
- NEW which is /dogs/new GET request that displays form to make a new dog
- CREATE which is /dogs POST request that adds new dog to DB
- SHOW /dogs/:id GET request that shows info about one dog
- EDIT
- UPDATE
- DESTROY

# Final Updates
* Sanitize blog body. This helps us to prevent user from entering html code into our inputs. Done in CREATE and UPDATE routes.
* Style index
* Update REST Table

# Refactor mongoose code
* Create models directory and use module.exports
* Require everything correctly!

# Add Seeds file
* Add a seeds.js file 
* Run the seeds file every time app starts

# Add the Comment model!
* Fix errors
* Display comments on campground show page!

# Comment New/Create
* Use nested routes. This is because the comments are dependent on campground. Comment will be associated with a campground.
* Add comment new and create routes
* Add new comment form 

# Style Show Page
* Add sidebar to show page
* Beautify the display of comments
* Make the navbar buttons in header collapsible on small screens

# Refactor routes
* Use Express router to reoragnize all routes

# Authentication
* Install all packages needed for auth (passport, passport-local, passport-local-mongoose)
* Define User schema/model
* Configure Passport
* Add register routes and template
* Add login routes and template
* Add logout route
* Prevent user from adding comment if not signed in
* Show/hide auth navbar links correctly (not showing login option when logged in)

# Associate Users and Comments
* save author's name to a comment automatically

# Users and Campgrounds
* Prevent unauthenticated user from creating campground (protect the create and new routes in campgrounds)
* Save username and Id to newly created campground

# Having separate databases between development and production envrironments
* adding environment variables (are hidden to other devs)
* Create single databaseurl env variable with 2 differ values for local and heroku  

# Authorization
* User can only edit/delete his campgrounds
* Edit/delete options only available if he owns that campground

# Unit Testing with mocha and chai
* install mocha and chai as dev dependencies

# Editing Comments
* Add Edit route for comments
* Add Edit button
* Add Update route

# Deleting Comments
* Add Destroy route
* Add Delete buton

# Authorization Part 2
* User can only edit his/her comments
* User can only delete his/her comments 
* Hide/Show edit and delete buttons 
* Refactor middleware

# Adding flash messages
* Installing and configuring Flash

# Style new landing page
* Added animation

# Adding google maps api
* Sign up for a google dev account
* Get Google Maps API Key
    * Restrict Key
* Enable Geocoding API
* Get another key for Geocoding API
    * Add to application as ENV variable
* Add Google Maps scripts to application
* Display the campground location in show.ejs
* Update campground model
* Update new and edit forms
    * Add location input field
* Update campground routes

# Adding Moment to include time since created
* This will be applied for when a user adds/edits comments to campground
* Install moment js
* Require moment and add it to app.locals
* Update campground and comment models
* Use moment in show.ejs file

# Adding admin user role
* admin role successfully created only if user correctly enters admin code when signing up
* admin role can edit/delete all campgrounds
* admin role can edit/delete all commments

# Adding user profile
* user role signup page will also have first name, last name, email and avatar

# Add fuzzy search
* user can search for a campground by name and location

# Add image upload option using multer and cloudinary
* Sign up for cloudinary
* Install multer and cloudinary
* Configure multer and cloudinary
* 


# To Do
* Add profile page for signed in user. Add profile avatar
* for user reviews: Add star rating with date of when review posted. Add useful button with bulb icon and flag inappropriate button. Show avatar next to username.
Add upload photo option
* Allow user to upload campground image from local machine
    * User can upload multiple photos of campground



