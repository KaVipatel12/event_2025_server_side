const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken") 

const userSchema = mongoose.Schema({
    username: String,
    mobile: String,
    email: String,
    password: String,
    college_name: String,
    department: String,
    enrollment: String,
    coordinator: String,
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cart"
    }],

    controll: {
        type: Number,
        default: 0    // 0 -> user, 1 -> Admin, 2 -> Editor 
    },
    date: {
        type: Date,
        default: Date.now
    },
    purchaseProduct: [{
        product : String,
        category : String,
        purchaseDate: {
            type : Date,
            default: Date.now
        }
    }]
});


userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password); 
}

//Generating the jwt token
userSchema.methods.generateToken = function(){
 try{
  return jwt.sign({
    userId : this._id.toString(), 
    email : this.email,
    isAdmin: this.isAdmin 
  }, process.env.JWT_SECRET_KEY, {expiresIn: "30d"})
 }catch(error){
 }
}

const User = new mongoose.model("User", userSchema)
module.exports = User; 