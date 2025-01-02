const Joi = require('joi');
const { validateSchema } = require('../../../validators/validator');
const logger = require('../../../config/logger');
const onRampSession = (req, res, next) => {
    req.logAction = {
        uuid: req.uuid,
        apiModule: "user",
        apiHandler: "onRampSession"
    };
    try {

        logger.info(req.logAction, { REQUEST_BODY: req.body });

        const schema = Joi.object().keys({
            transaction_details: Joi.any().required(),
        });

        let validFields = validateSchema(req.body, schema);

        if (validFields) {
            return next();
        };

    } catch (error) {
        logger.error(req.logAction, "User on ramp validation Error", "ERROR" + ":" + error.message, "STACK" + ":" + error.stack);
        return res.error(error);
    }
};

 


module.exports = {
    onRampSession
};