const moment = require('moment-weekdaysin');
const momentTz = require('moment-timezone');

const cleanObject = obj => {
    for (var propName in obj) {
      if ( obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
}

const applyNameFilter = (req, whereObject) => {
  const namefilterText = req.query.name;
  if (namefilterText) {
    whereObject.name =  { $like : `%${namefilterText}` };
  }
  return whereObject;
}

const applyVehicleRegistration = (req, whereObject) => {
  const regFilterText = _.toLower(req.query.reg_no);
  if (regFilterText) {
    whereObject.reg_no =  { $like : `%${regFilterText}` };
  }
  return whereObject;
}

const applyBusinessNameFilter = (req, whereObject) => {
  const businessNamefilterText = req.query.business_name;
  if (businessNamefilterText) {
    whereObject.name =  { $like : `%${businessNamefilterText}` };
  }
  return whereObject;
}

const addressObject = (parent)=> {
  return {
    country: parent.user_country,
    city: parent.user_city,
    street_address: parent.user_street_address,
    postal_code: parent.user_postal_code,
    lat_long: parent.user_lat_long,
  }
}

const setTimeZone = (dateToStore) => {
  const timeZone = 'Europe/London';
  const momentDateTz = momentTz.tz(dateToStore ,timeZone);
  return momentDateTz.utc().toDate().valueOf();
}

const weekDayInNumber = (day) => {
  let dayNumber = 0;
  switch(day) {
          case 'monday':
          dayNumber = 1;
              break;
          case 'tuesday':
          dayNumber = 2;
              break;
          case 'wednesday':
          dayNumber = 3;
              break;
          case 'thursady':
          dayNumber = 4;
              break;
          case 'friday':
          dayNumber = 5;
          break;
          case 'saturday':
          dayNumber = 6;
              break;
          case 'sunday':
          dayNumber = 7;
              break;
          default:
          dayNumber = 0;
        }
        return dayNumber;
}

const formatCalendarDate = (dateTime) => {
  return moment.utc(dateTime).format('LL')
}


module.exports = {
    cleanObject,
    applyNameFilter,
    applyVehicleRegistration,
    setTimeZone,
    applyBusinessNameFilter,
    addressObject,
    weekDayInNumber,
    formatCalendarDate,
};
