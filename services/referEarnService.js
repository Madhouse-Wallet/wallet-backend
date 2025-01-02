const userService = require("../modules/user/services/user")
const referEarnService = require("../modules/user/services/referEarn")
const subscriptionHistoryService = require("../modules/user/services/subscriptionHistory")
const affiliateSettingsService = require('../modules/admin/services/affiliateSettings');
const promoCodeService = require('../modules/admin/services/promoCode');
const utils = require('../utils/stripeHandler');
const globalFnc = require('../utils/index');


module.exports = {
    updateWebHook: async (userId) => {
        try {
            let getUser = await userService.findOneRefer({ "_id": userId })
            // console.log(getUser)
            // getUser.subscriptionId.coupon
            let percent = 0;
            if (getUser?.subscriptionId?.coupon) {
                let couponData = await promoCodeService.findOne({ "name": getUser?.subscriptionId?.coupon })
                if (couponData && couponData.type == "Private") {
                    let findCouponOwner = await userService.findOne({ "_id": couponData.userId })
                    if (findCouponOwner) {
                        percent = (couponData?.commission > 0 ? (couponData?.commission) : 0)
                        let referralCode = "";
                        if (findCouponOwner.referralCode) {
                            referralCode = findCouponOwner.referralCode;
                        } else {
                            referralCode = await globalFnc.generateReferralCode(6);
                            referralCode = referralCode + ((findCouponOwner._id).toString()).slice(-4);
                            await userService.findOneAndUpdate({ "_id": findCouponOwner._id }, {
                                referralCode,
                                isAffiliate:true
                            })
                        }
                        await userService.findOneAndUpdate({ "_id": userId }, {
                            referredBy: findCouponOwner._id, referredByCode: referralCode
                        })
                        getUser = await userService.findOneRefer({ "_id": userId })
                        // findOneAndUpdate
                        // findCouponOwner
                    }

                }
            }
            if (getUser.referredBy) {
                let affiliatePercent = await affiliateSettingsService.findOne();
                if (affiliatePercent) {
                    percent = ((percent > 0) ? percent : affiliatePercent.referralPercent);
                    let bonus = (((parseInt(getUser?.subscriptionId?.methodAmount)) || (getUser.subscriptionPlanId.subscriptionCost)) * percent) / 100
                    let subHistData = await subscriptionHistoryService.findOneLatest({ subscriptionModelId: getUser.subscriptionId._id })
                    // console.log("subHistData==>", bonus, subHistData[0])
                    let referEarnData = await referEarnService.createOne({
                        subscriptionId: getUser.subscriptionId._id,
                        subscriptionHistoryId: subHistData[0]._id,
                        subscriptionPlanId: getUser.subscriptionPlanId._id,
                        methodPlanId: getUser.subscriptionId.methodPlanId,
                        methodAmount: getUser.subscriptionId.methodAmount,
                        methodType: getUser.subscriptionId.paymentType,
                        purchaseBy: userId,
                        planAmount: getUser.subscriptionPlanId.subscriptionCost,
                        referPercentage: percent,
                        referAmount: bonus,
                        referBy: getUser.referredBy._id,
                    })
                    // console.log("referEarnData==>",referEarnData)
                    if (referEarnData) {
                        let newDaat = await userService.findOneAndUpdate({
                            _id: getUser.referredBy._id
                        }, {
                            $inc: { rewardWithraw: bonus, totalReward: bonus },
                        }, { new: true })
                        // console.log("newDaat==>",newDaat)
                    }
                }
            }
            return true;
        } catch (e) {
            console.log("error in adding referral bonus===>", e)
            return false
        }
    }
}



