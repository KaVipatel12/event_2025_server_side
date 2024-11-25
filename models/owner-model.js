const mongoose = require("mongoose");

const ownerSchema = mongoose.Schema({

    username  : String,
    mobile : String,
    email : String,
    password : String,
    college_name : String,
    department : String,
    enrollment : String,
    coordinator : String,
});

module.exports = mongoose.model("owner", ownerSchema)