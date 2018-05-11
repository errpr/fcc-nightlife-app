require("dotenv").config();

const express = require("express");
const OAuth = require("oauth").OAuth;
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");
const queryString = require("querystring");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

const dbUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DB}`;
mongoose.connect(dbUrl).catch(error => console.log(error));

const yelpApi = axios.create({
    baseURL: "https://api.yelp.com/v3/",
    headers: {
        "Authorization": "Bearer " + process.env.YELP_API_KEY
    }
});

let oa = new OAuth("https://twitter.com/oauth/request_token",
                    "https://twitter.com/oauth/access_token",
                    process.env.TWITTER_KEY, process.env.TWITTER_SECRET,
                    "1.0A", 
                    "http://localhost:3000/auth/twitter/callback", 
                    "HMAC-SHA1");

let app = express();
app.use(express.static("assets"));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.get("/api/search/:city", function(req, res) {
    yelpApi.get("/businesses/search?" + queryString.stringify({
        location: req.params.city,
        radius: 5000,
        categories: "bars",
        limit: 20
    })).then(response => {
        if(response.status == 200) {
            res.json(response.data);
        } else {
            throw response;
        }
    }).catch(error => { 
        console.log("----------------------------------------error----------------------------------------")
        console.log(error);
        console.log(error.data);
        console.log("----------------------------------------end of error----------------------------------------")
    });
});

app.get("/auth/twitter", function(req, res) {
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
        if(error) {
            console.log(error.data); 
            res.sendStatus(500);
        } else {
            req.session.oauth = {
                token: oauth_token,
                token_secret: oauth_token_secret 
            }
            console.log("Redirection to twitter");
            console.log(req.session);
            res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + oauth_token);
        }
    });
});

app.get("/auth/twitter/callback", function(req, res) {
    if(req.session.oauth.token == req.query.oauth_token) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        oa.getOAuthAccessToken(
            req.session.oauth.token,
            req.session.oauth.token_secret,
            req.session.oauth.verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results) {
                if(error) {
                    console.log(error);
                    res.sendStatus(500);
                } else  {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth.access_token_secret = oauth_access_token_secret;
                    console.log("Callback from twitter");
                    console.log(req.session);
                    res.redirect("/");
                }
            }
        );
    } else {
        res.sendStatus(300);
    }
});

const listener = app.listen(process.env.PORT, function() {
    console.log("Your app is listening on port " + listener.address().port);
});