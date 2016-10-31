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
var MS_IN_HOUR = 3600000;
function parseDate(strDate) {
    var regEx = /(\S+) (\d+):(\d+)\+(\d+)/g;
    var regDate = regEx.exec(strDate);

    return new Date(1970, 0, (WEEK.indexOf(regDate[1]) + 1),
                    (Number(regDate[2]) - Number(regDate[4])), Number(regDate[3]));
}

function initGoodInterval(bankHours) {
    var retIntrv = [];
    for (var i = 0; i < DAYS_ROBBERY.length; i ++) {

        var from = parseDate(DAYS_ROBBERY[i] + bankHours.from);
        var to = parseDate(DAYS_ROBBERY[i] + bankHours.to);
        retIntrv.push({ from: from, to: to });

    }

    return retIntrv;
}

function getFormattedSchedule(gangSchedule) {
    var formatGangSchegule = [];
    var namesRobbers = Object.keys(gangSchedule);
    namesRobbers.forEach(function (name) {
        gangSchedule[name].forEach(function (busyTime) {
            var from = parseDate(busyTime.from);
            var to = parseDate(busyTime.to);
            formatGangSchegule.push({ from: from, to: to });
        });
    });

    return formatGangSchegule;
}

function isInInterval(sheduleVal, goodIntrvVal) {
    return (sheduleVal.from <= goodIntrvVal.to && sheduleVal.to >= goodIntrvVal.from);
}

function isFullInInterval(from, to, goodIntrvVal) {
    return (to < goodIntrvVal.to && from > goodIntrvVal.from);
}

function notFullInIntrv(from, to, intervals, i) {
    if (from <= intervals[i].from && to >= intervals[i].to) {
        intervals.splice(i, 1, { from: intervals[i].from, to: intervals[i].to });

        return intervals;
    }
    var fst;
    var scn;
    if (intervals[i].from >= from) {
        fst = to;
        scn = intervals[i].to;
    } else {
        fst = intervals[i].from;
        scn = from;
    }
    intervals.splice(i, 1, { from: fst, to: scn });

    return intervals;
}

function delIntrv(from, to, intervals, i) {
    if (!isInInterval({ from: from, to: to }, intervals[i])) {
        return intervals;
    }
    if (isFullInInterval(from, to, intervals[i])) {
        intervals.push({ from: to, to: intervals[i].to });
        intervals.splice(i, 1, { from: intervals[i].from, to: from });

        return intervals;
    }

    return notFullInIntrv(from, to, intervals, i);
}

function getGoodTimeIndex(goodInterval, duration) {
    for (var i = 0; i < goodInterval.length; i++) {
        var durIntrv = (goodInterval[i].to - goodInterval[i].from) / 60000;
        if (durIntrv >= duration) {
            return i;
        }
    }

    return -1;
}

function addZeros(num) {
    if (num < 10) {
        num = '0' + num;
    }

    return String(num);
}

function sortOnA(a, b) {
    if (a.from > b.to) {
        return 1;
    }
    if (a.from < b.to) {
        return -1;
    }

    return 0;
}

function sortIntrv(interval) {

    return interval.sort(sortOnA);
}

exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var isExists = false;
    var goodTime;
    var timeZoneBank = Number(workingHours.from[6]);
    var formatSchedule = getFormattedSchedule(schedule);
    var goodInterval = initGoodInterval(workingHours);

    for (var i = 0; i < formatSchedule.length; i++) {
        for (var j = 0; j < goodInterval.length; j++) {
            goodInterval = delIntrv(formatSchedule[i].from, formatSchedule[i].to,
                                    goodInterval, j);
        }
    }
    goodInterval = sortIntrv(goodInterval);
    var indGoodTime = getGoodTimeIndex(goodInterval, duration);
    if (indGoodTime !== -1) {
        isExists = true;
        goodTime = new Date(Number(goodInterval[indGoodTime].from) + MS_IN_HOUR * timeZoneBank);
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

            return template.replace('%HH',
                                   addZeros(goodTime.getHours()))
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
