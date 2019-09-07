# YelpCamp
* Add Landing Page
* Add campgrounds page that lists all campgrounds
* In future database will be added

# Each campground will have:
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
* Run the seeds file every time starts

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

# To Do
* Make the navbar buttons in header collapsible on small screens

# Refactor routes
* Use Express router to reoragnize all routes
