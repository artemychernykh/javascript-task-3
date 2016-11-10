'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = false;

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */

var WEEK = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
var DAYS_ROBBERY = ['ПН ', 'ВТ ', 'СР '];
var MS_IN_MINUTE = 60000;
var MS_IN_HOUR = MS_IN_MINUTE * 60;

function parseDate(strDate) {
    var regEx = /(\S+) (\d+):(\d+)\+(\d+)/g;
    var regDate = regEx.exec(strDate);

    return new Date(1970, 0, (WEEK.indexOf(regDate[1]) + 1),
                    (Number(regDate[2]) - Number(regDate[4])), Number(regDate[3]));
}

function initappropriateIntervals(bankHours) {
    var returnableInterval = [];
    for (var i = 0; i < DAYS_ROBBERY.length; i ++) {
        var from = parseDate(DAYS_ROBBERY[i] + bankHours.from);
        var to = parseDate(DAYS_ROBBERY[i] + bankHours.to);
        returnableInterval.push({ from: from, to: to });
    }

    return returnableInterval;
}

function getFormattedSchedule(gangSchedule) {
    var formatGangSchedule = [];
    var namesRobbers = Object.keys(gangSchedule);
    namesRobbers.forEach(function (name) {
        gangSchedule[name].forEach(function (busyTime) {
            var from = parseDate(busyTime.from);
            var to = parseDate(busyTime.to);
            formatGangSchedule.push({ from: from, to: to });
        });
    });

    return formatGangSchedule;
}

function isInInterval(sheduleValue, goodIntrvVal) {
    return (sheduleValue.from <= goodIntrvVal.to && sheduleValue.to >= goodIntrvVal.from);
}

function isFullInInterval(sheduleValue, goodIntrvVal) {
    return (sheduleValue.to < goodIntrvVal.to && sheduleValue.from > goodIntrvVal.from);
}

function changeInterval(sheduleValue, intervals, i) {
    if (!isInInterval(sheduleValue, intervals[i])) {
        return intervals;
    }
    if (isFullInInterval(sheduleValue, intervals[i])) {
        intervals.push({ from: sheduleValue.to, to: intervals[i].to });
        intervals.splice(i, 1, { from: intervals[i].from, to: sheduleValue.from });

        return intervals;
    }

    return continueChangeInterval(sheduleValue, intervals, i);
}

function continueChangeInterval(sheduleValue, intervals, i) {
    if (sheduleValue.from <= intervals[i].from && sheduleValue.to >= intervals[i].to) {
        intervals.splice(i, 1, { from: intervals[i].from, to: intervals[i].to });

        return intervals;
    }
    var startTime = intervals[i].from;
    var endTime = sheduleValue.from;
    if (intervals[i].from >= sheduleValue.from) {
        startTime = sheduleValue.to;
        endTime = intervals[i].to;
    }
    intervals.splice(i, 1, { from: startTime, to: endTime });

    return intervals;
}

function getGoodTimeIndex(appropriateIntervals, duration) {
    for (var i = 0; i < appropriateIntervals.length; i++) {
        var durIntrv = (appropriateIntervals[i].to - appropriateIntervals[i].from) / MS_IN_MINUTE;
        if (durIntrv >= duration) {
            return i;
        }
    }

    return -1;
}

function addZeros(num) {

    return num < 10 ? String('0' + num) : String(num);
}

function sortOnFrom(a, b) {
    return a.from - a.from;
}

function makeInterval(appropriateIntervals, formatSchedule) {
    for (var i = 0; i < formatSchedule.length; i++) {
        for (var j = 0; j < appropriateIntervals.length; j++) {
            appropriateIntervals = changeInterval(formatSchedule[i],
                                       appropriateIntervals, j);
        }
    }

    return appropriateIntervals;
}

exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var timeZoneBank = Number(workingHours.from.substr(6));
    var formatSchedule = getFormattedSchedule(schedule);
    var appropriateIntervals = initappropriateIntervals(workingHours);
    appropriateIntervals = makeInterval(appropriateIntervals, formatSchedule);
    appropriateIntervals.sort(sortOnFrom);
    var indGoodTime = getGoodTimeIndex(appropriateIntervals, duration);
    var isExists = false;
    var goodTime;
    if (indGoodTime !== -1) {
        isExists = true;
        goodTime = new Date(Number(appropriateIntervals[indGoodTime].from) +
            MS_IN_HOUR * timeZoneBank);
    }

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return isExists;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (!isExists) {
                return '';
            }

            return template
                    .replace('%HH', addZeros(goodTime.getHours()))
                    .replace('%MM', addZeros(goodTime.getMinutes()))
                    .replace('%DD', WEEK[goodTime.getDate() - 1]);
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            return isExists;
        }
    };
};
