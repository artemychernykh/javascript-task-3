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
 

function TempDate(strDate){
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

function initGoodIntrv(bankHours){
    var retIntrv = [];
    var days = ['ПН ', 'ВТ ', 'СР '];
    for (var i in days){

        var frm = new TempDate(days[i] + bankHours['from']);
        var to = new TempDate(days[i] + bankHours['to']);

        to = new Date(to.year, to.month, to.day, to.hour, to.minute);
        frm = new Date(frm.year, frm.month, frm.day, frm.hour, frm.minute);
        retIntrv.push({a: frm, b: to});
        
    }

    return retIntrv;
}

function getValidShedule(gangSchedule) {
    var validGangShegule = [];
    for (var person in gangSchedule) {
        for (var i = 0; i < gangSchedule[person].length; i++) {
            
            var frm = new TempDate(gangSchedule[person][i]['from']);
            var to = new TempDate(gangSchedule[person][i]['to']);
            
            to = new Date(to.year, to.month, to.day, to.hour, to.minute);
            frm = new Date(frm.year, frm.month, frm.day, frm.hour, frm.minute);
            validGangShegule.push({a:frm, b: to});
        }
    }
    return validGangShegule;
}

function delIntrv(fr, to, intervals, i) {
        if (to < intervals[i].b && fr > intervals[i].a) {
            
            intervals.push({a:to, b: intervals[i].b});
            intervals.splice(i, 1, {a:intervals[i].a, b: fr});
        }
        else {
            if (fr <= intervals[i].a && to >= intervals[i].b) {
                intervals.splice(i, 1, {a:undefined, b:undefined});
                return;
            }
            var fst;
            var scn;
            if (intervals[i].a > fr) {
                fst = to;
                scn = intervals[i].b;
            }
            else {
                
                fst = intervals[i].a;
                scn = fr;
            }
            intervals.splice(i, 1, {a:fst, b:scn});
            
        }
    return intervals;    
    
    
}


exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var isExists = false;
    var goodTime;
    var timeZoneBank = Number(workingHours.from[6]);
    var validShedule = getValidShedule(schedule);
    var numGoodTime = 0;
    var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
   
    var goodIntrv = initGoodIntrv(workingHours);
    for (var i = 0; i < validShedule.length; i++) {
        for (var j = 0; j < goodIntrv.length; j++) {
            if (validShedule[i].a < goodIntrv[j].b && validShedule[i].b > goodIntrv[j].a) {
                goodIntrv = delIntrv(validShedule[i].a, validShedule[i].b, goodIntrv, j);
            }
            
        }
    }
    for (var i = 0; i < goodIntrv.length; i++){
        var durIntrv = (goodIntrv[i].b - goodIntrv[i].a)/60000;
        if (durIntrv >= duration) {
            isExists = true;
            goodTime = goodIntrv[i].a;
            numGoodTime = i;
            break;
            
        }
       
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
            if (!isExists){
                return '';
            }
            returnableTemplate = template.replace('%HH', (goodTime.getHours() + timeZoneBank))
                                    .replace('%MM', goodTime.getMinutes())
                                    .replace('%DD', week[goodTime.getDate() - 1]);
            return returnableTemplate;
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            return false;
        }
    };
};
