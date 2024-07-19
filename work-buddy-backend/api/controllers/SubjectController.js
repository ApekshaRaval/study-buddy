/**
 * SubjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { HTTP_STATUS_CODE } = sails.config.constants;
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

module.exports = {

    // createSubject: async (req, res) => {
    //     const token = req?.headers?.authorization?.split(' ')[1];
    //     const { subjectId, subjectName, teacherId, studentId } = req.body;
    //     try {
    //         const isValidUser = jwt.verify(token, process.env.JWT_SECRET);
    //         if (!isValidUser) {
    //             return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
    //                 status: HTTP_STATUS_CODE.UNAUTHORIZED,
    //                 errorCode: "ERR401",
    //                 message: "User not found!",
    //                 data: null,
    //                 error: "",
    //             });
    //         }

    //         if (!subjectId || !subjectName || !teacherId || !studentId) {
    //             return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
    //                 status: HTTP_STATUS_CODE.BAD_REQUEST,
    //                 errorCode: "ERR400",
    //                 message: "Missing required fields",
    //                 data: null,
    //                 error: "",
    //             });
    //         }

    //         const newSubject = await Subject.create({ subjectId, subjectName, teacherId, studentId }).fetch();
    //         return res.status(HTTP_STATUS_CODE.OK).json({
    //             status: HTTP_STATUS_CODE.OK,
    //             errorCode: "SUC000",
    //             message: "Success",
    //             data: newSubject,
    //             error: "",
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
    //             status: HTTP_STATUS_CODE.SERVER_ERROR,
    //             errorCode: "ERR500",
    //             message: "Internal Server Error!",
    //             data: null,
    //             error: err,
    //         });
    //     }
    // },

    // getSubjectByUser: async (req, res) => {
    //     const token = req?.headers?.authorization?.split(' ')[1];
    //     try {
    //         const isValidUser = jwt.verify(token, process.env.JWT_SECRET);
    //         if (!isValidUser) {
    //             return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
    //                 status: HTTP_STATUS_CODE.UNAUTHORIZED,
    //                 errorCode: "ERR401",
    //                 message: "User not found!",
    //                 data: null,
    //                 error: "",
    //             });
    //         }
    //         const { id } = req.params;
    //         const subject = `SELECT * FROM public."subject" WHERE "studentId" = $1 AND "isLoggedIn" = true`;
    //         const data = await sails.sendNativeQuery(subject, [id]);
    //         return res.status(HTTP_STATUS_CODE.OK).json({
    //             status: HTTP_STATUS_CODE.OK,
    //             errorCode: "SUC000",
    //             message: "Success",
    //             data: data.rows,
    //             error: "",
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         return res.status(HTTP_STATUS_CODE.SERVER_ERROR).json({
    //             status: HTTP_STATUS_CODE.SERVER_ERROR,
    //             errorCode: "ERR500",
    //             message: "Internal Server Error!",
    //             data: null,
    //             error: err,
    //         });
    //     }
    // },

    createSubject: (req, res) => {
        const { subjectId, subjectName } = req.body;
        try {
            if (!subjectId || !subjectName) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    status: HTTP_STATUS_CODE.BAD_REQUEST,
                    errorCode: "ERR400",
                    message: "Missing required fields",
                    data: null,
                    error: "",
                });
            }
            const subjectId = uuidv4();
            const createSubject = Subject.create({ subjectId, subjectName }).fetch();
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Success",
                data: createSubject,
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

    getSubjects: (req, res) => {
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
            const getSubjects = Subject.find();
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Success",
                data: getSubjects,
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

