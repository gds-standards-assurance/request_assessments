// console.log(divvyMonths(mthdate));

module.exports = function getDatesInMonth(mth) {
  var mthdate = new Date(2017,mth); //February, 2017
  var weeks = [];

  var nxtmthdate = new Date(2017,mth+1);
  var ctr = 0;
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
