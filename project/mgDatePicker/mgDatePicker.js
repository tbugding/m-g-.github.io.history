/**
 * mgDatePicker jQuery日期选择插件
 * author: Mango
 * version: 0.1
 * github: https://github.com/M-G-/mgDatePicker
 * */
(function(window,$,undefined){

    function DatePicker (cfg){
        this._date = new Date();	//填充日历用的时间对象，只维护了年/月，没有维护日

        this.config = {
            type : '',  //date,time,date-time
            status : 0,	//选择日期模式0 | 选择年月模式1
            target : null,	//input框
            currentTarget : null,
            selectedDate : '',	//选中的日期
            reg : {
                date : {
                    tip : '请输入正确的日期（如：2015-01-30）',
                    reg : /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/
                },
                time : {
                    tip : '请输入正确的时间（如：18:30:00）',
                    reg : /^(([0-1]\d|2[0-3])(:[0-5]\d){2})$/
                },
                datetime : {
                    tip : '格式 2015-01-01 18:30:00',
                    reg : /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)\s(([0-1]\d|2[0-3])(:[0-5]\d){2})$/
                }
            }
        };

        this.current = {
            input : null,
            data : null
        };

        $.extend(this.config,cfg);

        this.dom = {
            wrap : null,		//日历容器
            dateWrap : null,	//日期容器
            dateTd : null,		//日td
            btnNext : null,		//下一月/年 按钮
            btnPrev : null,		//上一月/年 按钮
            textYear : null,	//头部年容器
            textMonth : null,	//头部月容器
            btnTit : null,		//选择年月按钮
            dateTable : null,	//日期容器 status=0显示
            monthList : null,	//月份容器 status=1显示
            btnConfirm : null,	//可能可去掉
            inputYear : null, 	//年份输入框
            timeWrap : null,	//时间容器
            hours : null,		//小时select
            minutes : null,		//分钟select
            seconds : null,		//秒select
            timeConfirm : null 	//确认时间
        };

        this.init();

    }

    DatePicker.prototype = {

        init : function(){
            var that = this;
            var dom = this.dom;
            var config = this.config;
            var timer;
            config.target = $('input[data-datepicker]');
            this.createBox();
            this.createTime();

            that.current.input = config.target.eq(0);

            config.target.on('focus',function(){
                that.resetStatus($(this));

            });

            config.target.on('blur',function(){
                clearTimeout(timer);

                timer = setTimeout(function(){
                    dom.wrap.hide();
                },200)
            });

            dom.wrap.on('click','.mgDatePicker_filled',function(){
                config.selectedDate = $(this).data('val');
                var type = that.current.data.type;

                dom.dateTd.removeClass('mgDatePicker_current');
                $(this).addClass('mgDatePicker_current');

                if(!type || type === 'date'){
                    that.current.input.val(config.selectedDate);
                    config.target.trigger('input');
                    dom.wrap.hide();
                }else{

                }

            });

            dom.timeConfirm.on('click',function(){
                var type = that.current.data.type;
                var time = that.getTime();

                if(type === 'time'){
                    that.current.input.val(time);

                }else if(type === 'date-time'){
                    that.current.input.val(that.config.selectedDate + ' ' +time);

                }
                dom.wrap.hide();
            });

            $('html').on('click',function(e){

                clearTimeout(timer);

                if(!$.contains(dom.wrap[0],e.target) && e.target !== dom.wrap[0] && e.target !== that.current.input[0]){
                    dom.wrap.hide();
                }
            });

            dom.btnTit.on('click',function(){
                dom.dateTable.hide();
                dom.monthList.show();
                dom.btnMonth.removeClass('active');
                dom.btnMonth.eq(that._date.getMonth()).addClass('active');
                config.status = 1;
            });

            dom.btnConfirm.on('click',function(){
                dom.dateTable.show();
                dom.monthList.hide();
                config.status = 0;
                that.fillDateTd();
            });

            dom.btnMonth.on('click',function(){
                var index = $(this).index();
                dom.btnMonth.removeClass('active');
                $(this).addClass('active');
                that._date.setMonth(index);
                dom.textMonth.text(index+1);
                dom.btnConfirm.trigger('click')
            });

            dom.btnNext.on('click',{isNext:true,that:this},this.slideDate);
            dom.btnPrev.on('click',{isNext:false,that:this},this.slideDate);

            dom.inputYear.on('input',function(){
                var val = parseInt($(this).val());
                if(val < 9999 && val > 0){
                    that._date.setFullYear(val);
                    dom.textYear.text(val)
                }
            });

        },
        getTime : function(){
            var time = [];
            time.push(this.dom.hours.val());
            time.push(this.dom.minutes.val());
            time.push(this.dom.seconds.val());

            return time.join(':');
        },
        createBox : function (){
            var that = this;
            var dom = this.dom;
            var config = this.config;

            dom.wrap = $('<div class="mgDatePicker"></div>');
            dom.dateWrap = $('<div></div>');
            dom.btnPrev = $('<a href="javascript:;" class="mgDatePicker_prev"></a>');
            dom.btnNext = $('<a href="javascript:;" class="mgDatePicker_next"></a>');

            var tbody='';
            for(var i=0; i<6; i++){
                tbody+='<tr><td></td><td></td><td></td><td></td><td></td><td class="mgDatePicker_orange"></td><td class="mgDatePicker_orange"></td></tr>'
            }
            dom.dateTable = $('<div class="mgDatePicker_box"><div class="mgDatePicker_tit"><span class="mgDatePicker_titBtn"><span class="mgDatePicker_year" contenteditable="true"></span>年<span class="mgDatePicker_month"></span>月</span></div><table class="mgDatePicker_table"><thead><tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th class="mgDatePicker_orange">六</th><th class="mgDatePicker_orange">日</th></tr></thead><tbody>'+tbody+'</tbody></table></div>')

            var monthList = $('<ul class="mgDatePicker_monthList"><li>一月</li><li>二月</li><li>三月</li><li>四月</li><li>五月</li><li>六月</li><li>七月</li><li>八月</li><li>九月</li><li>十月</li><li>十一月</li><li>十二月</li></ul>');
            var inputYear = $('<div class="mgDatePicker_inputYear"><input type="text" /> 年</div>');
            dom.btnConfirm = $('<div class="mgDatePicker_confirm" style="display:none">确定</div>');
            dom.monthList = $('<div class="mgDatePicker_box" style="display: none;"><div class="mgDatePicker_tit"><span class="mgDatePicker_year"></span>年</div></div>');
            dom.monthList.append(inputYear,monthList,dom.btnConfirm);

            dom.dateWrap.append(dom.btnPrev,dom.btnNext,dom.dateTable,dom.monthList);
            dom.wrap.append(dom.dateWrap);

            dom.dateTd = dom.wrap.find('.mgDatePicker_table tbody td');
            dom.textYear = dom.wrap.find('.mgDatePicker_year');
            dom.textMonth = dom.wrap.find('.mgDatePicker_month');
            dom.btnMonth = dom.wrap.find('.mgDatePicker_monthList li');
            dom.btnTit = dom.wrap.find('.mgDatePicker_titBtn');
            dom.inputYear = dom.wrap.find('.mgDatePicker_inputYear input');
        },
        createTime : function(){
            var dom = this.dom;

            var t24 = '';
            var t60 = '';
            var html = '';
            var tmp;
            for(var i=0; i<24; i++){
                tmp = this.zeroPadding(i,2);
                t24 += '<option value="'+tmp+'">'+tmp+'</option>'
            }
            for(var i=24; i<60; i++){
                tmp = this.zeroPadding(i,2);
                t60 += '<option value="'+tmp+'">'+tmp+'</option>'
            }

            html = '<div class="mgDatePicker_timeWrap"><select class="mgDatePicker_hours">'+t24+'</select> : <select class="mgDatePicker_minutes">'+t24+t60+'</select> : <select class="mgDatePicker_seconds">'+t24+t60+'</select> <a class="mgDatePicker_timeConfirm" href="javascript:void(0);">确定</a></div>'
            $wrap = $(html);
            dom.timeWrap = $wrap;
            dom.hours = $wrap.find('.mgDatePicker_hours');
            dom.minutes = $wrap.find('.mgDatePicker_minutes');
            dom.seconds = $wrap.find('.mgDatePicker_seconds');
            dom.timeConfirm = $wrap.find('.mgDatePicker_timeConfirm');
            dom.wrap.append($wrap);
        },
        resetStatus : function(current){
            var that = this;
            var config = this.config;
            var dom = this.dom;

            this.getCurrentData(current);
            var val = $.trim(current.val());
            var type = this.current.data.type;

            if(!type || type === 'date'){

                formatDate(val);


                config.status = 0;
                dom.dateTable.show();
                dom.monthList.hide();
                dom.dateWrap.show();
                dom.timeWrap.hide();

            }else if(type === 'time'){

                formatTime(val);

                dom.dateWrap.hide();
                dom.timeWrap.show();

            }else if(type === 'date-time'){

                formatAll(val);

                config.status = 0;
                dom.dateTable.show();
                dom.monthList.hide();
                dom.dateWrap.show();
                dom.timeWrap.show();

            }

            this.setOffset(current);
            dom.wrap.appendTo(current.offsetParent());
            dom.wrap.show();

            function formatTime(str){
                if(config.reg.time.reg.test(str)){
                    var time = str.split(':');

                    dom.hours.children().eq(time[0]-0).prop('selected',true);
                    dom.minutes.children().eq(time[1]-0).prop('selected',true);
                    dom.seconds.children().eq(time[3]-0).prop('selected',true);
                }else{
                    dom.hours.children().eq(0).prop('selected',true);
                    dom.minutes.children().eq(0).prop('selected',true);
                    dom.seconds.children().eq(0).prop('selected',true);
                }
            }

            function formatDate(str){
                if(config.reg.date.reg.test(str)){
                    config.selectedDate = str;
                    var arr = str.split('-');
                    that._date = new Date(arr[0]-0,arr[1]-1,arr[2]-0);
                    that.fillDateTd(arr[2]-0);
                }else{
                    that._date = new Date();
                    config.selectedDate = that._date.getFullYear() + '-' + that.zeroPadding(that._date.getMonth()+1,2) + '-' + that.zeroPadding(that._date.getDate(),2);
                    that.fillDateTd();
                }
            }

            function formatAll(str){

                var arr = str.split(' ');
                var d = false;
                var t = false;

                if(config.reg.datetime.reg.test(str)){

                    formatDate(arr[0]);
                    formatTime(arr[1]);

                }else{

                    for(var i=0; i<arr.length; i++){

                        if(config.reg.date.reg.test(arr[i])){
                            formatDate(arr[i]);
                            d = true;
                        }else if(config.reg.time.reg.test(arr[i])){
                            formatTime(arr[i]);
                            t = true;
                        }
                    }

                    !d && formatDate();
                    !t && formatTime();
                }
            }

        },
        slideDate : function (e){
            var that = e.data.that;
            var config = that.config;
            var dom = that.dom;


            if(config.status === 0){
                if(e.data.isNext){
                    that._date.setMonth(that._date.getMonth()+1);
                }else{
                    that._date.setMonth(that._date.getMonth()-1);
                }

            }else if(config.status === 1){
                if(e.data.isNext){
                    that._date.setFullYear(that._date.getFullYear()+1);
                }else{
                    that._date.setFullYear(that._date.getFullYear()-1);
                }
            }

            that.fillDateTd();

        },
        setOffset : function(){
            var current = this.current;
            var target = current.input;
            var offset = target.offset();

            var offsetParent = target.offsetParent();
            offset.top -= offsetParent.offset().top-target.height()-3;
            offset.left -= offsetParent.offset().left;

            var top = parseInt(current.data.top);
            top = isNaN(top) ? 0 : top;
            var left = parseInt(current.data.left);
            left = isNaN(left) ? 0 : left;

            this.dom.wrap.css({
                top : offset.top + top,
                left : offset.left + left
            })
        },
        getCurrentData : function(target){
            this.current.input = target;
            var dataStr = target.data('datepicker');
            this.current.data = {};
            if(dataStr){
                var data = target.data('datepicker').split(',');
                var tmp;
                for(var i=0; i<data.length; i++){
                    tmp = data[i].split(':');
                    this.current.data[tmp[0]] =  tmp[1];
                }
            }
        },
        daysTomonth : function (oDate){ //本月有多少天
            oDate.setMonth(oDate.getMonth()+1,1);
            oDate.setDate(0);
            return oDate.getDate()
        },
        dayFirstday : function (oDate){  //本月第一天是星期几
            oDate.setDate(1);
            return oDate.getDay() === 0 ? 7 : oDate.getDay();
        },
        fillDateTd :function (currentDay){
            var that = this;
            var dom = this.dom;
            var config = this.config;
            var current = this.current;

            var oDate = this._date;
            var n = this.daysTomonth(oDate);
            var i = 0; //当前循环
            var blank = this.dayFirstday(oDate) - 1;
            var year = oDate.getFullYear();
            var month = oDate.getMonth();
            var now = new Date();
            var _date = new Date(year,month,i+1);
            var fillClass = function(){
                _date.setDate(i+1);
                var res = 'mgDatePicker_filled';

                if(current.data.to){
                    var to = (function(){
                        if(current.data.to === 'now'){
                            return now;
                        }else{
                            var arr = current.data.to.split('-');
                            return new Date(arr[0],arr[1]-1,arr[2]);
                        }
                    })();
                    //_date.setDate(i+1);
                    if(_date > to){
                        res = 'mgDatePicker_disabled';
                    }
                }

                if(current.data.from){

                    var _from = (function(){
                        if(current.data.from === 'now'){
                            return now.getTime()-1000*60*60*24;
                        }else{
                            var arr2 = current.data.from.split('-');
                            return new Date(arr2[0],arr2[1]-1,arr2[2]);
                        }
                    })();
                    if(_date < _from){
                        res = 'mgDatePicker_disabled';
                    }
                }

                return res;
            };

            dom.dateTd.empty().removeClass('mgDatePicker_filled mgDatePicker_today mgDatePicker_current mgDatePicker_disabled');

            for(i=0; i<n; i++){
                dom.dateTd.eq(i+blank).data('val',year+'-'+that.zeroPadding(month+1,2)+'-'+that.zeroPadding((i+1),2)).text(i+1).addClass(fillClass);
            }

            if(year === now.getFullYear() && month === now.getMonth()){
                dom.dateTd.each(function(){
                    if($(this).text() == now.getDate()){
                        $(this).addClass('mgDatePicker_today');
                    }
                })
            }

            dom.textYear.text(this._date.getFullYear());
            dom.inputYear.val(this._date.getFullYear());
            dom.textMonth.text(this._date.getMonth()+1);
            if(currentDay){
                dom.dateTd.filter('.mgDatePicker_filled').eq(currentDay-1).addClass('mgDatePicker_current');
            }
        },
        zeroPadding : function (str,n){
            var arr = str.toString().split('');
            while(arr.length < n){
                arr.unshift('0');
            }
            return arr.join('');
        },
        destroy : function(){

            for(name in this.dom){
                this.dom[name] = null;
            }

            for(name in this.config){
                this.config[name] = null;
            }

            for(name in this.current){
                this.current[name] = null;
            }

            this.config = null;
            this.dom = null;
            this.current = null;

            this.destroy = function(){};
        }

    };

    window.mgDatePicker = window.mgDatePicker || DatePicker;

})(window,jQuery);