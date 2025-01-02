const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");
const tempUserModel = require("../models/tempUserModel");
const utils = require("../utils");
const { checkCharacter } = require('../modules/chat/utils/chat');
const {
  getUserPlanAccessInfo, findOneAndUpdate
} = require("../modules/user/services/userMsgAccount");

module.exports = {
  verifyAdminToken: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.error({ message: "Invalid Token!", code: 401 });
      }

      const token = authHeader.split(" ")[1];
      const user = await adminModel.findOne({ authToken: token });
      if (user) {
        let data = utils.verifyToken(token);
        if (!data) {
          return res.error({ message: "Invalid Token!", code: 401 });
        } else if (user.Inactive === true) {
          return res.error({ message: "Id Deactivated!", code: 401 });
        }
        req.user = user;
        next();
      } else {
        return res.error({ message: "Invalid Token!", code: 401 });
      }
    } catch (error) {
      console.error("Error in verifying token data:", error.message);
      return res.error({ message: "Invalid Token!", code: 401 });
    }
  },
  verifyUserToken: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.error({ message: "Invalid Token!", code: 401 });
      }

      const token = authHeader.split(" ")[1];
      const user = await userModel.findOne({ authToken: token });
      if (user) {
        let data = utils.verifyToken(token);
        if (!data) {
          return res.error({ message: "Invalid Token!", code: 401 });
        } else if (user.Inactive === true) {
          return res.error({ message: "Id Deactivated!", code: 401 });
        }
        req.user = user;
        next();
      } else {
        return res.error({ message: "Invalid Token!", code: 401 });
      }
    } catch (error) {
      console.error("Error in verifying token data:", error.message);
      return res.error({ message: "Invalid Token!", code: 401 });
    }
  },
  getUserDetail: async (req, res, next) => {
    try {
      req.user = "";
      const authHeader = req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("authHeader2", authHeader);
        next();
      } else {
        const token = authHeader.split(" ")[1];
        const user = await userModel.findOne({ authToken: token });
        if (user) {
          let data = utils.verifyToken(token);
          if (!data) {
            next();
          } else if (user.Inactive === true) {
            next();
          }
          req.user = user;
          next();
        } else {
          next();
        }
      }
    } catch (error) {
      console.error("Error in verifying token data:", error.message);
      next();
    }
  },
  verifyUserEmailToken: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.error({ message: "Invalid Token!", code: 401 });
      }

      const token = authHeader.split(" ")[1];
      const user = await tempUserModel.findOne({
        email_verification_Token: token,
      });
      if (user) {
        let data = utils.verifyToken(token);
        if (!data) {
          return res.error({ message: "Session Expired!", code: 403 });
        } else if (user.Inactive === true) {
          return res.error({ message: "Session Expired!", code: 403 });
        }
        req.user = user;
        next();
      } else {
        return res.error({ message: "Session Expired!", code: 403 });
      }
    } catch (error) {
      console.error(
        "Error in verifying User Email Verify token data:",
        error.message
      );
      return res.error({ message: "Session Expired!", code: 403 });
    }
  },
  verifyUserResetPassToken: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.error({ message: "Invalid Token!", code: 401 });
      }

      const token = authHeader.split(" ")[1];
      const user = await userModel.findOne({ password_reset_Token: token });
      if (user) {
        let data = utils.verifyToken(token);
        if (!data) {
          return res.error({ message: "Session Expired!", code: 403 });
        } else if (user.Inactive === true) {
          return res.error({ message: "Session Expired!", code: 403 });
        }
        req.user = user;
        next();
      } else {
        return res.error({ message: "Session Expired!", code: 403 });
      }
    } catch (error) {
      console.error(
        "Error in verifying User Reset Password token data:",
        error.message
      );
      return res.error({ message: "Session Expired!", code: 403 });
    }
  },
  verifyUserResetPassOtpToken: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.error({ message: "Invalid Token!", code: 401 });
      }

      const token = authHeader.split(" ")[1];
      const user = await userModel.findOne({ password_reset_otp_Token: token });
      if (user) {
        let data = utils.verifyToken(token);
        if (!data) {
          return res.error({ message: "Session Expired!", code: 403 });
        } else if (user.Inactive === true) {
          return res.error({ message: "Session Expired!", code: 403 });
        }
        req.user = user;
        next();
      } else {
        return res.error({ message: "Session Expired!", code: 403 });
      }
    } catch (error) {
      console.error(
        "Error in verifying User Reset Password token data:",
        error.message
      );
      return res.error({ message: "Session Expired!", code: 403 });
    }
  },
  verifyIsUserHaveAccessToSendMessage: async (req, res, next) => {
    try {
      const { user } = req;
      let data = req.body;

      const planAccessInfo = await getUserPlanAccessInfo(user._id);
      if (!planAccessInfo.messageCount) {
        return res.error({
          message: "You don't have Access update plan!!",
          code: 403,
        });
      }
      if (planAccessInfo.
        chatCategory && planAccessInfo.
          chatCategoryCount && planAccessInfo.
          characterCategory) {
        const characterInfo = await checkCharacter(data.characterId, user);
        if (!characterInfo) {
          return res.error({
            message: "You don't have Access to chat with this Character",
            code: 403,
          });
        }
        if (planAccessInfo.
          chatCategory.length >= planAccessInfo.
            chatCategoryCount) {
          let findData = planAccessInfo.
            chatCategory.find((item) => (item == (characterInfo.chatType)))
          if (findData) {
            next();
          } else {
            return res.error({
              message: "Exceeded the category limit",
              code: 403,
            });
          }
        } else {
          let updtMsg = await findOneAndUpdate({ userId: user._id }, {
            chatCategory: [...planAccessInfo.
              chatCategory, characterInfo.chatType]
          });
          console.log("updtMsg-->", updtMsg)
          next();
        }
      } else {
        next();
      }
      // next();
    } catch (error) {
      console.error("Error in verifying User Message Balance:", error.message);
      return res.error({
        message: "You don't have Access update plan!!",
        code: 403,
      });
    }
  },
};
