const User = require('../models/user-model');
const techEventModel = require('../models/techEvent-model')
const nonTechEventModel = require('../models/nontechEvent-model')
const cartModel = require('../models/cart-model');
const path = require("path")
const PDFDocument = require('pdfkit');
const fs = require('fs');

const techEventMainPage = async (req, res) => {
    try {

        let techEvents = await techEventModel.find({} , "tech_event_name");

        if (!techEvents || techEvents.length === 0) {
            return res.status(404).send({ msg: "No tech events found" });
        }

        const eventsWithImagePath = techEvents.map(event => {
            return {
                ...event.toObject(),
                tech_event_image: `/uploads/${event.tech_event_image}`  // Assuming the image is stored in 'public/images/events'
            };
        });

        res.status(200).send({ msg: 'Tech events fetched successfully', events: eventsWithImagePath });

    } catch (err) {
        res.status(500).send({ msg: err.message || "Server Error" });
    }
};
const nonTechEventMainPage = async (req, res) => {
    try {

        let nonTechEvents = await nonTechEventModel.find({});

        if (!nonTechEvents || nonTechEvents.length === 0) {
            return res.status(404).send({ msg: "No tech events found" });
        }

        const eventsWithImagePath = nonTechEvents.map(event => {
            return {
                ...event.toObject(),
                tech_event_image: `/uploads/${event.nontech_event_image}`  // Assuming the image is stored in 'public/images/events'
            };
        });

        res.status(200).send({ msg: 'Non Tech events fetched successfully', events: eventsWithImagePath });

    } catch (err) {
        res.status(500).send({ msg: err.message || "Server Error" });
    }
};


const techEventPage = async (req, res) => {

    const eventName = req.params.technicalevent;
    try {

            const event = await techEventModel.findOne({ tech_event_name: eventName });
            res.status(200).send({msg : event})
        
    }catch(err){
        res.status(500).send({msg : "Internal servor error"})
    }
}
const nonTechEventPage = async (req, res) => {

    const eventName = req.params.nontechnicalevent;
    try {
            const event = await nonTechEventModel.findOne({ nontech_event_name: eventName });
            res.status(200).send({msg : event})
        }catch(err){
        res.status(500).send({msg : "Internal servor error"})
    }
}


const cart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send({ msg: "Unauthorized Connection" });
        }

        const userId = req.user._id;
        let user = await User.findById(userId);

        if (!user) {
            return res.status(401).send({ msg: "Unauthorized Connection" });
        }

        let cart = await cartModel.findOne({ user: userId }).populate('user');
        
        if (!cart || cart.cartData.length === 0) {
            return res.status(200).send({ isCart: false, msg: "Cart is empty" });
        }

        // Map cartData to include both event names and categories
        const formattedCart = cart.cartData.map(item => ({
            eventName: item.eventName,
            category: item.category
        }));
        
        return res.status(200).send({ msg: formattedCart });
    } catch (error) {
        res.status(500).send({ msg: "Internal server error" });
    }
};
const addCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send({ msg: "Unauthorized Connection" });
        }

        const userId = req.user._id;
        const { eventName, category } = req.body;

        // Validate required fields
        if (!eventName || !category) {
            return res.status(400).send({ msg: "Both eventName and category are required." });
        }

        let cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            // Create a new cart if one doesn't exist
            cart = new cartModel({
                user: userId,
                cartData: [{ eventName, category }]
            });
        } else {
            // Check if the item already exists in the cart
            const itemExists = cart.cartData.some(
                (item) => item.eventName === eventName && item.category === category
            );

            if (itemExists) {
                return res.status(400).send({ msg: "Item already exists in cart." });
            }

            // Add the new item to the existing cart if it's not a duplicate
            cart.cartData.push({ eventName, category });
        }

        await cart.save();

        return res.status(200).send({ msg: "Item added to cart" });
    } catch (error) {
        res.status(500).send({ msg: "Internal server error" });
    }
};
const deleteCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const eventName = req.params.eventName; 
    
        let findCart = await cartModel.findOne({ user: userId });
    
        if (!userId || !findCart) {
            return res.status(401).send({ msg: "Something went wrong. Please try again later." });
        }
    
        if (Array.isArray(findCart.cartData)) {
            findCart.cartData = findCart.cartData.filter(item => item.eventName !== eventName);
    
            findCart.markModified("cartData");
    
            await findCart.save();
    
            return res.status(200).send({ msg: "Event removed from cart successfully" });
        } else {
            return res.status(400).send({ msg: "Cart data is not in the expected format" });
        }
    } catch (error) {
        return res.status(500).send({ msg: "Something went wrong. Please try again later." });
    }
};
 
// Making the payment mode


const purchaseEvent = async (req, res) => {
    const userId = req.user._id;
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).send({ msg: "Please select at least one event" });
    }

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ msg: "User not found" });
        }

        let hasDuplicate = false;
        events.forEach(({ eventName, category }) => {
            const eventExists = user.purchaseProduct.some(purchase =>
                purchase.product === eventName && purchase.category === category
            );

            if (!eventExists) {
                user.purchaseProduct.push({ product: eventName, category: category });
            } else {
                hasDuplicate = true;
            }
        });

        await user.save();
        await cartModel.findOneAndDelete({ user: userId });

        // PDF Generation using pdfkit
        const doc = new PDFDocument();
        const pdfPath = `./purchased_event_${userId}.pdf`;  // Temporary file storage

        doc.pipe(fs.createWriteStream(pdfPath));  // Write PDF to file system

        // PDF Content
        doc.fontSize(20).text('Event Purchase Confirmation', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`User: ${user.username}`, { align: 'left' });
        doc.text(`Email: ${user.email}`);
        doc.moveDown();

        doc.fontSize(16).text('Purchased Events:', { underline: true });
        events.forEach((event, index) => {
            doc.moveDown(0.5);
            doc.fontSize(14).text(`${index + 1}. ${event.eventName.split("_").join(" ")} (${event.category})`);
        });

        doc.end();  // Finalize the PDF document

        // Send PDF as response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="purchased_events.pdf"`);
        
        const stream = fs.createReadStream(pdfPath);
        stream.pipe(res);  // Stream the PDF to the client

        stream.on('close', () => {
            // Delete the temporary PDF file after sending
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        res.status(500).send({ msg: "Error processing the request", error: error.message });
    }
};


module.exports = { techEventMainPage, nonTechEventMainPage, techEventPage, nonTechEventPage, cart, addCart, deleteCart, purchaseEvent}