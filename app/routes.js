var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here
// Route index page
router.get('/start', function (req, res) {
  res.render('start')
})

router.get('/stage', function (req, res) {
  res.render('stage')
})

router.get('/pick-date', function (req, res) {
  res.render('pick-date')
})



module.exports = router
