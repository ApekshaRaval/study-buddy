/**
 * NotificationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { v4: uuidv4 } = require('uuid');
const { HTTP_STATUS_CODE } = sails.config.constants;
const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = {
    sendNotification: async (req, res) => {
        const { message, senderid, receiverid = null, seen = false, createdat = Math.floor(Date.now() / 1000) } = req.body;
        console.log('req.body: ', message, senderid, receiverid, seen, createdat);

        if (!message || !senderid || !receiverid) {
            return res.status(400).json({
                status: 400,
                errorCode: "ERR400",
                message: "Missing required fields",
                data: null,
                error: "",
            });
        }

        const createNotificationTable = ` CREATE TABLE IF NOT EXISTS public.notification(
            notificationid UUID PRIMARY KEY,
            message TEXT NOT NULL,
            senderid UUID NOT NULL,
            receiverid UUID[],
            seen BOOLEAN DEFAULT FALSE,
            createdat TIMESTAMP NOT NULL
        )`;
        await sails.sendNativeQuery(createNotificationTable);

        try {
            const notificationid = uuidv4();

            let newNotification = await Notification.create({
                notificationid,
                message,
                senderid,
                receiverid,
                seen,
                createdat: new Date(createdat * 1000) // Convert back to milliseconds
            }).fetch();

            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Success",
                data: newNotification,
                error: "",
            });
        } catch (err) {
            console.log('err: ', err);
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

            // Adjust the query based on whether you need to filter by receiverid
            const receiverid = req.params.id;
            let NotificationClause;

            if (receiverid) {
                const getReceiverId = `SELECT receiverid FROM public.notification`;
                const receiverIdData = await sails.sendNativeQuery(getReceiverId);
                console.log('receiverIdData: ', receiverIdData);

                const ids = receiverIdData?.rows[0]?.receiverid
                NotificationClause = `SELECT * FROM public.notification  ORDER BY createdat DESC`;
                NotificationClause = `SELECT * FROM public.notification WHERE $1 = ANY($2) ORDER BY createdat DESC`;
                data = await sails.sendNativeQuery(NotificationClause, [receiverid, ids]);
            } else {
                NotificationClause = `SELECT * FROM public.notification ORDER BY createdat DESC`;
                data = await sails.sendNativeQuery(NotificationClause);
            }

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

    updateNotification: async (req, res) => {
        const { id } = req.params;
        const { seen } = req.body;

        try {
            const updatedNotificationClause = `UPDATE public.notification SET seen = $1 WHERE notificationid = $2`;
            const updatedNotification = await sails.sendNativeQuery(updatedNotificationClause, [seen, id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Notification Updated Successfully",
                data: updatedNotification,
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
    }


};

