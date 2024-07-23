/**
 * Session.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "session",
  attributes: {
    sessionId: {
      type: 'string',
      required: true,
    },
    sessionTitle: {
      type: 'string',
      required: true,
      columnType: 'varchar(5000)',
    },
    sessionDate: {
      type: 'string',
      required: true,
    },
    sessionContent: {
      type: 'string',
      columnType: 'varchar(5000)',
    },
    quizcontent: {
      type: 'ref',
      columnType: 'character varying[]',
    },
    sessionLink: {
      type: 'string',
      columnType: 'varchar(5000)',
    },
    teacherId: {
      type: 'string',
      required: true,
    },
    subject: {
      type: 'string',
      required: true,
    },
    sessionType: {
      type: 'string',
      required: true,
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

