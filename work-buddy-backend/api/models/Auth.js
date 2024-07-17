/**
 * Auth.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "user",
  attributes: {
    id: {
      type: 'string',
      required: true,
      unique: true,
      columnName: 'id',
    },
    userName: {
      type: 'string',
      required: true,
      columnType: 'varchar(5000)',
      columnName: 'userName',
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      columnType: 'varchar(1000)',
      columnName: 'email',
    },
    password: {
      type: 'string',
      required: true,
      columnName: 'password',
    },
    isLoggedIn: {
      type: 'boolean',
      required: true,
      columnName: 'isLoggedIn',
    },
    accessToken: {
      type: 'string',
      allowNull: true,
      columnType: 'text',
      columnName: 'accessToken',
    },

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};
