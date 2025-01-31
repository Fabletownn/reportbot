const mongoose = require("mongoose");

const configSchema = mongoose.Schema({
    // Basic
    guildID: String,
    reportsforum: String,
    partnerforum: String,
    partnerrole: String,
    techforum: String,
    transforum: String,
    suplang: Array
});

module.exports = mongoose.model("repconfig", configSchema);