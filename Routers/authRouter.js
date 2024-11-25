const express = require("express"); 
const router = express.Router(); 
const authController = require("../Controller/authController")
const signupSchema = require("../Validator/authValidator")
const {validate} = require("../Middleware/validateMiddleware")
const authMiddleware = require("../Middleware/authMiddleware"); 

router.route("/register").post(validate(signupSchema), authController.register)
router.route("/login").post(authController.login)
router.route("/user").get(authMiddleware, authController.user)
router.post('/emailverification', authController.sendOtpEmail);
router.post('/otpverification', authController.otpVerification); 
router.post('/updatepassword', authController.newPassword); 

module.exports = router; 