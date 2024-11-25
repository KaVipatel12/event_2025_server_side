const mongoose = require("mongoose");

const techEventSchema = mongoose.Schema({
    
    tech_event_name  : String,
    tech_event_description : String,
    tech_event_image : String,
    tech_event_video: String,
    tech_event_coordinator : String,
    tech_event_rules : String
});

module.exports = mongoose.model("techEvent", techEventSchema)