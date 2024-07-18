/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { HTTP_STATUS_CODE } = sails.config.constants;
const { generateAuthToken } = sails.config.utils;
const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = {
    register: async (req, res) => {
        try {
            const { userName, email, password, role } = req.body;

            if (!userName || !email || !password || !role) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "Missing required fields",
                    data: null,
                    error: "",
                });
            }
            const createUserTable = `CREATE TABLE IF NOT EXISTS "user" (
                id VARCHAR(255) PRIMARY KEY,
                "userName" VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                "isLoggedIn" BOOLEAN NOT NULL,
                role VARCHAR(255) NOT NULL,
                token VARCHAR(255)

            )`;
            await sails.sendNativeQuery(createUserTable);

            const userAlreadyExistsQuery = `SELECT EXISTS(SELECT 1 FROM "user" WHERE email = $1) AS "exists"`;
            const existUser = await sails.sendNativeQuery(userAlreadyExistsQuery, [email]);

            if (existUser.rows[0].exists) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    status: HTTP_STATUS_CODE.BAD_REQUEST,
                    errorCode: "ERR400",
                    message: "User already exists!",
                    data: null,
                    error: "",
                });
            }

            const id = uuidv4();
            const hashedPassword = await bcrypt.hash(password, 10);
            const addUserData = `INSERT INTO "user" (id, "userName", email, password, "isLoggedIn", role, token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
            const data = await sails.sendNativeQuery(addUserData, [id, userName, email, hashedPassword, false, role, null]);

            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "User Registered Successfully",
                data: data.rows[0],
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

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "Missing required fields",
                    data: null,
                    error: "",
                });
            };

            const ExistUser = `SELECT * FROM public."user" WHERE email = $1`;
            const userData = await sails.sendNativeQuery(ExistUser, [email]);

            if (userData?.rowCount <= 0) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "User not exists!",
                    data: null,
                    error: "",
                });
            }
            if (userData?.rowCount > 0) {
                const comparePassword = await bcrypt.compare(password, userData?.rows[0]?.password);
                if (comparePassword) {
                    const token = await generateAuthToken(ExistUser)
                    const isLoggedIn = true
                    const updateLoginStatus = `UPDATE public."user" SET "token" = $1, "isLoggedIn" = $2 WHERE email = $3 RETURNING *`;
                    const data = await sails.sendNativeQuery(updateLoginStatus, [token, isLoggedIn, email]);
                    return res.status(HTTP_STATUS_CODE.OK).json({
                        status: HTTP_STATUS_CODE.OK,
                        errorCode: "SUC000",
                        message: "Login Successful",
                        data: data,
                        token: token,
                        error: "",
                    });
                }
                else {
                    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
                        status: HTTP_STATUS_CODE.UNAUTHORIZED,
                        errorCode: "ERR401",
                        message: "Invalid credentials",
                        data: null,
                        error: "",
                    });
                }
            }
        }
        catch (err) {
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

    getActiveUser: async (req, res) => {
        const token = req?.headers?.authorization?.split(' ')[1];
        try {
            const isValidUser = jwt.verify(token, process.env.JWT_SECRET);
            const activeUser = `SELECT * FROM public."user" WHERE "isLoggedIn" = true`;

            if (!activeUser || !isValidUser) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "User not found!",
                    data: null,
                    error: "",
                });
            }

            const data = await sails.sendNativeQuery(activeUser);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Active User",
                data: data.rows[0],
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

    logout: async (req, res) => {
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
            const updateLoginStatus = `UPDATE public."user" SET "isLoggedIn" = false , token = null WHERE "token" = $1 AND "isLoggedIn" = true RETURNING *`;
            const data = await sails.sendNativeQuery(updateLoginStatus, [token]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Logout Successful",
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

    getAllUsers: async (req, res) => {
        const token = req?.headers?.authorization?.split(' ')[1];
        const users = `SELECT * FROM public."user"`;
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
            const data = await sails.sendNativeQuery(users);
            console.log('data: ', data);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "All Users",
                data: data.rows,
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

    updateStudentSubjects: async (req, res) => {
        const token = req?.headers?.authorization?.split(' ')[1];
        const { subjects, studentId } = req.body;

        console.log('studentId: ', studentId);
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

            // Check if the column 'subjects' exists
            const checkColumn = `SELECT column_name
                                 FROM information_schema.columns
                                 WHERE table_name='user' AND column_name='subjects'`;
            const columnResult = await sails.sendNativeQuery(checkColumn);

            // If the 'subjects' column does not exist, add it
            if (columnResult.rows.length === 0) {
                const addColumn = `ALTER TABLE public."user" ADD COLUMN "subjects" TEXT`;
                await sails.sendNativeQuery(addColumn);
            }

            const updateStudent = `UPDATE public."user" SET "subjects" = $1 WHERE "id" = $2 AND "isLoggedIn" = true RETURNING *`;
            const data = await sails.sendNativeQuery(updateStudent, [subjects, studentId]);

            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Subjects Updated Successfully",
                data: data.rows[0],
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

    getSubject: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "Subjects not found!",
                    data: null,
                    error: "",
                });
            }
            const subjects = `SELECT subjects FROM public."user" WHERE "id" = $1 AND "isLoggedIn" = true`;
            const data = await sails.sendNativeQuery(subjects, [id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Subjects Found",
                data: data.rows[0],
                error: "",
            })
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

    getUserDetail: async (req, res) => {
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
            const { id } = req.params;
            if (!id) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "User not found!",
                    data: null,
                    error: "",
                });
            }
            const user = `SELECT * FROM public."user" WHERE "id" = $1 AND "isLoggedIn" = true`;
            const data = await sails.sendNativeQuery(user, [id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "User Found",
                data: data.rows[0],
                error: "",
            })
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
