/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { HTTP_STATUS_CODE } = sails.config.constants;
const { generateAuthToken } = sails.config.utils;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const path = require('path');
const SkipperDisk = require('skipper-disk');
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
                token VARCHAR(255),
                subjects VARCHAR[],
                standard VARCHAR[],
                "profilePicUrl" VARCHAR,
                "profilePicFd" VARCHAR
            )`;

            await sails.sendNativeQuery(createUserTable);

            const userAlreadyExistsQuery = `SELECT EXISTS(SELECT 1 FROM "user" WHERE email = $1) AS "exists"`;
            const existUser = await sails.sendNativeQuery(userAlreadyExistsQuery, [
                email,
            ]);

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
            const addUserData = `INSERT INTO "user" (id, "userName", email, password, "isLoggedIn", role, subjects, standard,token,"avatarUrl", "avatarFd") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
            const data = await sails.sendNativeQuery(addUserData, [
                id,
                userName,
                email,
                hashedPassword,
                false,
                role,
                null,
                null,
                null,
                null,
                null,
            ]);

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
            }

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
                const comparePassword = await bcrypt.compare(
                    password,
                    userData?.rows[0]?.password
                );
                if (comparePassword) {
                    const token = await generateAuthToken(ExistUser);
                    const isLoggedIn = true;
                    const updateLoginStatus = `UPDATE public."user" SET "token" = $1, "isLoggedIn" = $2 WHERE email = $3 RETURNING *`;
                    const data = await sails.sendNativeQuery(updateLoginStatus, [
                        token,
                        isLoggedIn,
                        email,
                    ]);
                    return res.status(HTTP_STATUS_CODE.OK).json({
                        status: HTTP_STATUS_CODE.OK,
                        errorCode: "SUC000",
                        message: "Login Successful",
                        data: data,
                        token: token,
                        error: "",
                    });
                } else {
                    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
                        status: HTTP_STATUS_CODE.UNAUTHORIZED,
                        errorCode: "ERR401",
                        message: "Invalid credentials",
                        data: null,
                        error: "",
                    });
                }
            }
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

    getActiveUser: async (req, res) => {
        const token = req?.headers?.authorization?.split(" ")[1];
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
        const token = req?.headers?.authorization?.split(" ")[1];
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
        const token = req?.headers?.authorization?.split(" ")[1];
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
        const token = req?.headers?.authorization?.split(" ")[1];
        const { subjects, id, standard } = req.body;

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

            if (!Array.isArray(subjects)) {
                return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
                    status: HTTP_STATUS_CODE.BAD_REQUEST,
                    errorCode: "ERR400",
                    message: "Subjects should be an array",
                    data: null,
                    error: "",
                });
            }

            const updateStudent = `UPDATE "user" SET "subjects" = $1 , "standard" = $2 WHERE "id" = $3 AND "isLoggedIn" = true RETURNING *`;
            const data = await sails.sendNativeQuery(updateStudent, [
                subjects,
                standard,
                id,
            ]);
            console.log("data: ", data);

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
            const subjects = `SELECT subjects, standard FROM public."user" WHERE "id" = $1 AND "isLoggedIn" = true`;
            const data = await sails.sendNativeQuery(subjects, [id]);
            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "Subjects Found",
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

    getUserDetail: async (req, res) => {

        try {
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

            const query = `SELECT * FROM public."user" WHERE "id" = $1 `;
            const data = await sails.sendNativeQuery(query, [id]);
            const user = data.rows[0];

            if (!user) {
                return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
                    status: HTTP_STATUS_CODE.NOT_FOUND,
                    errorCode: "ERR404",
                    message: "User not found!",
                    data: null,
                    error: "",
                });
            }

            // Add avatar URL if exists
            if (user.avatarFd) {
                const baseUrl = sails.config.custom.baseUrl;
                user.avatarUrl = `${baseUrl}/user/avatar/${id}`;
            }

            return res.status(HTTP_STATUS_CODE.OK).json({
                status: HTTP_STATUS_CODE.OK,
                errorCode: "SUC000",
                message: "User Found",
                data: user,
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


    uploadImage: async (req, res) => {
        const { id } = req.params;

        req.file('profilePicture').upload({
            // Don't allow the total upload size to exceed ~10MB
            maxBytes: 10000000,
            // Set the directory where files will be uploaded
            dirname: require('path').resolve(sails.config.appPath, './uploads')
        }, async function whenDone(err, uploadedFiles) {

            if (err) {
                return res.serverError(err);
            }

            // If no files were uploaded, respond with an appropriate message
            if (uploadedFiles.length === 0) {
                return res.badRequest('No file was uploaded');
            }
            var baseUrl = sails.config.custom.baseUrl;

            // Save the "fd" and the url where the avatar for a user can be accessed
            const updateProfilePic = `UPDATE public."user" SET "profilePicUrl" = $1, "profilePicFd" = $2 WHERE "id" = $3`;

            try {
                const data = await sails.sendNativeQuery(updateProfilePic, [`${baseUrl}/user/avatar/${id}`, uploadedFiles[0].fd, id]);
                console.log('data: ', data);

                // Return the information about the uploaded file(s)
                return res.json({
                    message: 'File uploaded successfully!',
                    files: uploadedFiles
                });
            } catch (dbErr) {
                return res.serverError(dbErr);
            }
        });
    },
    getProfile: async (req, res) => {
        try {
            const userId = req.param('id');
            console.log('Requested user ID:', userId);

            const user = await Auth.findOne({ id: userId });
            console.log('Found user:', user);

            if (!user) {
                console.log('User not found');
                return res.notFound({ error: 'User not found' });
            }

            // User has no avatar image uploaded
            if (!user.profilePicFd) {
                console.log('No profile picture found for this user');
                return res.notFound({ error: 'No profile picture found for this user' });
            }

            const fileAdapter = SkipperDisk();

            // Ensure the file path is correct
            const filePath = path.resolve(__dirname, '..', '..', 'uploads', user.profilePicFd.split('/').pop());
            console.log('Resolved file path:', filePath);

            // Set the filename to the same file as the user uploaded
            res.set("Content-disposition", `attachment; filename=${user.profilePicUrl.split('/').pop()}`);

            // Stream the file down
            fileAdapter.read(filePath)
                .on('error', function (err) {
                    console.error('File read error:', err); // Log error
                    return res.serverError(err);
                })
                .pipe(res);

        } catch (err) {
            console.error('Server error:', err); // Log error
            return res.serverError(err);
        }
    }

}
