const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true // Ensure each user has only one cart
    },
    cartData: [
        {
            eventName: String, // Event name or ID
            category: {
                type: String,
                required: true
            }
        }
    ]
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
