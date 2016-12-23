// console.log(divvyMonths(mthdate));

/**
 * Get the weeks in the month grouped by array
 * TODO if the first day of the month is Saturday or Sunday, do some magic
*/
module.exports = function getDatesInMonth(mth) {
  var mthdate = new Date(2017,mth); //February, 2017
  var weeks = [];
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
		weeks[ctr++] = getdays(mthdate, firstday);
    mthdate.setDate(mthdate.getDate() + (8-firstday));
  }
  return weeks;
}


var getdays = function (_date, start){
	var tmpdate = new Date(_date);
  tmpdate.setDate(tmpdate.getDate() - 1); //to fix from zero problem
  var week = [];
  var c = 0;
	while (start < 6) {
  	tmpdate.setDate(tmpdate.getDate() + 1);
    //console.log('tmpdate '+ c + ' = ' + tmpdate);
		week[c++] = tmpdate.toDateString();
    start++;
  }
  return week;
}
