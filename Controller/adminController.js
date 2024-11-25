const User = require("../models/user-model");
const cart = require("../models/cart-model");
const techEvent = require("../models/techEvent-model")
const nonTechEvent = require("../models/nontechEvent-model")


const participantList = async (req, res) => {
    try {
        const users = await User.find({});

        let participantsWithEvents = [];
        for (let user of users) {
            if (user.purchaseProduct.length > 0) {
                participantsWithEvents.push({
                    email: user.email,
                    userId: user._id,
                    phone: user.phone,
                    college : user.college_name,
                    username: user.username,
                    purchasedEvents: user.purchaseProduct
                });
            }
        }
        if (participantsWithEvents.length > 0) {
            res.status(200).send({participantsWithEvents });
        } else {
            res.status(404).send({ msg: "No participants have purchased any events" });
        }
        
    } catch (error) {
        res.status(500).send({ msg: "There is some error in the server, please try again later" });
    }
};


const addtechevent = async (req, res) => {
    const { 
        tech_event_name,
        tech_event_rules,
        tech_event_description
    } = req.body;
    const tech_event_image = req.file ? req.file.filename : '';  // Use the uploaded filename

    const tech_event = new techEvent({
        tech_event_image,
        tech_event_name,
        tech_event_rules,
        tech_event_description
    });

    try {
        const response = await tech_event.save();
        res.status(200).send({ msg: 'Event successfully created', data: response });
    } catch (err) {
        res.status(500).send({ msg: 'Error saving event', error: err });
    }
};
const addnontechevent = async (req, res) => {
    const { 
        nontech_event_name,
        nontech_event_rules,
        nontech_event_description
    } = req.body;

    const nontech_event_image = req.file ? req.file.filename : '';  // Use the uploaded filename

    const nontech_event = new nonTechEvent({
        nontech_event_image,
        nontech_event_name,
        nontech_event_rules,
        nontech_event_description
    });

    try {
        const response = await nontech_event.save();
        res.status(200).send({ msg: 'Event successfully created', data: response });
    } catch (err) {
        res.status(500).send({ msg: 'Error saving event', error: err });
    }
};

const deleteEvent = async (req, res) => {
 
    const {eventId} = req.body; 
    const findTechEvent = await techEvent.findById(eventId); 
    const findNonTechEvent = await nonTechEvent.findById(eventId); 

    try{

        if(!findTechEvent && !findNonTechEvent){
            res.status(402).send({msg : "No such event found"})
        } 
    
    if(req.user.controll !== 2){
        res.status(401).send({msg : "Unauthanticated User"})
    }
    else if(findTechEvent){
        const deleteTech = await techEvent.findByIdAndDelete(eventId)
        
        if(deleteTech){
            res.status(200).send({msg : "Event deleted successfully"})
        }else{
            res.status(402).send({msg : "Something went wrong please try again later"})
        }
    }
    else if(findNonTechEvent){
        const deleteNonTech = await nonTechEvent.findByIdAndDelete(eventId)
        
        if(deleteNonTech){
            res.status(200).send({msg : "Event deleted successfully"})
        }else{
            res.status(402).send({msg : "Something went wrong please try again later"})
        }
    }
}catch(error){
    res.status(500).send({msg : "Something went wrong please try again later"})
}
}; 
const updateEventInfo = async (req, res) => {
 
    const {eventId, eventName, eventDiscription, eventRules} = req.body; 
    const findTechEvent = await techEvent.findById(eventId); 
    const findNonTechEvent = await nonTechEvent.findById(eventId); 

    try{

        if(!findTechEvent && !findNonTechEvent){
            res.status(402).send({msg : "No such event found"})
        } 

        if(req.user.controll !== 2){
            res.status(401).send({msg : "Unauthanticated User"})
        }
   
        else if(findTechEvent){
           const updateTech = await techEvent.findByIdAndUpdate(eventId , {               
            tech_event_name  : eventName,
            tech_event_description : eventDiscription,
            tech_event_rules : eventRules
        }, {new: true})
    
        
        if(updateTech){
            res.status(200).send({msg : "Event update successfully"})
        }else{
            res.status(402).send({msg : "Something went wrong please try again later"})
        }
    }
    else if(findNonTechEvent){
        const updateNonTech = await nonTechEvent.findByIdAndUpdate(eventId , {               
                nontech_event_name  : eventName,
                nontech_event_description : eventDiscription,
                nontech_event_rules : eventRules
            }, {new: true})
        
        if(updateNonTech){
            res.status(200).send({msg : "Event Updated successfully"})
        }else{
            res.status(402).send({msg : "Something went wrong please try again later"})
        }
    }
}catch(error){
    res.status(500).send({msg : "Something went wrong please try again later"})
}
}; 

module.exports = {participantList, addtechevent, addnontechevent, deleteEvent, updateEventInfo}