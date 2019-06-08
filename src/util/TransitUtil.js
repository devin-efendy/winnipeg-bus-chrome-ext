/**
 * TransitUtil.js
 * author : Devin Efendy
 * purpose: Provides API call related functions to retrieve data
 *          from Open Data Web Serivce API. Also, this class will process all the
 *          information that the we get from every successful API call
 */
import openData from '../api/openData';

/**
 * To process bus JSON from API call to a custom JSON object that contain all necessary data
 * @param {Object} info RAW bus information as JSON Object
 * @param {number} number bus number
 * @param {Object} busData a JSON that contain all necessaryinformations
 *                         about a particular bus
 */
const getBusJSON = (info, number) => {
  let arrivalTimeScheduled = info.times.departure.scheduled;
  let arrivalTimeEstimated = info.times.departure.estimated;
  let wifi = false;

  // To check if the bus info has the arrival times for the bus
  // Otherwise use departure time
  if (info.times.arrival) {
    arrivalTimeScheduled = info.times.arrival.scheduled;
    arrivalTimeEstimated = info.times.arrival.estimated;
  } // if

  const name = info.variant.name;
  const destination = name.split('to ')[1];
  const cancelled = info.cancelled;
  const arrivalScheduled = parseTime(arrivalTimeScheduled);
  const arrivalEstimated = parseTime(arrivalTimeEstimated);
  const arrivalStatus = getArrivalStatus(arrivalScheduled, arrivalEstimated);
  const busData = info.bus;
  const key = info.key;

  if (busData) {
    wifi = busData.wifi;
  } // if

  return {
    key,
    number,
    name,
    destination,
    cancelled,
    arrivalStatus,
    wifi,
    arrivalScheduled,
    arrivalEstimated
  }; // return
}; // end - getBusJSON

/**
 * To parse an input time as string to an object containing the data of the time
 * @param {String} time 2019-05-20T15:02:00 => yyyy-mm--ddThh:mm:ss
 * @return {Object} object that contains parsed data of time
 */
const parseTime = time => {
  const dateTimePair = time.split('T');
  const dateBuffer = dateTimePair[0].split('-');
  const timeBuffer = dateTimePair[1].split(':');
  // const timeBuffer = dateTimePair[1];
  const data = {
    year: parseInt(dateBuffer[0]),
    month: parseInt(dateBuffer[1]),
    day: parseInt(dateBuffer[2]),
    hour: parseInt(timeBuffer[0]),
    minute: parseInt(timeBuffer[1]),
    second: parseInt(timeBuffer[2])
  };
  return data;
}; // end - parseTime

/** compareTime
 * Compare timeA and timeB, we prioritize by earliest arrival time
 * @param {Object} timeA parsed timeA
 * @param {Object} timeB parsed timeB
 * @param {Object} calcSec flag whether this function should consider comparing the seconds
 * @return 1 if timeA < timeB, 0 if they are equal, -1 if timeA > timeB
 */
const compareTime = (timeA, timeB, calcSec = true) => {
  const {
    year: yearA,
    month: monthA,
    day: dayA,
    hour: hourA,
    minute: minA,
    second: secA
  } = timeA;
  const {
    year: yearB,
    month: monthB,
    day: dayB,
    hour: hourB,
    minute: minB,
    second: secB
  } = timeB;
  let result = 1;

  // This is to compare the date: year > month > day
  if (yearA < yearB) {
    result = -1;
  } else if (yearA === yearB) {
    if (monthA < monthB) {
      result = -1;
    } else if (monthA === monthB) {
      if (dayA < dayB) {
        result = -1;
      } else if (dayA === dayB) {
        result = 0;
      }
    }
  }

  // If the arrival is earlier by a day then we don't need to compare the specific time
  // This is to compare the time: hour > minute > second
  if (result === 0) {
    result = 1;
    if (hourA < hourB) {
      result = -1;
    } else if (hourA === hourB) {
      if (minA < minB) {
        result = -1;
      } else if (minA === minB) {
        if (calcSec) {
          if (secA < secB) {
            result = -1;
          } else if (secA === secB) {
            result = 0;
          }
        } else {
          result = 0;
        }
      }
    }
  }

  return result;
}; // end - compareTime

/** getArrivalStatus
 * @summary To compare between scheduled and estimated time to determine if a particular
 *          bus is early, late, or on time
 * @param {Object} scheduled object that contains scheduled arrival/departure time
 * @param {Object} estimated object that contains estimated arrival/departure time
 */
const getArrivalStatus = (scheduled, estimated) => {
  let status = '';
  if (compareTime(scheduled, estimated, false) === 1) {
    status = 'early';
  } else if (compareTime(scheduled, estimated, false) === -1) {
    status = 'late';
  } else {
    status = 'OK';
  }
  return status;
}; // end - getArrivalStatus

class TransitUtil {
  /** getStops
   * @async
   * @static
   * @summary This static function is to perform an API call to look for nearby stops near the user
   *          or to look for stops that are related/similar to the user's search input.
   *          This function will return a promise.
   * @param {Object} latitude_longitude lat and long pair
   * @param {String} userInput user search input, defaulted to undefined
   * @return {Promise} A promise that use Open Data Web Services API call to search for the stops
   */
  static getStops = async ({ latitude, longitude }, userInput = undefined) => {
    // query will be defaulted to API call query that search for nearby stops
    // if the user does not provide any search input
    let query =
      '/stops.json?distance=500&lat=' +
      latitude +
      '&lon=' +
      longitude +
      '&api-key=FO8ZSABX3wyHFEo062j';

    // If the user DOES provide a search input, then we use different API call
    if (userInput) {
      query = `/stops:${userInput}.json?&lat=${latitude}&lon=${longitude}&distance=500&api-key=FO8ZSABX3wyHFEo062j`;
    } //if

    // return the promise
    return await openData(query);
  }; //end -getStops

  /** getRoute
   * @async
   * @static
   * @summary use API call to get the routes (all busses that go through this station)
   *          for a particular stops.
   * @param {Number} stopNumber the number of the stop that we will use to search for the routes
   * @return {Promise} A promise that use Open Data Web Services API call to search for the routes
   *                   of a particular stop with number stopNumber
   */
  static getRoute = async stopNumber => {
    return await openData.get(
      `/routes.json?stop=${stopNumber}?&api-key=FO8ZSABX3wyHFEo062j`
    ); // return
  }; // end -getRoute

  /** getSchedule
   * @async
   * @static
   * @summary use API call to get the schedule for a particular stop
   * @param {Number} stopNumber stop number that will be used to search for the schedule
   * @return {Promise} A promise that will return the schedule for a particular stop
   *                   if the API call is successful otherwise return an error message
   */
  static getSchedule = async stopNumber => {
    return await openData.get(
      `/stops/${stopNumber}/schedule.json?&api-key=FO8ZSABX3wyHFEo062j`
    ); //return
  }; // end -getSchedule

  /**
   * @static
   * @summary to parse the result of a successful API call of getSchedule into a
   *          easy to read JSON Object of busses.
   *          Also, the busses will be sorted by earliest
   *          arrival/departure time
   * @param {Object} data a JSON Object that we get after successful API call from
   *                      getSchedule. This Object will contain detailed information
   *                      about each ROUTES (e.g. 60,160,162).
   * @return {Array} an array of busses that already sorted by arrival/departure time
   */
  static parseSchedule = data => {
    const routesSchedule = data['stop-schedule']['route-schedules']; //get the schedules
    let scheduleList = []; // init empty list

    /**¡
     * * Algorithm Explanation:
     * For all routes from the data we take every busses that are in that route
     * and parse the data using getBusJSON to get the JSON Object of a
     * particular BUS. Then, we push that Bus JSON to our list.
     * after all routes have been processed we sort the array by the earliest
     * arrival/departure time.
     */

    routesSchedule.forEach(item => {
      const number = item.route.number;
      const scheduledStops = item['scheduled-stops'];

      scheduledStops.forEach(routeSchedule => {
        const busInfo = getBusJSON(routeSchedule, number);
        busInfo.coverage = item.route.coverage;
        scheduleList.push(busInfo);
      }); // end - scheduledStops.forEach
    }); // end - routesSchedule.forEach

    scheduleList.sort((a, b) => {
      return compareTime(a.arrivalEstimated, b.arrivalEstimated);
    }); // end - sort

    return scheduleList;
  }; // end - parseSchedule
} // end - class

export default TransitUtil;
