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
var THREE_DAYS = ['ПН ', 'ВТ ', 'СР '];


function toDate(strDate) {
    var regEx = /(\S+) (\d+):(\d+)\+(\d)/g;
    var regDate = regEx.exec(strDate);

    return new Date(1970, 0, (WEEK.indexOf(regDate[1]) + 1),
                    (Number(regDate[2]) - Number(regDate[4])), Number(regDate[3]));

}


function initGoodIntrv(bankHours) {
    var retIntrv = [];
    for (var i = 0; i < THREE_DAYS.length; i ++) {

        var from = toDate(THREE_DAYS[i] + bankHours.from);
        var to = toDate(THREE_DAYS[i] + bankHours.to);
        retIntrv.push({ a: from, b: to });

    }

    return retIntrv;
}


function getFormatSchedule(gangSchedule) {
    var formatGangSchegule = [];
    var namesRobbers = Object.keys(gangSchedule);
    namesRobbers.forEach(function (name) {
        gangSchedule[name].forEach(function (busyTime) {
            var from = toDate(busyTime.from);
            var to = toDate(busyTime.to);
            formatGangSchegule.push({ a: from, b: to });
        });
    });

    return formatGangSchegule;
}

function isInInterval(sheduleVal, goodIntrvVal) {
    return (sheduleVal.a <= goodIntrvVal.b && sheduleVal.b >= goodIntrvVal.a);
}

function isFullInInterval(from, to, goodIntrvVal) {
    return (to < goodIntrvVal.b && from > goodIntrvVal.a);
}


function notFullInIntrv(from, to, intervals, i) {
    if (from <= intervals[i].a && to >= intervals[i].b) {
        intervals.splice(i, 1, { a: intervals[i].a, b: intervals[i].a });

        return intervals;
    }
    var fst;
    var scn;
    if (intervals[i].a >= from) {
        fst = to;
        scn = intervals[i].b;
    } else {
        fst = intervals[i].a;
        scn = from;
    }
    intervals.splice(i, 1, { a: fst, b: scn });

    return intervals;
}

function delIntrv(from, to, intervals, i) {
    if (!isInInterval({ a: from, b: to }, intervals[i])) {
        return intervals;
    }
    if (isFullInInterval(from, to, intervals[i])) {
        intervals.push({ a: to, b: intervals[i].b });
        intervals.splice(i, 1, { a: intervals[i].a, b: from });

        return intervals;
    }

    return notFullInIntrv(from, to, intervals, i);
}


function getGoodtime(goodIntrv, duration) {
    for (var i = 0; i < goodIntrv.length; i++) {
        var durIntrv = (goodIntrv[i].b - goodIntrv[i].a) / 60000;
        if (durIntrv >= duration) {
            return i;
        }

    }

    return -1;

}


function addZeros(num) {
    if (num < 10) {
        num = '0' + num.toString();
    }

    return String(num);
}

function sortOnA(elema, elemb) {
    if (elema.a > elemb.a) {
        return 1;
    }
    if (elema.a < elemb.a) {
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
    var formatSchedule = getFormatSchedule(schedule);
    var goodIntrv = initGoodIntrv(workingHours);

    for (var i = 0; i < formatSchedule.length; i++) {
        for (var j = 0; j < goodIntrv.length; j++) {
            goodIntrv = delIntrv(formatSchedule[i].a, formatSchedule[i].b, goodIntrv, j);
        }
    }
    goodIntrv = sortIntrv(goodIntrv);
    var indGoodTime = getGoodtime(goodIntrv, duration);
    if (indGoodTime !== -1) {
        isExists = true;
        goodTime = new Date(Number(goodIntrv[indGoodTime].a) + 3600000 * timeZoneBank);
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
