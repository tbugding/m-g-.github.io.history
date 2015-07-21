/*
* common.js
*/

//$.ajax在ie8,ie9下跨域
;jQuery.support.cors = true;

//屏蔽console.log报错
;(!window.console && (window.console = {}) && (window.console.log = function(){}));

;(function($){

	//配置
	window.config =	{
		//本地
		//domain : 'http://10.10.24.19:8090/', //zhanhk
		//domain1 : 'http://192.168.18.56:8090/', //yanjb20
		//domain2 : 'http://10.10.24.31:8090/', //wupeng
		//domain3 : 'http://192.168.18.59:8090/', //wanliang
		//domain4 : 'http://10.10.24.200:8765/simple-user/', //修改密码-获取菜单-wupeng
		//uEditorSeverUrl : 'http://192.168.85.38:8020/ueditor/jsp/controller.jsp', //百度编辑器图片上传接口
		//opentsp : 'https://wedrive.mapbar.com/sendbox/opentsp',  //图片上传接口（公告预览图片、动效公告图片、背景乐）
		//root : 'http://localhost:63342/qujia/',  //根目录 (动效公告的图片控件的默认图片url前缀)

		//内网
		domain : 'http://192.168.85.38:8090/',
		domain1 : 'http://192.168.85.38:8090/',
		domain2 : 'http://192.168.85.38:8090/',
		domain3 : 'http://192.168.85.38:8090/',
        domain4 : 'http://10.10.24.200:8765/simple-user/',
        uEditorSeverUrl : 'http://192.168.85.38:8020/ueditor/jsp/controller.jsp',
		opentsp : 'https://wedrive.mapbar.com/sendbox/opentsp',
		root : 'http://192.168.85.38:8020/sgmw/',

		//外网
		//domain : 'https://wedrive.mapbar.com/sendbox/sgmwserver/',
		//domain1 : 'https://wedrive.mapbar.com/sendbox/sgmwserver/',
		//domain2 : 'https://wedrive.mapbar.com/sendbox/sgmwserver/',
		//domain3 : 'https://wedrive.mapbar.com/sendbox/sgmwserver/',
		//domain4 : 'https://wedrive.mapbar.com/sendbox/sgmuser/',
		//uEditorSeverUrl : 'https://wedrive.mapbar.com/sendbox/ueditor/jsp/controller.jsp',
		//opentsp : 'https://wedrive.mapbar.com/sendbox/opentsp',
		//root : 'https://wedrive.mapbar.com/sendbox/sgmw/',

		//文本编辑器路径
		uEditorUrl : 'vendor/ueditor/',

		//欢迎页
		defaultPage : 'view/default/default.html',

		//地图API
		mapAPI : 'http://open.mapbar.com/apidoc/free/mapi31.4.js',
		//mapAPI : 'http://api.mapbar.com/api/mapbard31.3.js',

		//导航
		nav : '',  //左侧导航数据 空：从接口获取，demo/nav2.json：本地数据

		//数据字典
		paramMap : {
			noticeStatus : [
				{name : '草稿箱',value : 0},
				{name : '审核中',value : 1},
				{name : '审核未通过',value : 4}
			],
			auditStatus : [
				{name : '待审核',value : 1},
				{name : '已发布',value : 3},
				{name : '已撤回',value : 5}
			],
			noticeType : [
				{name : '营销',value : 0},
				{name : '知识',value : 1},
				{name : '客服',value : 2},
				{name : '动效',value : 3}
			],
			nsType : [
				{name : '道路救援',value : 1},
				{name : '车辆诊断',value : 2}
			],
			sex : [
				{name : '男',value : 0},
				{name : '女',value : 1}
			],
			timeRange : [
				{name : '全部',value : 0},
				{name : '最近一周',value : 1},
				{name : '最近一个月',value : 2},
				{name : '最近三个月',value : 3},
				{name : '最近六个月',value : 4},
				{name : '最近一年',value : 5}
			]

		},

		//表单验证规则
		validationRules : {
			required : {
				tip : '此项为必填项'
			},
			email : {
				tip : '请输入正确的电子邮箱地址',
				reg : /^(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)$/i
			},
			phone : {
				tip : '请输入正确的手机号码',
				reg : /^1\d{10}$/
			},
			tel : {
				tip : '请输入正确的电话号码',
				//reg : /^((1\d{10})|((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/
				reg : /^((1\d{10})|((\d{3,4})-)?(\d{7,8})(-\d{1,4})?|(400)\d{7})$/
			},
			url : {
				tip : '请输入正确的网址',
				reg : /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/i
			},
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
			},
			number : {
				tip : '请输入数字',
				reg : /^\d+$/
			},
			postcode : {
				tip : '请输入正确的邮编',
				//reg : /^[1-9]\d{5}(?!\d)$/
				reg : /^\d{6}$/
			},
			color : {
				tip : '请输入正确的6位16进制颜色值',
				reg : /^[0-9a-f]{6}$/i
			},
			image : {
				tip : '请输入正确的图片地址',
				reg : /^https?:\/\/.*\.(jpg|png|gif)((\?|#).*)?$/i
			}
		}

	};

	//接口
	window.interface = {
		noticeStatistic: config.domain3 + 'noticeStatistic', //公告统计
		delNoticeInfo: config.domain + 'delNoticeInfo',  //删除公告
		auditNotice: config.domain + 'auditNotice',  //公告审核
		queryNoticeHistory: config.domain + 'queryNoticeHistory',  //查询公告审核历史
		queryVehicleOwnerGroup: config.domain3 + 'queryVehicleOwnerGroup', //查询用户分组
		groupsearch: config.domain3 + 'queryGroup',  //根据机构ID获取分组
		login: config.domain2 + 'sysLogin',		//登录
		applyNoticeAudit: config.domain + 'applyNoticeAudit',	//申请审核
		queryNotice: config.domain + 'queryNotice',  //查询公告
		addNoticeInfo: config.domain + 'addNoticeInfo',  //添加公告
		updateNoticeInfo: config.domain + 'updateNoticeInfo',  //修改公告
		cpadregister: config.domain3 + 'registerCpad',  //cpad注册
		updateCpad: config.domain3 + 'updateCpad',  //编辑cpad
		querycpad: config.domain3 + "queryCpad",	//cpad查询
		queryUnBindingCpad: config.domain3 + "queryUnBindingCpad",	//已绑定cpad查询
		cpaddelete: config.domain3 + "deleteCpad",	//cpad删除
		unbundlingCpad: config.domain3 + "unbundlingCpad",	//cpad解绑
		addVehicleOwner: config.domain3 + "addVehicleOwner",
		queryVehicleOwner: config.domain3 + "queryVehicleOwner",	//查询车主信息
		queryVehicleOwnerAndCpad: config.domain3 + "queryVehicleOwnerAndCpad",  //查询车主和cpad信息
		delVehicleOwner: config.domain3 + "deleteVehicleOwner",
		unbundlingVehicleOwner: config.domain3 + "unbundlingVehicleOwner",	//车主解绑
		updateVehicleOwnerGroup: config.domain3 + "updateVehicleOwnerGroup",//queryVehicleOwnerByPhone
		queryVehicleOwnerByPhone: config.domain3 + "queryVehicleOwnerByPhone",//通过手机查车主
		queryBindingCpad: config.domain3 + "queryBindingCpad",
		addGroup: config.domain3 + "addGroup",
		updateGroupName: config.domain3 + "updateGroupName",
		delGroup: config.domain3 + "delGroup",
		queryGroupVehicleCnt: config.domain3 + "queryGroupVehicleCnt",
		recallNotice: config.domain + "recallNotice",	//撤销公告
		queryRescue: config.domain2 + 'agencyQueryRescue',
		search: config.domain1 + "vc/do/search", //查询车况诊断列表
		view: config.domain1 + "vc/do/view", //预览车况诊断工单
		confirm: config.domain1 + "vc/do/confirm", //完成车况诊断
		find4sns: config.domain1 + "ns/find",  //获取通知设置
		set4sns: config.domain1 + "ns/set",		//修改通知设置
		delete4sns: config.domain1 + "ns/delete",	//删除通知设置
		resetPassword: config.domain4 + '/user/resetPassword',
        queryUsers:config.domain2 + 'queryUsers', //系统管理--账号管理列表
        delUser: config.domain2 + 'delUser',//系统管理--删除用户
        userDetail : config.domain2 + 'userDetail',  //获取当前行用户信息
        getMyMenus : config.domain4 + 'user/getMyMenus',//获取当前行用户菜单
        updateUser : config.domain2 + 'updateUser', //更新用户
        createUser : config.domain2 + 'createUser',//创建用户
        DataSearch : config.domain1 + '4s/search',//查询4S店数据接口
        get4sDetail : config.domain1 + '4s/get',//获取4S店详情接口
        delete4s : config.domain1 + '4s/delete',//删除4S店
        add4s : config.domain1 + '4s/add',//新增4S店
        update4s : config.domain1 + '4s/update',//修改4S店
        queryAdmin : config.domain2 + 'queryAdmin',//查询4S店管理员接口
        sendRescue : config.domain2 + 'sendRescue',//派工接口
        finishRescue : config.domain2 + 'agencyFinishRescue',//派工接口
        agencyRescueDetail : config.domain2 + 'agencyRescueDetail',//查询道路救援详情接口
        addUpkeepItem:config.domain3+'upkeep/addUpkeepItem',//创建保养项目
        getUpkeepItem:config.domain3+'upkeep/getUpkeepItem',//筛选查询保养项目列表
        queryUpkeepItem:config.domain3+'upkeep/queryUpkeepItem',//查询保养项目
        delUpkeepItem:config.domain3+'upkeep/delUpkeepItem',//删除保养项目
        queryUpkeep:config.domain3+'upkeep/queryUpkeep',//查询车型保养
        addUpkeep:config.domain3+'upkeep/addUpkeep',//保存车型保养
        queryUpkeepJob:config.domain3+'upkeep/queryUpkeepJob',//查询预约订单
        confirmUpkeepJob:config.domain3+"upkeep/confirmUpkeepJob",//确认或关闭工单
        getUpkeepJobRecord:config.domain3+"upkeep/getUpkeepJobRecord",//获取预约工单流程信息
        queryFeedbackList:config.domain3+"feedback/queryFeedback",//查询反馈列表
        agencyRescueDetail : config.domain2 + 'agencyRescueDetail',//查询道路救援详情接口
        queryNmqStatistics : config.domain + 'queryNmqStatistics',//问卷统计结果
        queryNmqPageData : config.domain + 'queryNmqPageData', //获取分页问答题问卷结果
        queryNmqStatisCount : config.domain + 'queryNmqStatisCount', //查询问卷数量统计详细
        findTitle : config.domain + 'feedback/findTitle',//查询用户反馈标题
        addQuestion : config.domain + 'feedback/addQuestion',//添加反馈问题
        getQuestion : config.domain + 'feedback/getQuestion',//获取反馈问题
        delOption : config.domain + 'feedback/delOption' // 删除问题

	};

	//工具
	window.common = {

		/*获取URL参数*/
		search : function (){
			var obj = {};
			var search = window.location.search.substring(1);
			var arr = search.split('&');
			for(var i=0; i<arr.length; i++){
				var n = arr[i].indexOf('=');
				obj[arr[i].substring(0,n)] = arr[i].substring(n+1);
			}
			return obj;
		},

		/*取n到m随机数*/
		rdn : function (n,m){
			return parseInt(Math.random()*(m-n+1)+n)
		},

		/*统一ajax返回数据类型*/
		data2json : function (data){
			if(typeof data == 'string'){
				return eval('('+data+')');
			}else{
				return data;
			}
		},

		//cookie操作
		addCookie : function (name,value,iDay){
			var oDate;

			if(iDay !== undefined){
				oDate = new Date();
				oDate.setDate(oDate.getDate()+iDay);
			}else{
				oDate = "";
			}

			document.cookie=name+'='+value+';path=/;expires='+oDate;
		},
		getCookie : function (name){
			var arr=document.cookie.split('; ');
			for(var i=0;i<arr.length;i++){
				var n = arr[i].indexOf('=');
				if(arr[i].substring(0,n)==name){
					return arr[i].substring(n+1);
				}
			}
			return '';
		},
		delCookie : function (name){
			common.addCookie(name,'',-1)
		},

		//补零
		zeroPadding : function (str,n){
			var arr = str.toString().split('');
			while(arr.length < n){
				arr.unshift('0');
			}
			return arr.join('');
		},

		//通过数据字典返回数据对应的名称
		mapParam : function(data,map){
			for(var i=0; i<map.length; i++){
				if(map[i].value === data){
					return map[i].name
				}
			}
		},

		//把时间戳解析为时间文本
		formatTime : function(n,type){
			var time = new Date(n-0);
			var year = time.getFullYear(),
				month = time.getMonth(),
				date = time.getDate(),
				day = time.getDay(),
				hours = time.getHours(),
				minutes = time.getMinutes(),
				seconds = time.getSeconds(),
				DAY = ['日','一','二','三','四','五','六'];
				//mSeconds = date.getMilliseconds();

			var rDate = year + '-' + common.zeroPadding(month+1,2) + '-' + common.zeroPadding(date,2) ;
			var rTime = common.zeroPadding(hours,2) + ':' + common.zeroPadding(minutes,2) + ':' + common.zeroPadding(seconds,2) ;

			if(type === 'date'){
				return rDate;
			}else if(type === 'time'){
				return rTime;
			}else if(type === 'day'){
				return DAY[day];
			}else{
				return rDate + ' ' + rTime;
			}
		},

		//把文本解析成时间戳
		parseTime : function (str){
			var _tmp = str.split(' ');
			var date = _tmp[0].split('-');
			var time = _tmp[1] ? _tmp[1].split(':') : [0,0,0];
			var obj = new Date();

			obj.setFullYear(date[0]);
			obj.setMonth(date[1] - 1);
			obj.setDate(date[2]);
			obj.setHours(time[0]);
			obj.setMinutes(time[1]);
			obj.setSeconds(time[2]);
			obj.setMilliseconds(0);

			return obj.getTime();
		},

		timerSlot : function(target){
			var data = [
				{name : '全部',value : '',checked:true},
				{name : '最近一周',value : 7},
				{name : '最近一个月',value : 30},
				{name : '最近三个月',value : 90},
				{name : '最近六个月',value : 180},
				{name : '最近一年',value : 365}
			];

			var date = new Date().getTime();

			for(var i=0; i<data.length; i++){
				data[i].value = formatterVal(data[i].value);
			}

			function formatterVal (n){
				if(n !== ''){
					return date - 1000*60*60*24*n + '-' + date;
				}else{
					return '-'
				}
			}

			var h = new ConditionPicker({
				wrap : target,
				data : data
			});

			return h;
		},

		//把cookie里的用户数据保存到全局变量global里
		getUserInfo : function(){
			global.userId = common.getCookie('userid');
			global.userName = common.getCookie('username');
			global.userMail = common.getCookie('usermail');
			global.token = common.getCookie('token');
			global.deptId = common.getCookie('deptId');
			global.domain = common.getCookie('domain');
			global.navaData = localStorage.navData;
		},

		//删除用户数据
		deleteUserInfo : function(){
			global.userId = common.delCookie('userid');
			global.userName = common.delCookie('username');
			global.userMail = common.delCookie('usermail');
			global.token = common.delCookie('token');
			global.deptId = common.delCookie('deptId');
			global.domain = common.delCookie('domain');
			global.navaData = null;
			delete localStorage.navData;
		},

		//封装的confirm
		confirm : function(){
			var arg1 = arguments[0],
				arg2 = arguments[1];

			if(typeof arg1 === 'object'){
				var title = arg1.title || '提示',
					content = arg1.content,
					onConfirm = typeof arg1.onConfirm === 'function' ? arg1.onConfirm : function(){},
					onCancel = typeof arg1.onCancel === 'function' ? arg1.onCancel : function(){};

			}else if(typeof arg1 === 'string'){
				var title = '提示',
					content = arg1,
					onConfirm = typeof arg2 === 'function' ? arg2 : function(){},
					onCancel = function(){};
			}

			var wrap =$('<div class="Dialog">' +
			'<div class="Dialog_header"><p>'+title+'</p></div>' +
			'<div class="Dialog_content">'+content+'</div>' +
			'<div class="Dialog_footer">' +
			'<a class="Dialog_btn Dialog_fl Dialog_btnHighLight" data-role="confirm-destroy" href="javascript:void(0);">确 认</a>' +
			'<a class="Dialog_btn Dialog_fr" data-role="destroy" href="javascript:void(0);">取 消</a>' +
			'</div>' +
			'</div>');

			new Dialog({
				wrap : wrap,
				target : $('body'),
				onConfirm : onConfirm,
				onHide : onCancel
			}).show();

		},

		//封装的alert
		alert : function(){
			if(typeof arguments[0] === 'object'){
				var title = arguments[0].title || '提示',
					content = arguments[0].content,
					onConfirm = arguments[0].onConfirm || function(){};

			}else if(typeof arguments[0] === 'string'){
				var title = '提示',
					content = arguments[0],
					onConfirm = function(){};

			}

			var wrap =$('<div class="Dialog">' +
			'<div class="Dialog_header"><p>'+title+'</p></div>' +
			'<div class="Dialog_content">'+content+'</div>' +
			'<div class="Dialog_footer">' +
			'<a class="Dialog_btn Dialog_bc Dialog_btnHighLight" data-role="confirm-destroy" href="javascript:void(0);">确 认</a>' +
			'</div>' +
			'</div>');

			new Dialog({
				wrap : wrap,
				target : $('body'),
				onConfirm : onConfirm
			}).show();

		},

		//计算年龄
		getAge : function (timestamp) {
			try {
				var bDay = new Date(timestamp);
				var now = new Date();
				var res = 0;

				var dDate = now.getDate() - bDay.getDate();
				var dMonth = now.getMonth() - bDay.getMonth();
				var dYear = now.getFullYear() - bDay.getFullYear();

				if(dMonth < 0){
					res = dYear - 1;
				}else if(dMonth === 0){
					if(dDate >= 0){
						res = dYear;
					}else{
						res = dYear - 1;
					}
				}else{
					res = dYear;
				}

				return res < 0 ? 0 : res;

			} catch (e) {
				return '';
			}
		},

		//把地区数据转换为地区字符串
		formatRegion : function(data,level){
			try {
				var city = data.city ? data.city : '';
				var province = data.province ? data.province : '';
				var district = data.district ? data.district : '';
				var level = level ? level : 3;

				var l2 = (function(){
					if(city === province){
						return city
					}else{
						return province + '省' + city + '市';
					}
				})();

				var res;

				if(level === 3){
					res =  l2 + district;
				}else if(level === 2){
					res = l2;
				}else if(level === 1){
					res = province;
				}else{
					res = '';
				}

				return res;

			} catch (e){
				return '';
			}

		},

		//通用的ajax返回错误提示框
		ajaxErrorAlert : function(e){
			var data = $.parseJSON(e.responseText);
			var msg = data.message;
			var reg = /userid|token/ig;
			if(data.resultCode === 400 && reg.test(msg)){
				common.confirm('请重新登录',function(){
					location.href = 'login.html';
				})
			}if(data.data && data.data.bmessage){
				common.alert(data.data.bmessage)
			}
		},

		uuid : function(){
			function S4() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			}
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},

		//数组有重复元素返回false
		isDiversifiedArray : function(arr){
			var length = arr.length;
			var flag = true;

			test(0,1);

			return flag;

			function test(thisIndex,nextIndex){

				if(nextIndex <= length && arr[thisIndex] === arr[nextIndex]){
					flag = false;
					return;
				}

				if(thisIndex < length){
					if(nextIndex >= length){
						thisIndex++;
						test(thisIndex,thisIndex + 1)
					}else{
						test(thisIndex,nextIndex + 1)
					}

				}
			}
		}

	};

})(jQuery);
