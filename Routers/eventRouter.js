const express = require('express');
const router = express.Router();
const authMiddleware  = require('../Middleware/authMiddleware');
const eventController = require("../Controller/eventController")

router.get('/technicalevents',eventController.techEventMainPage);
router.get('/nontechnicalevents',eventController.nonTechEventMainPage);
router.get('/technicalevents/:technicalevent', eventController.techEventPage);
router.get('/nontechnicalevents/:nontechnicalevent', eventController.nonTechEventPage);

router.get('/cart', authMiddleware , eventController.cart);
router.post('/additem/cartadd', authMiddleware , eventController.addCart);
router.delete('/deleteitem/:eventName', authMiddleware , eventController.deleteCart);

router.post('/purchaseevent', authMiddleware , eventController.purchaseEvent);

module.exports = router;

