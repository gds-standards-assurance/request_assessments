const util = require('util')

var mlist = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];


/**
 * Get the weeks in the month grouped by array
 * TODO if the first day of the month is Saturday or Sunday, do some magic
*/
module.exports = function getDatesInMonth(mth, startdate) {

  var _mth = mlist[new Date(startdate).getMonth()];
  var __mth = mlist[mth];

  console.log("compare two dates: "+ _mth +" and " + __mth);
  var mthdate = new Date(2017,mth); //February, 2017
  if (_mth === __mth) {
    mthdate = new Date(startdate);
  }

  var weeksJson = {};
  var nxtmthdate = new Date(2017,mth+1);
  var ctr = 0;

  var weekday = mthdate.getDay();
  if (weekday === 0) {  //Sunday add 1
    mthdate.setDate(mthdate.getDate() + 1);
  }

  if (weekday === 6) {  //Saturday add 2
    mthdate.setDate(mthdate.getDate() + 2);
  }

  while (mthdate < nxtmthdate) {
  	var firstday = mthdate.getDay();
    weeksJson[++ctr] = getdays(mthdate, firstday);
    mthdate.setDate(mthdate.getDate() + (8-firstday));
  }

  return weeksJson;
}

/**
* return the days/dates of the week
* accepts the date for the week and also the start date
* (silly fix for the issue where in case start date is in current month)
*/
var getdays = function (_date, start){
	var tmpdate = new Date(_date);
  tmpdate.setDate(tmpdate.getDate() - 1); //to fix from zero problem
  var week = [];
  var c = 0;
	while (start < 5) { //only permit Mon-Thu days
  	tmpdate.setDate(tmpdate.getDate() + 1);
		week[c++] = tmpdate.toDateString();
    start++;
  }
  return week;
}
