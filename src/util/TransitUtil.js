import openData from '../api/openData';

const ARGS = {
  API: `api-key=FO8ZSABX3wyHFEo062j`,
  walking: bool => `walking=${bool}`,
  distance: dist => `distance=${dist}`,
  maxResult: max => `max-results=${max}`
};

const getBusJSON = (info, number) => {
  let arrivalTimeScheduled = info.times.departure.scheduled;
  let arrivalTimeEstimated = info.times.departure.estimated;

  if (info.times.arrival) {
    arrivalTimeScheduled = info.times.arrival.scheduled;
    arrivalTimeEstimated = info.times.arrival.estimated;
  }

  const name = info.variant.name;
  const destination = name.split('to ')[1];
  const cancelled = info.cancelled;
  const arrivalScheduled = parseTime(arrivalTimeScheduled);
  const arrivalEstimated = parseTime(arrivalTimeEstimated);
  const arrivalStatus = getArrivalStatus(arrivalScheduled, arrivalEstimated);
  const busData = info.bus;
  const key = info.key;

  let wifi = false;
  if (busData) {
    wifi = busData.wifi;
  }

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
  };
};

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
};

/**
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
  if (yearA > yearB) {
    result = -1;
  } else if (yearA === yearB) {
    if (monthA > monthB) {
      result = -1;
    } else if (monthA === monthB) {
      if (dayA > dayB) {
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
};

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
};

class TransitUtil {
  static getStops = async ({ latitude, longitude }, userInput = undefined) => {
    let query =
      '/stops.json?distance=500&lat=' +
      latitude +
      '&lon=' +
      longitude +
      '&api-key=FO8ZSABX3wyHFEo062j';

    if (userInput) {
      query = `/stops:${userInput}.json?&lat=${latitude}&lon=${longitude}&distance=500&api-key=FO8ZSABX3wyHFEo062j`;
    }

    return await openData(query);
  };

  static getRoute = async stopNumber => {
    return await openData.get(
      `/routes.json?stop=${stopNumber}?&api-key=FO8ZSABX3wyHFEo062j`
    );
  };

  static getSchedule = async stopNumber => {
    return await openData.get(
      `/stops/${stopNumber}/schedule.json??&api-key=FO8ZSABX3wyHFEo062j`
    );
  };

  static parseSchedule = data => {
    const routesSchedule = data['stop-schedule']['route-schedules'];
    let scheduleList = [];

    routesSchedule.forEach(item => {
      const number = item.route.number;
      const scheduledStops = item['scheduled-stops'];

      scheduledStops.forEach(routeSchedule => {
        const busInfo = getBusJSON(routeSchedule, number);
        scheduleList.push(busInfo);
      });
    });

    scheduleList.sort((a, b) => {
      return compareTime(a.arrivalEstimated, b.arrivalEstimated);
    });

    return scheduleList;
  };
}

export default TransitUtil;
