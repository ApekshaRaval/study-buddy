const { v4: uuidv4 } = require('uuid');
const Chat = require('../models/Chat');
const sails = require('sails');

module.exports = {
    sendMessage: async (req, res) => {
        const { message, senderId, receiverId } = req.body;
        if (!message || !senderId || !receiverId) {
            return res.status(400).json({
                status: 400,
                errorCode: "ERR400",
                message: "Missing required fields",
                data: null,
                error: "",
            });
        }

        try {
            const messageId = uuidv4();
            const newMessage = await Chat.create({ messageId, message, senderId, receiverId }).fetch();
            sails.sockets.broadcast('chat', 'message', newMessage);

            return res.status(200).json({
                status: 200,
                errorCode: "SUC000",
                message: "Success",
                data: newMessage,
                error: "",
            });
        } catch (err) {
            return res.status(500).json({
                status: 500,
                errorCode: "ERR500",
                message: "Internal Server Error!",
                data: null,
                error: err,
            });
        }
    },

    getMessages: async (req, res) => {
        try {
            const { senderId, receiverId } = req.query;
            if (!senderId || !receiverId) {
                return res.status(400).json({
                    status: 400,
                    errorCode: "ERR400",
                    message: "Missing required fields",
                    data: null,
                    error: "",
                });
            }

            // Check if the chats table exists
            const query = `SELECT * from chats`;
            const result = await sails.sendNativeQuery(query);

            if (result.rows.length === 0) {
                return res.status(200).json({
                    status: 200,
                    errorCode: "SUC002",
                    message: "No chats available",
                    data: [],
                    error: "",
                });
            }
            // Fetch messages
            const messages = await Chat.find({
                or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            });

            if (messages.length === 0) {
                return res.status(200).json({
                    status: 200,
                    errorCode: "SUC002",
                    message: "No chats available",
                    data: [],
                    error: "",
                });
            }

            return res.status(200).json({
                status: 200,
                errorCode: "SUC000",
                message: "Success",
                data: messages,
                error: "",
            });
        } catch (err) {
            return res.status(500).json({
                status: 500,
                errorCode: "ERR500",
                message: "Internal Server Error!",
                data: null,
                error: err,
            });
        }
    },
};
