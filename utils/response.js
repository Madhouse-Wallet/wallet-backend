const { sendSuccessResponse, sendErrorResponse } = require(".");
function wrapResponse(req, res) {
    res.success = function (msg, options = {}) {
        let message = "Data Success";
        if (typeof msg !== 'string') {
            return sendSuccessResponse(message, res, msg);
        } else {
            return sendSuccessResponse(msg, res, options);
        }
    }

    res.error = function (msg, options = {}) {

        return sendErrorResponse(msg, res, options);
    }
    return res;
}

module.exports = wrapResponse;
