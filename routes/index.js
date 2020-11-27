var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.json("Hello, I'm a server response.");
  
});

module.exports = router;
