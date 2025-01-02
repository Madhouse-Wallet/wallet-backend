const { sendEmail } = require("../utils/mailer.provider")
const utils = require('../utils');
const { generateOTP } = require("../utils/index")
module.exports = {
    userEmailVerificationOtpMail: async (mail) => {
        try {
            let otp = await generateOTP(4);
            console.log("otp", otp)
            temp = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>OTP For Email Verification</h2>
            <p>Hello,</p>
            <p>We received a request to verify your Email. Please use the following OTP to complete the process:</p>
            <h3>Your OTP: <span style="color: #3498db;">${otp}</span></h3>
            <p>This OTP is valid for a 2 minutes. If you didn't request a Verification, Please ignore this email.</p>
            <p>Thank you!</p>
          </div>`
            const emailSubject = 'Email Verification OTP';
            const emailInfo = await sendEmail(mail, emailSubject, "Html", temp);
            console.log("emailInfo", emailInfo)
            return { emailInfo, otp };
        } catch (error) {
            console.error('Error in verifying token data:', error.message);
            return false;
        }
    },
    userPassResetOtpMail: async (mail) => {
        try {
            let otp = await generateOTP(4);
            console.log("otp", otp)
            temp = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>OTP For Reset Password</h2>
            <p>Hello,</p>
            <p>We received a request to Reset your Password. Please use the following OTP to complete the process:</p>
            <h3>Your OTP: <span style="color: #3498db;">${otp}</span></h3>
            <p>This OTP is valid for a 2 minutes. If you didn't request a Reset Password Request, Please ignore this email.</p>
            <p>Thank you!</p>
          </div>`
            const emailSubject = 'Password Reset OTP';
            const emailInfo = await sendEmail(mail, emailSubject, "Html", temp);
            console.log("emailInfo", emailInfo)
            return { emailInfo, otp };
        } catch (error) {
            console.error('Error in verifying token data:', error.message);
            return false;
        }
    },
    sendSubscriptionInvoice: async (mail, url, invoiceType) => {
        try {
            temp = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice Created For Subscription</h2>
            <p>Hello,</p>
            <p>The Invoice ${invoiceType} For Subscription. Please Pay for Subscription:</p>
            <h3>Your Invoice: <span style="color: #3498db;">${url}</span></h3>
            <p>If It is Already Paid then Please Ignore this mail.</p>
            <p>Thank you!</p>
          </div>`
            const emailSubject = 'Invoice For Subscription!';
            const emailInfo = await sendEmail(mail, emailSubject, "Html", temp);
            console.log("emailInfo", emailInfo)
            return { emailInfo };
        } catch (error) {
            console.error('Error in verifying token data:', error.message);
            return false;
        }
    },


    sendPaystackSubscription: async (mail) => {
        try {
            temp = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2></h2>
            <p>Hello,</p>
            <p>The Subscription Created Successfully!</p>
            <p>Thank you!</p>
          </div>`
            const emailSubject = 'Invoice For Subscription!';
            const emailInfo = await sendEmail(mail, emailSubject, "Html", temp);
            console.log("emailInfo", emailInfo)
            return { emailInfo };
        } catch (error) {
            console.error('Error in verifying token data:', error.message);
            return false;
        }
    },

    sendPaystackInvoiceSubscription: async (mail, invoiceType, Paid) => {
        try {
            temp = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice Created For Subscription</h2>
            <p>Hello,</p>
            <p>The Invoice ${invoiceType} For Subscription.</p>
            <h3>Your Invoice ${Paid}</span></h3>
          </div>`
            const emailSubject = 'Invoice For Subscription!';
            const emailInfo = await sendEmail(mail, emailSubject, "Html", temp);
            console.log("emailInfo", emailInfo)
            return { emailInfo };
        } catch (error) {
            console.error('Error in verifying token data:', error.message);
            return false;
        }
    },

};