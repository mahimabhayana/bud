var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/study', function(req, res){
  res.render('study', {
    title: 'Study'
  });
});

module.exports = router;
