/**
 * NotificationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Notification = require("../models/Notification");
const { v4: uuidv4 } = require('uuid');
const { HTTP_STATUS_CODE } = sails.config.constants;
const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = {
    sendNotification: async (req, res) => {
        const { message, senderId } = req.body

        if (!message || !senderId) {
            return res.status(400).json({
                status: 400,
                errorCode: "ERR400",
                message: "Missing required fields",
                data: null,
                error: "",
            });
        }

        try {
            const notificationId = uuidv4();

            const newNotification = await Notification.create({ notificationId, message, senderId, receiverId, seen, createdAt }).fetch();
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Success",
                data: newNotification,
                error: "",
            });
        } catch (err) {
            return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
                status: HTTP_STATUS_CODE.SERVER_ERROR,
                errorCode: "ERR500",
                message: "Internal Server Error!",
                data: null,
                error: err,
            });
        }
    },

    getNotifications: async (req, res) => {
        const token = req?.headers?.authorization?.split(' ')[1];
        try {
            const isValidUser = jwt.verify(token, process.env.JWT_SECRET);
            if (!isValidUser) {
                return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
                    status: HTTP_STATUS_CODE.UNAUTHORIZED,
                    errorCode: "ERR401",
                    message: "User not found!",
                    data: null,
                    error: "",
                });
            }
            const NotificationClause = `SELECT * FROM "notification" WHERE "receiverId" = $1`;
            const data = await sails.sendNativeQuery(NotificationClause, [req.params.id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Notifications",
                data: data,
                error: "",
            });
        } catch (err) {
            console.error(err);
            return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
                status: HTTP_STATUS_CODE.SERVER_ERROR,
                errorCode: "ERR500",
                message: "Internal Server Error!",
                data: null,
                error: err,
            });
        }

    },


};

