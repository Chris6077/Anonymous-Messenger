/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let validId, validId2, replyId;
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create thread', function(done) {
        chai.request(server)
        .post('/api/threads/fcc')
        .send({text:'firstThread', delete_password:'password'})
        .end(function(err, res){
          assert.equal(res.status, 200);
        });
      });
    });
    
    suite('GET', function() {
      test('get threads', function(done) {
        chai.request(server)
        .post('/api/threads/fcc')
        .send({text:'secondThread', delete_password:'password'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
        chai.request(server)
        .get('/api/threads/fcc')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isBelow(res.body.length, 11);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'replies');
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          validId = res.body[0]._id;
          validId2 = res.body[1]._id;
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete thread with invalid password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: validId, delete_password: 'invalid'})
        .end(function(err, res){
          assert.equal(res.status, 403);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      test('delete thread with valid password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id:validId, delete_password:'password'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });   
    });
    
    suite('PUT', function() {
      test('report thread', function(done) {
        chai.request(server)
        .put('/api/threads/fcc')
        .send({report_id:validId2})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
    }); 
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('reply thread', function(done) {
        chai.request(server)
        .post('/api/replies/fcc')
        .send({thread_id: validId2, text:'informative reply', delete_password:'password'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
    });
    
    suite('GET', function() {
      test('get replies', function(done) {
        chai.request(server)
        .get('/api/replies/fcc')
        .query({thread_id: validId2})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.replies);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.equal(res.body.replies[0].text, 'informative reply');
          replyId = res.body.replies[0]._id;
          done();
        });
      });
    });
    
    suite('PUT', function() {
      test('report reply', function(done) {
        chai.request(server)
        .put('/api/threads/fcc')
        .send({thread_id: validId2 ,reply_id: replyId})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      test('delete reply with invalid password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: validId2 ,reply_id: replyId, delete_password: 'invalid'})
        .end(function(err, res){
          assert.equal(res.status, 403);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete reply with invalid thread', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: 'invalid' ,reply_id: replyId, delete_password: 'password'})
        .end(function(err, res){
          assert.equal(res.status, 403);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete reply with invalid reply', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: validId2 ,reply_id: 'invalid', delete_password: 'password'})
        .end(function(err, res){
          assert.equal(res.status, 403);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
      test('delete reply with valid password', function(done) {
        chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: validId2 ,reply_id: replyId, delete_password: 'password'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
    });
  });
});