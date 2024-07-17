/**
 * Chat.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'chats',
  attributes: {
    messageId: {
      type: 'string',
      required: true,
    },
    message: {
      type: 'string',
      required: true,
    },
    senderId: {
      type: 'string',
      required: true,
    },
    receiverId: {
      type: 'string',
      required: true,
    },

    createdAt: {
      type: 'string',
      required: true,
    },
    updatedAt: {
      type: 'string',
      required: true,
    },
    seen: {
      type: 'boolean',
      required: true,
    }
  },
};
