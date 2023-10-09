const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressError = require('./utils/expressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// imported routes
const hotelsRoutes = require('./routes/hotels');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');
const hairsalonRoutes = require('./routes/hairsalon');


const session = require('express-session');
const flash = require('connect-flash');
const user = require('./Models/user');





mongoose.connect('mongodb://localhost:27017/placeFinder');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// setting the app to use static files 
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
// use the local strategy and use the authentication method for the users schema
passport.use(new LocalStrategy(user.authenticate()));

// how to store it an unstore it
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// middleware on response locals erors
app.use((req, res, next) => {
    // set the user to the current user
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// other module routers
app.use('/', usersRoutes);
app.use('/hotels', hotelsRoutes);
app.use('/hotels/:id/reviews', reviewsRoutes);
app.use('/hairsalone', hairsalonRoutes);
app.use('/hairsalone/:id/reviews', hairsalonRoutes);



// test route 
app.get('/', (req, res) => {
    res.render('home')
});



// error message middlewire
app.all('*', (req, res, next) => {
    next(new expressError('Page Not Found', 404))
})

// error mssge and status code middlewire
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



app.listen(3000, () => {
    console.log('Serving on port 3000')
});