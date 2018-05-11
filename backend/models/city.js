const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let businessSchema = new Schema({
    id: { type: String },
    name: { type: String },
    image_url: { type: String },
    rating: { type: Number },
    price: { type: String },
    distance: { type: Number },
    users: { type: [String] }
});

let citySchema = new Schema({
    date: { type: Number },
    query: { type: String },
    businesses: { type: [businessSchema] }
});

module.exports = mongoose.model("City", citySchema);