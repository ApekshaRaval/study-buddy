module.exports = {
  tableName: 'notification',
  attributes: {
    notificationid: {
      type: 'string',
      columnType: 'uuid',
      required: true,
      unique: true,
    },
    message: {
      type: 'string',
      required: true,
    },
    senderid: {
      type: 'string',
      columnType: 'uuid',
      required: true,
    },
    receiverid: {
      type: 'ref',
      columnType: 'character varying[]',
    },
    seen: {
      type: 'boolean',
      defaultsTo: false,
    },
    createdat: {
      type: 'ref',
      columnType: 'timestamp',
      required: true,
    },
  },
};
