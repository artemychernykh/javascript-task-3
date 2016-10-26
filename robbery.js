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


function TempDate(strDate) {
    var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    var regEx = /(\S+) (\d+):(\d+)\+(\d)/g;
    var regDate = regEx.exec(strDate);
    this.year = 1970;
    this.month = 0;
    this.day = week.indexOf(regDate[1]) + 1;
    this.hour = Number(regDate[2]) - Number(regDate[4]);
    this.minute = Number(regDate[3]);
    this.second = 0;
}

function initGoodIntrv(bankHours) {
    var retIntrv = [];
    var days = ['ПН ', 'ВТ ', 'СР '];
    for (var i = 0; i < days.length; i ++) {

        var frm = new TempDate(days[i] + bankHours.from);
        var to = new TempDate(days[i] + bankHours.to);

        to = new Date(to.year, to.month, to.day, to.hour, to.minute);
        frm = new Date(frm.year, frm.month, frm.day, frm.hour, frm.minute);
        retIntrv.push({ a: frm, b: to });

    }

    return retIntrv;
}

function getValidShedule(gangSchedule) {
    var validGangShegule = [];
    var namesRobers = Object.getOwnPropertyNames(gangSchedule);
    for (var j = 0; j < namesRobers.length; j++) {
        for (var i = 0; i < gangSchedule[namesRobers[j]].length; i++) {
            var frm = new TempDate(gangSchedule[namesRobers[j]][i].from);
            var to = new TempDate(gangSchedule[namesRobers[j]][i].to);

            to = new Date(to.year, to.month, to.day, to.hour, to.minute);
            frm = new Date(frm.year, frm.month, frm.day, frm.hour, frm.minute);
            validGangShegule.push({ a: frm, b: to });
        }
    }

    return validGangShegule;
}

function inInterval(sheduleVal, goodIntrvVal) {

    return (sheduleVal.a < goodIntrvVal.b && sheduleVal.b > goodIntrvVal.a);
}

function fullInInterval(fr, to, goodIntrvVal) {

    return (to < goodIntrvVal.b && fr > goodIntrvVal.a);
}


function notFullInIntrv(fr, to, intervals, i) {
    if (fr <= intervals[i].a && to >= intervals[i].b) {
        intervals.splice(i, 1, { a: undefined, b: undefined });

        return intervals;
    }
    var fst;
    var scn;
    if (intervals[i].a > fr) {
        fst = to;
        scn = intervals[i].b;
    } else {
        fst = intervals[i].a;
        scn = fr;
    }
    intervals.splice(i, 1, { a: fst, b: scn });

    return intervals;
}

function delIntrv(fr, to, intervals, i) {
    if (!inInterval({ a: fr, b: to }, intervals[i])) {
        return intervals;
    }
    if (fullInInterval(fr, to, intervals[i])) {
        intervals.push({ a: to, b: intervals[i].b });
        intervals.splice(i, 1, { a: intervals[i].a, b: fr });

        return intervals;
    }

    return notFullInIntrv(fr, to, intervals, i);
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
        num = '0' + num;
    }

    return num;
}

exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var isExists = false;
    var goodTime;
    var timeZoneBank = Number(workingHours.from[6]);
    var validShedule = getValidShedule(schedule);
    var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    var goodIntrv = initGoodIntrv(workingHours);

    for (var i = 0; i < validShedule.length; i++) {
        for (var j = 0; j < goodIntrv.length; j++) {
            goodIntrv = delIntrv(validShedule[i].a, validShedule[i].b, goodIntrv, j);
        }
    }
    var indGoodTime = getGoodtime(goodIntrv, duration);
    if (indGoodTime !== -1) {
        isExists = true;
        goodTime = goodIntrv[indGoodTime].a;
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
            var returnableTemplate;
            if (!isExists) {
                return '';
            }
            returnableTemplate = template.replace('%HH',
                                                  addZeros((goodTime.getHours() + timeZoneBank)))
                                .replace('%MM', addZeros(goodTime.getMinutes()))
                                .replace('%DD', week[goodTime.getDate() - 1]);

            return returnableTemplate;
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
