require("dotenv").config();

const express = require("express");
const OAuth = require("oauth").OAuth;
const bodyParser = require("body-parser");
const session = require("express-session");
const axios = require("axios");
const queryString = require("querystring");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

const City = require("./models/city");

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

app.post("/api/:city/:business", function(req, res) {
    if(req.session && req.session.signed_in && req.session.user_id) {
        const cid = req.params.city.toLowerCase();
        const bid = req.params.business;
        const uid = req.session.user_id;
        City.findOne({query: cid}, function(err, city) {
            if(err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                const bizindex = city.businesses.findIndex((biz) => { return biz.id == bid; });
                if(bizindex >= 0) {
                    city.businesses.forEach((biz, i, a) => {
                        let uindex = biz.users.findIndex((user) => {
                            return user == uid;
                        });
                        if(uindex >= 0) {
                            a[i].users.splice(uindex, 1);
                        }
                    });
                    city.businesses[bizindex].users.push(uid);
                    city.save();
                    console.log(city);
                    res.json(city);
                } else {
                    res.sendStatus(400);
                }
            }
        });
    } else {
        console.log(req.session);
        res.sendStatus(300);
    }
});

app.get("/api/search/:city", function(req, res) {
    let q = req.params.city.toLowerCase();
    City.remove({ date: { $lt: (Date.now() - 86400000) }});
    City.findOne({ query: q }, function(err, city) {
        if(err) {
            console.log(err);
            res.sendStatus(500);
        } else if(city) {
            res.json(city);
        } else {
            yelpApi.get("/businesses/search?" + queryString.stringify({
                location: q,
                radius: 5000,
                categories: "bars",
                limit: 20
            })).then(response => {
                if(response.status == 200) {
                    let c = new City({
                        date: Date.now(),
                        query: q,
                        businesses: response.data.businesses.map(b => { return {
                            id: b.id,
                            name: b.name,
                            image_url: b.image_url,
                            rating: b.rating,
                            price: b.price,
                            distance: b.distance,
                            users: []
                        }})
                    });
                    c.save(function(err) {
                        if(err) {
                            console.log(err);
                            res.sendStatus(500);
                        } else {
                            res.json(c);
                        }
                    });
                } else {
                    throw response;
                }
            }).catch(error => { 
                console.log("--------------------------------------- Yelp error -----------------------------------------");
                console.log(error);
                console.log(error.data);
                console.log("----------------------------------------end of error----------------------------------------");
                res.sendStatus(500);
            });
        }
    });
});

app.get("/api/login", function(req, res) {
    if(req.session && req.session.signed_in) {
        res.send({ user_id: req.session.user_id, 
                   screen_name: req.session.screen_name });
    } else {
        res.sendStatus(404);
    }
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
                    req.session.signed_in = true;
                    req.session.user_id = results.user_id;
                    req.session.screen_name = results.screen_name;
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