const express = require('express');
const router = express.Router();

const validators = require('./validators/user.validation');
const userController = require('./controllers/user');
router.post("/create-onramp-session", validators.onRampSession, userController.onrampSession);
module.exports = router;