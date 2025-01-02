const userMsgAccountService = require("../modules/user/services/userMsgAccount")
const characterService = require("../modules/user/services/character")
const subscriptionPlanService = require("../modules/user/services/subscriptionPlan")
const trialSettingsService = require("../modules/user/services/trialSettings")
const utils = require('../utils/stripeHandler');

module.exports = {
    updateWebHook: async (subscriptionPlanId, userId) => {
        try {
            let planData = await subscriptionPlanService.findOne({
                // planId
                "_id": subscriptionPlanId
            });
            if (planData) {
                // let count = await characterService.countData({ subscriptionPlanId, userCreaterId:userId  })
                // let charactersCount = (((count < planData.charactersCount) && (planData.charactersCount - count)) || 0);
                let characterCategory;
                let chatCategoryCount;
                let chatCategory = [];
                // chatCategory: [{ type: String }],
                // chatCategoryCount: { type: Number },
                if (planData.name == "Bronze") {
                    characterCategory = ["Default"];
                    chatCategoryCount = 1;
                    chatCategory = [];
                } else if (planData.name == "Silver") {
                    characterCategory = ["Default", "Realistic"]
                    chatCategoryCount = 2;
                    chatCategory = [];
                } else {
                    chatCategoryCount = 3;
                    chatCategory = [];
                    characterCategory = ["Default", "Realistic", "Amateur", "Fantasy"]
                }
                const updtMsgAct = await userMsgAccountService.findOneAndUpdateUpsert(
                    {
                        userId
                    },
                    {
                        userId: userId,
                        messageCount: planData.messageCount,
                        charactersCount: planData.charactersCount,
                        extraImgCount: planData.extraImgCount,
                        characterCategory,
                        chatCategoryCount,
                        chatCategory

                    })
                return updtMsgAct;
            }
            return false
        } catch (error) {
            console.error('Error in Updating User Message Account Model from WebHook Event:', error);
            return false
        }
    },
    subcripitonCancelWebHook: async (userId) => {
        try {
            const updtMsgAct = await userMsgAccountService.findOneAndUpdateUpsert(
                {
                    userId
                },
                {
                    userId: userId,
                    messageCount: 0,
                    charactersCount: 0,
                    extraImgCount: 0
                })
            return updtMsgAct;
        } catch (error) {
            console.error('Error in Updating User Message Account Model from WebHook Event:', error);
            return false
        }
    },
    addTrial: async (userId) => {
        try {
            const trialSett = await trialSettingsService.findOne();
            const updtMsgAct = await userMsgAccountService.findOneAndUpdateUpsert(
                {
                    userId
                },
                {
                    userId: userId,
                    messageCount: trialSett.freeMessageCount,
                    charactersCount: trialSett.charactersCount,
                    extraImgCount: trialSett.extraImgCount
                    // messageCount: 0,
                    // charactersCount: 0,
                    // extraImgCount: 0
                })
            return updtMsgAct;
        } catch (error) {
            console.error('Error in Updating User Message Account Model from WebHook Event:', error);
            return false
        }
    }
}



