const mongoose = require("mongoose");

const nontechEventSchema = mongoose.Schema({
    
    nontech_event_name  : String,
    nontech_event_description : String,
    nontech_event_image : String,
    nontech_event_video: String,
    nontech_event_coordinator : String,
    nontech_event_rules : String
});

module.exports = mongoose.model("nontechEvent", nontechEventSchema)