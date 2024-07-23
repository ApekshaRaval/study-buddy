/**
 * SessionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { v4: uuidv4 } = require('uuid');
const { HTTP_STATUS_CODE } = sails.config.constants;
const jwt = require('jsonwebtoken');
require('dotenv').config()
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

module.exports = {
    createSession: async (req, res) => {
        try {
            const { sessionTitle, sessionDate, sessionContent, sessionLink, teacherId, subject, sessionType, quizcontent } = req.body;

            if (!sessionTitle || !sessionDate || !teacherId || !subject || !sessionType) {
                return res.status(400).json({
                    status: 400,
                    errorCode: "ERR400",
                    message: "Missing required fields",
                    data: null,
                    error: "",
                });
            }

            const createSessionTable = `CREATE TABLE IF NOT EXISTS "session" (
                "sessionId" VARCHAR(255) PRIMARY KEY,
                "teacherId" VARCHAR(255) NOT NULL,
                "sessionTitle" VARCHAR(255) NOT NULL,
                "sessionDate" VARCHAR(255) NOT NULL,
                "sessionContent" VARCHAR(255),
                 "quizcontent"character varying[]   ,
                "sessionLink" VARCHAR(255),
                "subject" VARCHAR(255) NOT NULL,
                 "sessionType" VARCHAR(255) NOT NULL,
                FOREIGN KEY ("teacherId") REFERENCES "user" ("id")
            )`;
            await sails.sendNativeQuery(createSessionTable);

            const sessionId = uuidv4();
            const createSession = `INSERT INTO "session" ("sessionId", "sessionTitle", "sessionDate", "sessionContent","quizcontent", "teacherId", "sessionLink", "subject","sessionType") VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9) RETURNING *`;
            const data = await sails.sendNativeQuery(createSession, [sessionId, sessionTitle, sessionDate, sessionContent, quizcontent, teacherId, sessionLink, subject, sessionType]);

            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Session Created Successfully",
                data: data.rows[0],
                error: "",
            });
        } catch (err) {
            console.log(err);
            return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
                status: HTTP_STATUS_CODE.SERVER_ERROR,
                errorCode: "ERR500",
                message: "Internal Server Error!",
                data: null,
                error: err,
            });
        }
    },

    getAllSessions: async (req, res) => {
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
            const subjectClause = `SELECT subjects FROM "user" where id = $1`;
            const subjectData = await sails.sendNativeQuery(subjectClause, [req.params.id]);
            const subject = subjectData?.rows[0]?.subjects
            const formattedSubjects = `(${subject.map(subject => `'${subject}'`).join(", ")})`;
            const sessionClause = `SELECT * FROM "session" where subject IN ${formattedSubjects}`;
            const data = await sails.sendNativeQuery(sessionClause);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "All Sessions",
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

    getTeacherSessions: async (req, res) => {
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
            const SessionClause = `SELECT * FROM "session" WHERE "teacherId" = $1`;
            const data = await sails.sendNativeQuery(SessionClause, [req.params.id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Teacher Sessions",
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

    getSessionDetail: async (req, res) => {
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
            const SessionClause = `SELECT * FROM "session" WHERE "sessionId" = $1`;
            const data = await sails.sendNativeQuery(SessionClause, [req.params.id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Session Detail",
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
    deleteSession: async (req, res) => {
        const { id } = req.params

        try {
            const deletedSessionClause = `DELETE FROM "session" WHERE "sessionId" = $1`;
            const deletedSession = await sails.sendNativeQuery(deletedSessionClause, [id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Session Deleted Successfully",
                data: deletedSession,
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

}


