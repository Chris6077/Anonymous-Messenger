/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
let dataHandler = require('../controllers/dataHandler.js');

module.exports = function (app) {
  let handler = new dataHandler();
  app.route('/api/replies/:board')
    .get(handler.getReplies)
    .post(handler.newReply)
    .put(handler.updateReply)
    .delete(handler.deleteReply);
  
  app.route('/api/threads/:board')
    .get(handler.getThreads)
    .post(handler.newThread)
    .put(handler.updateThread)
    .delete(handler.deleteThread);
};