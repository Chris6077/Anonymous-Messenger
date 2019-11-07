var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var CONN = process.env.CONN;

function dataHandler() {
  this.getReplies = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).find({_id: new ObjectId(req.query.thread_id)}, {reported: 0, delete_password: 0, "replies.delete_password": 0, "replies.reported": 0}).toArray((err, doc) => {
        res.status(200).json(doc[0]); 
      });
    });
  };
  
  this.newReply = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).findAndModify(
        {_id: new ObjectId(req.body.thread_id)},
        [],
        {
          $set: {bumped_on: new Date()},
          $push: { 
            replies: {
              _id: new ObjectId(),
              text: req.body.text,
              created_on: new Date(),
              reported: false,
              delete_password: req.body.delete_password,
            }
          }
        },
        (err, doc) => {
          //here
          doc.value === null ? res.status(403).send('incorrect password') : res.status(200).send('success');
        });
    });
    res.status(301).redirect("/b/" + req.params.board + "/" + req.body.thread_id);
  };
  
  this.updateReply = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          "replies._id": new ObjectId(req.body.reply_id)
        },
        [],
        {$set: {"replies.$.reported": true}},
        (err, doc) => {
          // here
          doc.value === null ? res.status(403).send('incorrect password') : res.status(200).send('success');
        });
    });
    res.status(200).send("success");
  };
  
  this.deleteReply = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          replies: { $elemMatch: { _id: new ObjectId(req.body.reply_id), delete_password: req.body.delete_password } },
        },
        [],
        { $set: { "replies.$.text": "deleted" } },
        (err, doc) => {
          doc.value === null ? res.status(403).send('incorrect password') : res.status(200).send('success');
        });
    });
  };
  
  this.getThreads = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).find(
        {},
        {
          reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0
        }
      ).sort({bumped_on: -1}).limit(10).toArray((err, docs) => {
        docs.forEach((doc) => {
          doc.replycount = doc.replies.length;
          if(doc.replies.length > 3) doc.replies = doc.replies.slice(-3);
        });
        res.status(200).json(docs);
      });
    });
  };
  
  this.newThread = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).insert(
        {
          text: req.body.text,
          created_on: new Date(),
          bumped_on: new Date(),
          reported: false,
          delete_password: req.body.delete_password,
          replies: []
        }, () => {
          res.status(301).redirect("/b/" + req.params.board + "/");
        }
      );
    });
  };
  
  this.updateThread = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).findAndModify(
        {_id: new ObjectId(req.body.report_id)},
        [],
        {$set: {reported: true}},
        (err, doc) => {
          //here
          doc.value === null ? res.status(403).send("invalid data") : res.status(200).send("success");
        }
      );
    });
    res.status(200).send("success");
  };
  
  this.deleteThread = (req, res) => {
    mongo.connect(CONN, (err, db) => {
      db.collection(req.params.board).findAndModify(
        {_id: new ObjectId(req.body.thread_id), delete_password: req.body.delete_password},
        [],
        {},
        {remove: true, new: false},
        (err, doc) => {
          doc.value === null ? res.status(403).send("incorrect password") : res.status(200).send("success");
        });      
    });
  };
}

module.exports = dataHandler;