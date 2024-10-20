const mongoose = require("mongoose");

const configSchema = mongoose.Schema({
    // Basic
    guildID: String,
    reportsforum: String,
    techforum: String,
    transforum: String,
    suplang: Array,
    
    // Standard Reports - Platform
    vrtag: String,
    pctag: String,
    xboxtag: String,
    pstag: String,
    
    // Standard Reports - Action
    notedtag: String,
    knowntag: String,
    reptag: String,
    logtag: String,
    xtag: String,
    
    // Translation Reports - Action
    nftag: String,
    fixedtag: String,
    txtag: String
});

module.exports = mongoose.model("repconfig", configSchema);