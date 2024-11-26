const User = require("../models/user-model")
const bcrypt = require("bcrypt")
const nodemailer = require('nodemailer');
const axios = require("axios"); 
const SECRET_KEY = process.env.CAPTCHA_KEY; 
const register = async (req,res)=>{
    try{
        const {username, email, password, mobile, college_name, department, enrollment, recaptcha } = req.body; 
        
        axios({
            url : `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${recaptcha}`, 
            method: "POST"
        }).then(async ({data}) => {

            let userExist = await User.findOne({email})
            
            if(!userExist){
                
                const saltRound = 10; 
                const hash_password = await bcrypt.hash(password, saltRound);   
            
            const userAdd = await User.create({username, email, password : hash_password , mobile, college_name, department, enrollment})

            if(userAdd){
                return res.status(201).json({msg: "Registration Successfull", token: userAdd.generateToken(), userId: userAdd._id.toString()})
            }else{
                return res.status(500).json({msg: "database error"})
            }
        }else{
            return res.status(400).json({message : "Email already exists"});      // The code is written in the user-model
        }   
        
    }).catch(error => {
        res.status(400).send({msg : "Invalid captcha"})
    })
        
    }catch(error){
        res.status(500).json("Internal servor error" + error)
    }

};

const login = (req,res)=>{
    try{
        const {email, password, recaptcha} = req.body; 
        
        axios({
            url : `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${recaptcha}`, 
            method: "POST"
        }).then(async ({data}) => {

            if(data.success){
                
                let userExist = await User.findOne({email})
        
                if(!userExist){
                    return res.status(400).json({msg : "Invalid Credentials"});      
                }else{
        
                    const user = await userExist.comparePassword(password); 
        
                    if(user){
                        return res.status(200).json({msg: "Login successful", token: userExist.generateToken(), userId: userExist._id.toString()})
                    }else{
                        return res.status(401).json({msg: "Invalid credentials"})
                    }
                }       
            }else{
                return res.status(401).json({msg: "Invalid credentials"})
            }
        }).catch(error => {
            res.status(400).send({msg : "Invalid captcha"})
        })

    }catch(error){
        res.status(500).json("Internal servor error")
    }

};


const user = async (req, res) =>{
    try{
       const userData = req.user; 
       res.status(200).json({msg : userData})
    }catch(err){
       res.status(500).json({msg : err})
    }
}

const sendOtpEmail = async (req, res) => {
    const { email, recaptcha } = req.body;

    // Check if session exists before doing anything with it
    console.log("Session Before:", req.session);

    // ReCAPTCHA verification
    try {
        const { data } = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${recaptcha}`);
        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({ msg: "Invalid Email" }); 
        } else {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: "kushpatel24811@gmail.com",
                    pass: process.env.APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: {
                    name: 'eminancee',
                    address: process.env.GMAIL_USER,
                },
                to: email,
                subject: "Here is your OTP",
                text: otp,
            };

            try {
                await transporter.sendMail(mailOptions);

                // Ensure session is initialized and OTP is set
                if (!req.session) {
                    return res.status(500).send({ msg: "Session not initialized" });
                }

                // Set OTP and email in session
                req.session.otp = otp;
                req.session.email = email;
                console.log("Session After Setting OTP:", req.session);

                res.status(200).send({ msg: 'OTP sent, OTP has been sent to your email' + req.session.otp });
            } catch (error) {
                res.status(500).send({ msg: "There is some error in the server, please try again later" });
            }
        }
    } catch (error) {
        res.status(400).send({ msg: "Invalid captcha" });
    }
};


const otpVerification = async (req, res) => {
    try {
        
        req.session.otp = "123456";

        // if (!otpSession) {
        //     return res.status(401).send({ msg: "OTP expired." + otpSession });  
        // }

        // if (otp !== otpSession) {
        //     return res.status(400).send({ msg: "Enter the correct OTP" });  
        // }
  
        return res.status(200).send({ msg: "OTP verification successful" });

    } catch (error) {
        return res.status(500).send({ msg: "An error occurred while verifying OTP. Please try again later." });
    }
};

const newPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const email = req.session.email;
        const otp = req.session.otp;

        if (!otp) {
            return res.status(401).send({ msg: "Unauthorized Access" + otp });
        }else{
            return res.status(200).send({ msg: "Unauthorized Access" + otp });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        req.session.otp = null;
        req.session.email = null;

        res.status(200).send({ msg: "Password updated successfully" });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong, please try again later" });
    }
};
module.exports = {register, login, user, sendOtpEmail, otpVerification, newPassword}