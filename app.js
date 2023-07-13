if (process.env.NODE_ENV !== 'production') {
    //NODE_ENV is either set to development or production!
    require('dotenv').config();
}
//how we access env values
//if we use GIT, .env files are ignored



const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo');
/* const dbUrl = process.env.DB_URL; */
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret';

mongoose.connect(dbUrl)
/* mongoose.connect(dbUrl) */
    .then(() => {
        console.log("Database Connected!!");
    }).catch(err => {
        console.log("Error!");
        console.log(err);
    })

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
//include things like CSS stylesheets
app.use(express.static(path.join(__dirname, 'public')))
//used to prevent mongo injection in the site by blocking certain characters such as $ and .
app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: dbUrl,
    //time between resaves if data has not changed. in seconds!!
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
})

store.on("error", function(e) {
    console.log("Session store error!");
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        //security option, allows the cookie to be read by a browser
        httpOnly: true,
        //this will allow cookies to work ONLY over HTTPS!
        //secure: true,
        //works in milliseconds, not included by default
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

//arrays of allowed sources
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://cdn.jsdelivr.net",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvqvkaten/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//needed to run passport
app.use(passport.initialize());
//needed so we dont have to login on every api call
app.use(passport.session());
//use the local strategy and use the .authenticate method for authentication.
//one of the few methods added for us by passport
passport.use(new LocalStrategy(User.authenticate()));
//tell passport how to store a user in the session
passport.serializeUser(User.serializeUser());
//the opposite
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //access everywhere under the defined key
    //define user variable to obtain user info anywhere and help with session management
    //console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'testuser@gmail.com', username: 'testUser1', });
    const newUser = await User.register(user, 'password');
    res.send(newUser);
})


app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});

//will trigger on all request and should be near the end.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    //destructure the err and set status code and message defaults
    const { statusCode = 500, message = 'Somthing went wrong' } = err;
    if (!err.message) err.message = 'Oh No, something went wrong'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
});