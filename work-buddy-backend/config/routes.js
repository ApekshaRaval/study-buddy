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
}
const chatRouter = {
    'POST /api/message': 'ChatController.sendMessage',
    'GET /api/messages': 'ChatController.getMessages',
}

module.exports.routes = {

    ...AuthRouter,
    ...chatRouter

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
