const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/Chat");
const sails = require("sails");

module.exports = {


    sendMessage: async (req, res) => {
        const { senderId, receiverId, text, image, video, call = false, seen = false } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({
                status: 400,
                errorCode: "ERR400",
                message: "Missing required fields",
                data: null,
                error: "",
            });
        }

        const createChatTable = `CREATE TABLE IF NOT EXISTS "chats" (
            id VARCHAR(255) PRIMARY KEY,
            text VARCHAR(255),
            image VARCHAR(255),
            call BOOLEAN,
            video VARCHAR(255),
            seen BOOLEAN,
            senderId VARCHAR(255) NOT NULL,
            receiverId VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT current_timestamp
        )`;

        await sails.sendNativeQuery(createChatTable);

        try {
            const messageId = uuidv4();
            console.log("messageId: ", messageId);
            const chatClause = `INSERT INTO "chats" (id, senderId, receiverId, text, image, call, video, seen) VALUES ('${messageId}', '${senderId}', '${receiverId}', '${text}', '${image}', '${call}', '${video}', '${seen}') RETURNING *`;

            const result = await sails.sendNativeQuery(chatClause);
            console.log('result: ', result);
            const newMessage = result.rows[0];
            console.log("newMessage: ", newMessage);

            sails.sockets.broadcast(receiverId, "message", newMessage);
            sails.sockets.broadcast(senderId, "message", newMessage);

            return res.status(200).json({
                status: 200,
                errorCode: "SUC000",
                message: "Success",
                data: newMessage,
                error: "",
            });
        } catch (err) {
            console.log("err: ", err);
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
        console.log("cajjjj")
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
            const query = `SELECT * FROM chats`;
            const result = await sails.sendNativeQuery(query);
            console.log('query: ', result);

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
            const queryClause = `SELECT * FROM "chats" WHERE (senderid = '${senderId}' AND receiverid = '${receiverId}') OR (senderid = '${receiverId}' AND receiverid = '${senderId}')`;
            console.log('queryClause: ', queryClause);
            const messages = await sails.sendNativeQuery(queryClause);
            console.log("messages: ", messages);

            if (messages.rows.length === 0) {
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
                data: messages.rows,
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

