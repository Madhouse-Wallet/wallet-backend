const weebhookService = require("../modules/user/services/subscription")
const userService = require("../modules/user/services/user")
const invoiceService = require("../modules/user/services/invoiceHistory")
const userMsgAccountService = require("./userMsgAccount.service")
const referEarnService = require("./referEarnService")
const utils = require('../utils/stripeHandler');
const paypalHandler = require("../utils/paypalHandler");
const emailService = require("./mail.service")
const subscriptionPlanService = require("../modules/user/services/subscriptionPlan")
module.exports = {
    paymentSucceed: async (req) => {
        try {
            let data = req.body.data.object;
            let subData = await utils.retrieveSubscription(data.subscription);
            console.log("subData===>", subData.latest_invoice)
            // let paymentMethodId = subData.latest_invoice.payment_intent.payment_method;
            let paymentMethodId = await utils.custGetDefaultPaymentMethod(subData.latest_invoice.customer)
            // if(!paymentMethodId) {
            //     paymentMethodId = await utils.custGetDefaultPaymentMethod(subData.latest_invoice.customer)
            // }
            if (subData) {
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.subscription
                }, {
                    paymentMethodId,
                    current_period_start: subData.current_period_start,
                    current_period_end: subData.current_period_end,
                    status: subData.status,
                    methodStatus: subData.status,
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        trialStatus: false
                    })
                    userMsgAccountService.updateWebHook(updtData.subscriptionPlanId, updtData.userId)
                }

            }
        } catch (error) {
            console.error('Error in webhook event paymentSucceed function:', error);
        }
    },
    subscritionCancel: async (req) => {
        try {
            let data = req.body.data.object;
            // console.log("subscritionCancel==>",data)
            let subData = await utils.retrieveSubscription(data.id);
            // let paymentMethodId = subData.latest_invoice.payment_intent.payment_method;
            let paymentMethodId = await utils.custGetDefaultPaymentMethod(subData.latest_invoice.customer)
            // if(!paymentMethodId) {
            //     paymentMethodId = await utils.custGetDefaultPaymentMethod(subData.latest_invoice.customer)
            // }
            if (subData) {
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.id
                }, {
                    paymentMethodId,
                    current_period_start: subData.current_period_start,
                    current_period_end: subData.current_period_end,
                    status: subData.status,
                    methodStatus: subData.status,
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        subscriptionStatus: false, subscriptionPlanId: '', methodPlanId: '', subscriptionId: '', trialStatus: false
                    })
                    userMsgAccountService.subcripitonCancelWebHook(updtData.userId)
                }
            }
        } catch (error) {
            console.error('Error in webhook event paymentSucceed function:', error);
        }
    },
    paymentFailed: async (req) => {
        try {
            let data = req.body.data.object;
            console.log("paymentFailed==>", data)
            let subData = await utils.retrieveSubscription(data.subscription);
            if (subData) {
                const updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.subscription
                }, {
                    current_period_start: subData.current_period_start,
                    current_period_end: subData.current_period_end,
                    status: subData.status,
                    methodStatus: subData.status,
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        subscriptionStatus: false, subscriptionPlanId: '', methodPlanId: '', subscriptionId: ''
                    })
                    userMsgAccountService.subcripitonCancelWebHook(updtData.userId)
                }
            }
        } catch (error) {
            console.error('Error in webhook event paymentSucceed function:', error);
        }
    },
    invoicefunc: async (req, invoiceType) => {
        try {
            let data = req.body.data.object;
            console.log("invoiceCreated===>", data.hosted_invoice_url)
            if (data.hosted_invoice_url) {
                let emailStatus = await emailService.sendSubscriptionInvoice(data.customer_email, data.hosted_invoice_url, invoiceType);
                console.log("InvoiceEmailStatus===>", emailStatus);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    invoiceEntry: async (req, invoiceType) => {
        try {
            let data = req.body.data.object;
            let invoiceId = data.id;
            let current_period_start = data.period_start;
            let current_period_end = data.period_end;
            let status = invoiceType;
            let paid = data.paid;
            let customerId = data.customer;
            let total = data.total;
            let paymentMethodId = await utils.custGetDefaultPaymentMethod(customerId)
            let paymentMethodfrom = "default";
            if (data.payment_intent) {
                // Retrieve the payment intent to get the payment method
                const paymentIntent = await utils.paymentIntent(data.payment_intent)
                if (paymentIntent && paymentIntent.payment_method)
                    paymentMethodId = paymentIntent.payment_method;
                paymentMethodfrom = "payment Intent"
            }
            // let amount_due = data.amount_due;
            // let amount_paid = data.amount_paid;
            let hosted_invoice_url = data.hosted_invoice_url
            // let subData = await utils.retrieveSubscription(data.subscription);
            // if(subData){
            //     current_period_start: subData.current_period_start,
            //     current_period_end: subData.current_period_end,
            // }
            let updtData = await weebhookService.findOne({ subscriptionId: data.subscription })
            if (updtData) {
                invoiceService.findOneAndUpdateUpsert({ invoiceId }, {
                    invoiceId,
                    current_period_start, current_period_end, status, paid, customerId, total,
                    subscriptionId: updtData._id,
                    subscriptionPlanId: updtData.subscriptionPlanId,
                    methodPlanId: updtData.methodPlanId,
                    userId: updtData.userId,
                    paymentMethodId,
                    paymentMethodfrom,
                    hosted_invoice_url
                })
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    paystackSubSuccess: async (req) => {
        try {
            const eventData = req.body;
            let data = eventData.data;
            let paymentMethodId = data.authorization.authorization_code
            if (data) {
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.subscription_code
                }, {
                    paymentMethodId,
                    current_period_end: Math.floor(new Date(data.next_payment_date).getTime() / 1000),
                    current_period_start: Math.floor(new Date(data.createdAt).getTime() / 1000),
                    status: data.status,
                    methodStatus: data.status,
                })
                if (updtData) {
                    await userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        trialStatus: false
                    })
                    userMsgAccountService.updateWebHook(updtData.subscriptionPlanId, updtData.userId)
                    referEarnService.updateWebHook(updtData.userId)
                }

            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paystackInvoiceCreate: async (req) => {
        try {
            console.log("paystackInvoiceCreate")
            const eventData = req.body;
            let data = eventData.data;
            let paymentMethodId = data.authorization.authorization_code
            if (data) {
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.subscription.subscription_code
                }, {
                    paymentMethodId,
                    current_period_end: Math.floor(new Date(data.subscription.next_payment_date).getTime() / 1000),
                    current_period_start: Math.floor(new Date(data.period_start).getTime() / 1000),
                    status: data.subscription.status,
                    methodStatus: data.subscription.status,
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        trialStatus: false
                    })
                    if (data.subscription.status == "active") {
                        userMsgAccountService.updateWebHook(updtData.subscriptionPlanId, updtData.userId)
                    }
                }
            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paystackInvoiceEntry: async (req, invoiceType) => {
        try {
            const eventData = req.body;
            let data = eventData.data;
            if (data) {
                let invoiceId = data.invoice_code;
                let current_period_start = data.period_start;
                let current_period_end = data.period_end;
                let reason = (data.description || "");
                let status = invoiceType;
                let paid = data.paid;
                let customerId = data.customer.customer_code;
                let total = data.amount;
                let paymentMethodfrom = "Authorisation";
                let paymentMethodId = data.authorization.authorization_code;
                let updtData = await weebhookService.findOne({ subscriptionId: data.subscription.subscription_code })
                if (updtData) {
                    invoiceService.findOneAndUpdateUpsert({ invoiceId }, {
                        invoiceId,
                        current_period_start,
                        current_period_end,
                        status,
                        paid,
                        customerId,
                        total,
                        subscriptionId: updtData._id,
                        subscriptionPlanId: updtData.subscriptionPlanId,
                        methodPlanId: updtData.methodPlanId,
                        userId: updtData.userId,
                        paymentMethodId,
                        paymentMethodfrom,
                        hosted_invoice_url: "",
                        reason
                    })
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    paystackInvoicePaymentFailed: async (req) => {
        try {
            const eventData = req.body;
            let data = eventData.data;
            let paymentMethodId = data.authorization.authorization_code
            if (data) {
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.subscription.subscription_code
                }, {
                    paymentMethodId,
                    current_period_end: Math.floor(new Date(data.subscription.next_payment_date).getTime() / 1000),
                    current_period_start: Math.floor(new Date(data.period_start).getTime() / 1000),
                    status: data.subscription.status,
                    methodStatus: data.subscription.status,
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        // subscriptionStatus: false, subscriptionPlanId: 'updtData.subscriptionPlanId', methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        trialStatus: false,
                        subscriptionStatus: false, subscriptionPlanId: '', methodPlanId: '', subscriptionId: ''
                    })

                    userMsgAccountService.subcripitonCancelWebHook(updtData.userId)
                }
            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paystackSubCancel: async (req) => {
        try {
            const eventData = req.body;
            let data = eventData.data;
            let paymentMethodId = data.authorization.authorization_code
            if (data) {
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.subscription_code
                }, {
                    paymentMethodId,
                    // current_period_end: Math.floor(new Date(data.subscription.next_payment_date).getTime() / 1000),
                    // current_period_start: Math.floor(new Date(data.period_start).getTime() / 1000),
                    status: "Canceled",
                    methodStatus: data.status,
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        // subscriptionStatus: false, subscriptionPlanId: 'updtData.subscriptionPlanId', methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        trialStatus: false,
                        subscriptionStatus: false, subscriptionPlanId: '', methodPlanId: '', subscriptionId: ''
                    })

                    userMsgAccountService.subcripitonCancelWebHook(updtData.userId)
                }
            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paystackSubMail: async (mail) => {
        try {
            let emailStatus = await emailService.sendPaystackSubscription(mail);
            console.log("InvoiceEmailStatus===>", emailStatus);
            return true;
        } catch (e) {
            return false;
        }
    },
    paystackInvMail: async (mail, invoiceType, Paid) => {
        try {
            let emailStatus = await emailService.sendPaystackInvoiceSubscription(mail, invoiceType, Paid);
            console.log("InvoiceEmailStatus===>", emailStatus);
            return true;
        } catch (e) {
            return false;
        }
    },

    paypalSubSuccess: async (eventData, country) => {
        try {
            let data = eventData.resource;
            let paymentMethodId = data.subscriber.payer_id
            if (country == "eur") {
                planIdFromDB = await subscriptionPlanService.findOne({ paypalPlanIdEur: data.plan_id });
            } else {
                planIdFromDB = await subscriptionPlanService.findOne({ paypalPlanId: data.plan_id });
            }
            if (data) {
                const { billing_info } = data;
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.id
                }, {
                    paymentMethodId,
                    current_period_end: Math.floor(new Date(billing_info.next_billing_time).getTime() / 1000),
                    current_period_start: Math.floor(new Date(data.start_time).getTime() / 1000),
                    status: data.status,
                    methodStatus: data.status,
                    subscriptionPlanId: planIdFromDB._id,
                    currency: billing_info.last_payment.amount.currency_code,
                    methodAmount: billing_info.last_payment.amount.value,
                    methodPlanId: data.plan_id
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        trialStatus: false
                    })
                    userMsgAccountService.updateWebHook(updtData.subscriptionPlanId, updtData.userId)
                }

            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paypalSaleCompleted: async (eventData, country) => {
        try {
            console.log("paypalSaleCompleted===>")
            let data = eventData.resource;
            let billing_agreement_id = data.billing_agreement_id
            let subRes = await paypalHandler.getSubscription(billing_agreement_id, country);
            if (subRes.status) {
                let subData = subRes.data;
                if (subData) {
                    const { billing_info, subscriber } = subData;
                    let updtData = await weebhookService.webhookUpdt({
                        subscriptionId: subData.id
                    }, {
                        paymentMethodId: subscriber.payer_id,
                        current_period_end: Math.floor(new Date(billing_info.next_billing_time).getTime() / 1000),
                        current_period_start: Math.floor(new Date(subData.start_time).getTime() / 1000),
                        status: subData.status,
                        methodStatus: subData.status,
                        currency: billing_info.last_payment.amount.currency_code,
                        methodAmount: billing_info.last_payment.amount.value,
                    })
                    if (updtData) {
                        await userService.findOneAndUpdate({ "_id": updtData.userId }, {
                            subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                            trialStatus: false
                        })
                        userMsgAccountService.updateWebHook(updtData.subscriptionPlanId, updtData.userId)
                        referEarnService.updateWebHook(updtData.userId)
                    }

                }
            }

        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paypalSubActivated: async (eventData, country) => {
        try {
            console.log("paypalSaleCompleted===>", eventData)
            let data = eventData.resource;
            let billing_agreement_id = data.id
            let subRes = await paypalHandler.getSubscription(billing_agreement_id, country);
            if (subRes.status) {
                let subData = subRes.data;
                if (subData) {
                    const { billing_info, subscriber } = subData;
                    let updtData = await weebhookService.webhookUpdt({
                        subscriptionId: subData.id
                    }, {
                        paymentMethodId: subscriber.payer_id,
                        current_period_end: Math.floor(new Date(billing_info.next_billing_time).getTime() / 1000),
                        current_period_start: Math.floor(new Date(subData.start_time).getTime() / 1000),
                        status: subData.status,
                        methodStatus: subData.status,
                        currency: billing_info.last_payment.amount.currency_code,
                        methodAmount: billing_info.last_payment.amount.value,
                    })
                    if (updtData) {
                        console.log("updated==>")
                        await userService.findOneAndUpdate({ "_id": updtData.userId }, {
                            subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                            trialStatus: false
                        })
                        userMsgAccountService.updateWebHook(updtData.subscriptionPlanId, updtData.userId)
                        referEarnService.updateWebHook(updtData.userId)
                    } else { console.log("np updated==>") }
                }
            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },
    paypalSubExpire: async (eventData, country) => {
        try {
            let data = eventData.resource;
            let paymentMethodId = data.subscriber.payer_id
            let planIdFromDB;
            if (country == "eur") {
                planIdFromDB = await subscriptionPlanService.findOne({ paypalPlanIdEur: data.plan_id });
            } else {
                planIdFromDB = await subscriptionPlanService.findOne({ paypalPlanId: data.plan_id });
            }

            if (data) {
                const { billing_info } = data;
                let updtData = await weebhookService.webhookUpdt({
                    subscriptionId: data.id
                }, {
                    paymentMethodId,
                    current_period_end: Math.floor(new Date(billing_info.next_billing_time).getTime() / 1000),
                    current_period_start: Math.floor(new Date(data.start_time).getTime() / 1000),
                    status: data.status,
                    methodStatus: data.status,
                    subscriptionPlanId: planIdFromDB._id,
                    currency: billing_info.last_payment.amount.currency_code,
                    methodAmount: billing_info.last_payment.amount.value,
                    methodPlanId: data.plan_id
                })
                if (updtData) {
                    userService.findOneAndUpdate({ "_id": updtData.userId }, {
                        // subscriptionStatus: true, subscriptionPlanId: updtData.subscriptionPlanId, methodPlanId: updtData.methodPlanId, subscriptionId: updtData._id,
                        // trialStatus: false,
                        subscriptionStatus: false, subscriptionPlanId: '', methodPlanId: '', subscriptionId: ''
                    })
                    userMsgAccountService.subcripitonCancelWebHook(updtData.userId)
                }

            }
        } catch (error) {
            console.error('Error in Paystack webhook event Subscription success function:', error);
        }
    },


}


