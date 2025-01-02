const moment = require('moment-timezone');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
let sendSuccessResponse = (message, res, data) => {
    var resData = {
        status: "success",
        status_code: 200,
        message: (message),
        data: data ? data : {},
    };
    return res.status(200).send(resData);
};
let sendErrorResponse = function (err, res, data) {
    let code = (typeof err === 'object' && typeof err.code === 'number') ? (err.code) ? err.code : 500 : 400;
    let message = (typeof err === 'object') ? (err.message ? err.message : 'Internal Server Error') : err;
    var resData = {
        status: "failure",
        status_code: code,
        message: (message),
        data: data ? data : {},
    };

    return res.status(code).send(resData);
};
let getCurrentDateAndTimeInCityTimezoneFromUTC = (cityTimezone) => {
    let a = moment.tz(new Date(), cityTimezone)
    return a;
};

let getDateAndTimeInCityTimezone = (date, cityTimezone) => {
    let a = moment.tz(date, cityTimezone)
    return a;
};

let roundNumber = (num) => {
    return Math.round(num * 100) / 100;
}

let generateOTP = async (codelength) => {
    return Math.floor(Math.random() * (Math.pow(10, (codelength - 1)) * 9)) + Math.pow(10, (codelength - 1));
};

let generatorRandomNumber = (length) => {
    if (typeof length == "undefined")
        length = 2;
    var token = "";
    var possible = "123456789";
    for (var i = 0; i < length; i++)
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    return token;
};

let getScheduleData = (format, sd, st, pickupTimezone) => {
    let dateStructure = sd + " " + st;
    let ar = helper.getDateAndTimeInCityTimezone(dateStructure, pickupTimezone);
    let scheduledTime = ar.format('LT'); //08:30 PM
    let scheduledDate = ar.format('L'); //04/09/1986
    let scheduled_utcs = new Date(ar.utc().format());

    return { scheduledDate: scheduledDate, scheduledTime: scheduledTime, scheduled_utc: scheduled_utcs, currentUTC: new Date() };
};

let isValidDate = (date, format) => {
    var validDateFormat = moment(date, format).isValid();

    return validDateFormat;
};
let extendDate = (date = new Date(), time, action = "minutes") => {
    return moment(date).add(action, action);
};
let compareDates = (date1, date2 = new Date()) => {
    date1 = new Date(date1).getTime();
    date2 = new Date(date2).getTime();
    return date1 > date2;
};
let calculateDayRange = (date = new Date()) => {
    const startOfDay = moment(date).startOf('day');
    const endOfDay = moment(date).endOf('day');
    return {
        startOfDay,
        endOfDay,
    };
}


// "DD-MM HH:mm:ss.SSS"
const getLoggingTime = () => {
    let date = new Date();
    return pad(date.getUTCMonth() + 1)
        + '-' + pad(date.getUTCDate())
        + ' ' + pad(date.getUTCHours())
        + ':' + pad(date.getUTCMinutes())
        + ':' + pad(date.getUTCSeconds())
        + '.' + String((date.getUTCMilliseconds() / 1000).toFixed(3)).slice(2, 5);
}

const pad = (number) => {
    var r = String(number);
    if (r.length === 1) {
        r = '0' + r;
    }
    return r;
}

const hashPassword = async (password) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};
const verifyPassword = async (hashedPassword, password) => {
    const validPassword = await bcrypt.compare(password, hashedPassword);
    return validPassword;
};

const generateToken = async (user, expiresIn = '15d') => {
    // console.log("tokenExpiresIn:", expiresIn)
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        // process.env.JWT_SECRET,
        { expiresIn: expiresIn }
    );
};
const verifyToken = (token) => {
    return jwt.verify(
        token,
        // process.env.JWT_SECRET
    );
};

const generateHashKey = (length = 30, start_with = "tok") => {
    return start_with + crypto.randomBytes(length).toString('hex');
};

const charQualities = async (data) => {
    let obj = { "qualitiesArray": [], "qualitiesText": "" };
    let qualities = data.find((i) => (i.type == "Appearance"));
    if (qualities) {
        obj.qualitiesArray = qualities.list.map((item) => item.value).sort();
        obj.qualitiesText = obj.qualitiesArray.join(" ")
        return obj
    } else {
        return obj
    }

}
const generateReferralCode = async (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return code;
}

module.exports = {
    sendErrorResponse,
    sendSuccessResponse,
    getCurrentDateAndTimeInCityTimezoneFromUTC,
    getDateAndTimeInCityTimezone,
    roundNumber,
    generateOTP,
    generatorRandomNumber,
    getScheduleData,
    isValidDate,
    getLoggingTime,
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    compareDates,
    extendDate,
    generateHashKey,
    calculateDayRange,
    charQualities,
    generateReferralCode
}
