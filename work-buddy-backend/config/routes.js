/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */


const AuthRouter = {
    'POST /auth/login': 'AuthController.login',
    'POST /auth/register': 'AuthController.register',
    'GET /auth/user': 'AuthController.getActiveUser',
    'POST /auth/logout': 'AuthController.logout',
    'GET /users': 'AuthController.getAllUsers',
    'POST /update-subject': 'AuthController.updateStudentSubjects',
    'GET /get-subjects/:id': 'AuthController.getSubject',
    'GET /api/user-detail/:id': 'AuthController.getUserDetail',
    'POST /upload/image/:id': 'AuthController.uploadImage',
    'GET /get-profile/:id': 'AuthController.getProfile',
}
const chatRouter = {
    'POST /chat/send': 'ChatController.sendMessage',
    'GET /chat/message': 'ChatController.getMessages'
}
const sessionRouter = {
    'POST /api/create-session': 'SessionController.createSession',
    'GET /api/sessions/:id': 'SessionController.getAllSessions',
    'GET /api/teacher-sessions/:id': 'SessionController.getTeacherSessions',
    'GET /api/session/:id': 'SessionController.getSessionDetail',
    'Delete /api/delete-session/:id': 'SessionController.deleteSession',
}
const notificationRouter = {
    'POST /api/send-notification': 'NotificationController.sendNotification',
    'GET /api/get-notifications/:id': 'NotificationController.getNotifications',
    'PUT /api/update-notification/:id': 'NotificationController.updateNotification'
}
const subjectRouter = {
    'POST /api/create-subject': 'SubjectController.createSubject',
    'GET /api/get-subject/:id': 'SubjectController.getSubjectByUser',
}
module.exports.routes = {

    ...AuthRouter,
    ...chatRouter,
    ...sessionRouter,
    ...subjectRouter,
    ...notificationRouter

    /***************************************************************************
    *                                                                          *
    * Make the view located at `views/homepage.ejs` your home page.            *
    *                                                                          *
    * (Alternatively, remove this and add an `index.html` file in your         *
    * `assets` directory)                                                      *
    *                                                                          *
    ***************************************************************************/


    /***************************************************************************
    *                                                                          *
    * More custom routes here...                                               *
    * (See https://sailsjs.com/config/routes for examples.)                    *
    *                                                                          *
    * If a request to a URL doesn't match any of the routes in this file, it   *
    * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
    * not match any of those, it is matched against static assets.             *
    *                                                                          *
    ***************************************************************************/


};
