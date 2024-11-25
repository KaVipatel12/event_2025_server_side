const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../Middleware/authMiddleware");
const adminController = require("../Controller/adminController");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set 'uploads/' folder to store files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

router.get('/participantlist', adminAuthMiddleware, adminController.participantList);
router.post("/addtecheventpanel", adminAuthMiddleware, upload.single('tech_event_image'), adminController.addtechevent);
router.post("/addnontecheventpanel", adminAuthMiddleware, upload.single('nontech_event_image'), adminController.addnontechevent);
router.delete("/deleteevent", adminAuthMiddleware, adminController.deleteEvent);
router.put("/updateevent", adminAuthMiddleware, adminController.updateEventInfo);

module.exports = router;
