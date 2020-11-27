var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

  res.json("Hello, I'm a server response.");

});

// =================================================

var Redis = require("ioredis");
// 环境变量支持
var addr = process.env.ENV == 'prd' ? "demo-redis" : "localhost";
var redisClient = new Redis(6379, addr);

// redis set
router.get('/set', function (req, res, next) {
  redisClient.set(req.query.key, req.query.val);
  res.json({
    success: true,
    action: 'set',
    data: {
      [req.query.key]: req.query.val
    }
  });
});

// redis get
router.get('/get', function (req, res, next) {
  redisClient.get(req.query.key, function (err, result) {
    if (err) {
      res.json({
        success: false,
        data: err
      });
    } else {
      res.json({
        success: true,
        action: 'get',
        data: {
          [req.query.key]: result
        }
      });
    }
  });
});

module.exports = router;