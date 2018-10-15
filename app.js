const express             = require("express"),
    helmet                = require("helmet");
    dotenv                = require("dotenv"),
    app                   = express(),
    sessions              = require("client-sessions"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user");

dotenv.load();
dotenv.config({encoding: "base64"});
app.use(helmet());
mongoose.connect("mongodb://localhost/auth_demo_app", {useNewUrlParser: true});
app.use(sessions({
    cookieName: "session",
    secret: process.env.secret,
    duration: 30*60*1000,
    cookie:{
        ephemeral: true,
        httpOnly: true,
        secure: false
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");

function isLogginIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//======
//ROUTES
//======

app.get("/", function(req, res){
    res.render("home");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secret");
        });
    });
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/secret", isLogginIn, function(req, res){
    res.render("secret");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.listen(3000, function(){
    console.log("Server started");
});