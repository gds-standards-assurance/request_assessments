var express = require('express')
const util = require('util')
var validator = require('validator');
var getDatesInMonth = require('../lib/helper.js')


// GET SECRETS
var dbUser = process.env.DB_USER
var dbPassword = process.env.DB_PASSWORD
var notifyKey = process.env.NOTIFY_KEY
var team_email = process.env.STANDARDS_TEAM_EMAIL


// CONNECT TO DB
var MongoClient = require('mongodb').MongoClient
var dbURL = 'mongodb://' + dbUser + ':' + dbPassword + '@ds155028.mlab.com:55028/gds-assessments'
var db
MongoClient.connect(dbURL, (err, database) => {
  if (err) return console.log(err)
  db = database
})


// INITIALISE NOTIFY
var NotifyClient = require('notifications-node-client').NotifyClient
var notifyClient = new NotifyClient(notifyKey)


// MONTH ARRAY
var mlist = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]


var router = express.Router()

var sess;
var data;

//TODO extract session checker

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here
// Route index page
router.get('/start', function (req, res) {
  res.render('start')
})

router.post('/stage', function(req, res) {
  sess = req.session
  var errors = {}

  if (sess.user_info) {

  } else {
    //create user_info session object
    //TODO think about dealing with concurrency
    var _data = {}

    sess.user_info = _data
  }

  var name = validator.trim(req.body.service_manager_name)
  var email = validator.trim(req.body.service_manager_email)
  var dept = validator.trim(req.body.service_manager_department)

  //check if any of these items is invalid
  if(!validator.isEmail(email)) {
    errors.email = "You have entered an invalid email address"
  }

  if(validator.isEmpty(name)) {
    errors.name = "Your name should not be empty"
  }

  if(validator.isEmpty(dept)) {
    errors.dept = "Your must provide your department or agency name"
  }

  data = { name: name, email: email, dept: dept }
  sess.user_info = data

  if (Object.keys(errors).length > 0) {

    console.log("\nErrors found in the submission: " + util.inspect(errors))
    res.render('start', {errors: errors, user_info: sess.user_info})

  } else {
    res.render('stage')
  }
})

router.post('/pick-date', function (req, res) {

  var errors = {}
  sess = req.session

  if (sess.user_info){
    var service_name = validator.trim(req.body.service_name)
    var assessment_stage = req.body.assessment_stage

    if(validator.isEmpty(service_name)) {
      errors.service_name = "Your must provide your service name"
    }

    if(!assessment_stage || typeof assessment_stage === 'undefined') {
      errors.assessment_stage = "Please choose the assessment stage"
    }

    sess.user_info.assessment_stage = assessment_stage
    sess.user_info.service_name = service_name

    if (Object.keys(errors).length > 0) {

      console.log("\nErrors found in the submission: " + util.inspect(errors))
      return res.render('stage', {errors: errors, user_info: sess.user_info})

    }

    var today = new Date();
    var earliestdate = new Date();
    earliestdate.setDate(today.getDate() + 28);

    var weekday = earliestdate.getDay();
    if (weekday === 0) {  //Sunday add 1
      earliestdate.setDate(earliestdate.getDate() + 1);
    }

    if (weekday === 6) {  //Saturday add 2
      earliestdate.setDate(earliestdate.getDate() + 2);
    }

    sess.user_info.earliestdate = earliestdate;
    var _month = earliestdate.getMonth();

    var months = [mlist[_month], mlist[_month + 1], mlist[_month + 2], mlist[_month + 3]]
    sess.user_info.months = months

    console.log('\n Session details' + util.inspect(sess))
    console.log('\n Months: ' + util.inspect(months))
    res.render('pick-date', {months: months})

  } else {
    //throw user back to the start page
    console.log('\nSession does not exist. go back to the start page')
    res.render('start', {error: 'We cannot find the details of your request. You will need to start again'})
  }

})

router.post('/pick-day', function(req, res){
  var errors = {}
  sess = req.session
  var _month, _monthnum, _startdate;

  if (sess.user_info){
    var assessment_month = req.body.assessment_month
    _month = assessment_month
    _monthnum = sess.user_info.month_index
    _startdate = sess.user_info.earliestdate
    sess.user_info.assessment_month = assessment_month

    if(!assessment_month || typeof assessment_month === 'undefined') {
      errors.assessment_month = "Please choose the month"
    }

    if (Object.keys(errors).length > 0) {

      console.log("\nErrors found in the submission: " + util.inspect(errors))
      return res.render('pick-date', {errors: errors, user_info: sess.user_info, months: sess.user_info.months})

    }

  } else {
    //throw user back to the start page
    console.log('\nSession does not exist. go back to the start page')
    return res.render('start', {error: 'We cannot find the details of your request. You will need to start again'})
  }

  var dates = getDatesInMonth(mlist.indexOf(_month), _startdate) //get dates in Month
  sess.user_info.tmpdates = dates
  console.log('\n dates in feb: ' + util.inspect(dates))

  console.log('\n Session details' + util.inspect(sess))
  res.render('pick-day', {month_picked: assessment_month, dates: dates})
})

router.post('/pick-time', function(req, res){
  var errors = {}
  sess = req.session

  if (sess.user_info){
    var assessment_date = req.body.assessment_date
    sess.user_info.assessment_date = assessment_date

    if(!assessment_date || typeof assessment_date === 'undefined') {
      errors.assessment_date = "Please choose the date"
    }

    if (Object.keys(errors).length > 0) {

      console.log("\nErrors found in the submission: " + util.inspect(errors))
      return res.render('pick-day', {errors: errors, user_info: sess.user_info, month_picked: sess.user_info.assessment_month, dates: sess.user_info.tmpdates})

    }

  } else {
    //throw user back to the start page
    console.log('\nSession does not exist. go back to the start page')
    return res.render('start', {error: 'We cannot find the details of your request. You will need to start again'})
  }

  console.log('\n Session details' + util.inspect(sess))
  res.render('pick-time', {picked_date: sess.user_info.assessment_date})
})

router.post('/summary', function(req, res) {
  var errors = {}
  sess = req.session

  if (sess.user_info){
    var assessment_time = req.body.assessment_time
    sess.user_info.assessment_time = assessment_time

    var briefing_deadline = new Date(sess.user_info.assessment_date)
    briefing_deadline.setDate(briefing_deadline.getDate() - 14)
    sess.user_info.briefing_deadline = briefing_deadline.toDateString()

    if(!assessment_time || typeof assessment_time === 'undefined') {
      errors.assessment_time = "Please choose the time"
    }

    if (Object.keys(errors).length > 0) {

      console.log("\nErrors found in the submission: " + util.inspect(errors))
      return res.render('pick-time', {errors: errors, picked_date: sess.user_info.assessment_date})

    }

  } else {
    //throw user back to the start page
    console.log('\nSession does not exist. go back to the start page')
    return res.render('start', {error: 'We cannot find the details of your request. You will need to start again'})
  }

  console.log('\n Session details' + util.inspect(sess))
  res.render('summary', {user_info: sess.user_info})
})

router.post('/finish', function(req, res){
  sess = req.session

  if (sess.user_info){
    //TODO submit the form into a database and send email via Notify
    var _userinfo = sess.user_info

    // LOG _userinfo
    console.log(_userinfo)

    // SAVE TO DATABASE
    db.collection('booking').save(_userinfo, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
    })

    // NOTIFY - USER
    notifyClient.sendEmail("22098707-7d16-453a-8e02-baecc466c2d5", _userinfo.email, {
      'service_name': _userinfo.service_name,
      'service_manager': _userinfo.name,
      'assessment_date': _userinfo.assessment_date,
      'service_stage': _userinfo.assessment_stage,
      'assessment_time': _userinfo.assessment_time,
      'briefing_deadline': _userinfo.briefing_deadline
    })

    // NOTIFY - SERVICE ASSURANCE TEAM
    notifyClient.sendEmail("22098707-7d16-453a-8e02-baecc466c2d5", team_email, {
      'service_name': _userinfo.service_name,
      'service_manager': _userinfo.name,
      'assessment_date': _userinfo.assessment_date,
      'service_stage': _userinfo.assessment_stage,
      'assessment_time': _userinfo.assessment_time,
      'briefing_deadline': _userinfo.briefing_deadline
    })

  } else {
    //throw user back to the start page
    console.log('\nSession does not exist. go back to the start page')
    return res.render('start', {error: 'We cannot find the details of your request. You will need to start again'})
  }

  res.render('complete', {user_info: sess.user_info, message: "Your request has been submitted."})
})


module.exports = router
