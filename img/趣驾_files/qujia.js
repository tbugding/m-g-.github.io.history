/*qujia.js*/

//Table 数据表格 (依赖: Paging, Ajax)
(function(window,$,undefined){
	var html = '<div data-role="wrap" >' +
		'		<div class="Table_wrap">' +
		'			<table class="Table" border="1">' +
		'				<thead><tr data-role="header"></tr></thead>' +
		'				<tbody data-role="body"></tbody>' +
		'			</table>' +
		'		</div >' +
		'	<div class="Table_toolbar" data-role="toolbar">' +
		'		<div data-role="btnGroup"></div>' +
		'		<div data-role="paging"></div>' +
		'	</div>' +
		'</div>';

	var sortHTML = '<span class="Table_sorters">' +
		'<i class="Table_sorters_up" data-role="sortUp">升序</i>' +
		'<i class="Table_sorters_down" data-role="sortDown">降序</i>' +
		'</span>';

	var checkAllHTML = '<th class="Table_checkbox"><input type="checkbox" data-role="checkAll"/></th>';

	function Table (cfg){
		this.config = {
			target : $('body'),  //目标容器
			data : null,  //从接口请求到的数据
			//width : 'auto',
			//style : null,
			url : '',	//接口url
			rowsName : 'rows',
			totalPageName : 'totalPage',
			rows : [],
			param : null, //查询参数
			oldParam : null, //上次load()的参数
			currentPage : 0,  //当前页
			totalPage : 1,	//总页数
			hasChecker : false, //是否有选择框
			hasPaging : false,  //是否有翻页
			//hasToolbtns : false,  //是否有批量按钮
			toolBtns : [], //批量按钮
			columns : [], //列配置
			field : {}, //字段列
			noField :{}, //无字段属性的列
			//sortName : '',
			sortType : 'up',
			isSingleSelect : false, //是否多选
			checked : [], //被选行
			paging : null, //分页
			isLoading : false,  //是否在加载数据
			onLoaded : function(){},
			onLoadError : function(){},
			event : null,	//事件参数
			eventFormatter : {} //事件数据
		};

		$.extend(this.config,cfg);

		this.dom = {
			wrap : null,  //容器
			header : null,	//头部
			sorter : null,	//排序按钮
			columnTitle : null,	//列标题th
			body : null, //tbody
			toolbar : null,	//工具栏
			btnGroupWrap : null,	//按钮组容器
			pagingWrap : null,	//分页容器
			btnGroup : [],	//批量操作按钮组
			rows : [],	//行
			checkAll : null, //全选、全部选checkbox
			checker : null
		};

		this.init();



	}

	Table.prototype = {
		getRows : function(){
			var config = this.config;
			var data = config.data;

			var rowsName = config.rowsName.split('.');

			for(var i=0,n; n=rowsName[i]; i++){
				if(typeof data[n] === 'object'){
					data = data[n];
				}else{
					data = [];
					break;
				}

			}
			console.log(data)
			this.config.rows = data;
		},
		getTotalPage : function(){
			var config = this.config;
			var data = config.data;

			var totalPageName = config.totalPageName.split('.');

			for(var i=0; i<totalPageName.length; i++){
				if(i === totalPageName.length){
					if(typeof data[totalPageName[i]] !== 'number'){
						data = 1 ;
						break;
					}
				}else{
					if(typeof data[totalPageName[i]] === 'object'){
						data = data[totalPageName[i]];
					}else{
						data = 1 ;
						break;
					}
				}
			}

			console.log(data)

			this.config.totalPages = data;
		},

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			dom.wrap = $(html);
			dom.wrap.appendTo(config.target);

			dom.header = dom.wrap.find('[data-role=header]');
			dom.body = dom.wrap.find('[data-role=body]');
			dom.toolbar = dom.wrap.find('[data-role=toolbar]');
			dom.btnGroupWrap = dom.wrap.find('[data-role=btnGroup]');
			dom.pagingWrap = dom.wrap.find('[data-role=paging]');

			this.createHeader();
			this.bindRowsEvent();
			dom.sorter =  dom.wrap.find('[data-role=sortUp],[data-role=sortDown]');
			dom.header.on('click',function(e){
				var target = $(e.target);
				var role = target.data('role');

				if(!config.isLoading && (role === 'sortUp' || role === 'sortDown')){
					var sortType = role === 'sortUp' ? 1 : 0;
					var parent = target.parent().parent();
					var sort = parent.data('sortname') || parent.data('field');

					dom.sorter.removeClass('active');
					target.addClass('active');
					that.load({
						sort : sort,
						sortType : sortType
					});

				}

			});

			if(config.param.page !== undefined){
				config.currentPage = config.param.page;
			}

			if(config.hasPaging){
				config.paging = new Paging({
					target : dom.pagingWrap,
					float : 'right',
					style : {'margin-right':'-2px'},
					autoRefresh : false,
					onAction : function(n){

						if(config.isLoading){
							return false
						}else{
							if(n >= config.totalPage){
								config.currentPage = config.totalPage - 1;
							}else if(n < 0){
								config.currentPage = 0;
							}

							config.currentPage = n;
							that.load({page:config.currentPage});
							return true;
						}

					}
				})
			}

			if(config.toolBtns.length > 0){
				this.createBtns();
			}

			if(!config.hasPaging && config.toolBtns.length < 1){
				dom.toolbar.hide();
			}

			dom.checkAll.on('change',function(){
				var t = $(this).prop('checked');

				dom.checker.each(function(){
					var tr = $(this).parentsUntil('tr').parent();
					t ? tr.addClass('checked') : tr.removeClass('checked');
					$(this).prop('checked',t);
				});
			});

			dom.body.on('click','[data-role=checker]',function(){
				var checked = false;

				dom.checker.each(function(){
					var tr = $(this).parentsUntil('tr').parent();
					$(this).prop('checked') ? tr.addClass('checked') : tr.removeClass('checked');
					if($(this).prop('checked')){
						checked = true;
					}
				});
				dom.checkAll.prop('checked',checked);

			});

			config.columns.length > 0 && this.setField();

			this.ajax = new Ajax({
				url : config.url,
				//data : config.param,
				dataType : 'json',
				beforeSend : function(){
					config.isLoading = true;
				},
				complete : function(){
					config.isLoading = false;
					if(config.paging !== null){
						config.paging.load({
							total : config.totalPage,
							current : config.currentPage
						})
					}

					//此页不是第一页 && 此页少于1行 ==> 加载上一页
					if(config.data && config.data.rows.length < 1 && that.config.param.page > 0){
						that.config.param.page --;
						that.load();
					}

				},
				success : function(data){
					var _data = typeof data === 'object' ? data : $.parseJSON(data);


					config.data = _data.data;
					config.totalPage = _data.data.totalPages;
					that.renderBody();
					that.config.onLoaded && that.config.onLoaded(_data.data);

					//config.data.data = {
					//	rows : [1,2,3,4,5],
					//	totalPages : 80
					//};
                    //
					//that.getRows();
					//that.getTotalPage();

				},
				error : function(e){
					that.config.onLoadError && that.config.onLoadError(e);
				}
			})

		},
		createHeader : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			var html = '';
			if(config.hasChecker === true){
				html += checkAllHTML;
			}
			for(var i=0; i<config.columns.length; i++){

				var cData = config.columns[i];

				var style = (function(){
					var attr = [];
					if(cData.align !== undefined){
						attr.push('text-align:'+cData.align);
					}

					if(cData.width !== undefined && !isNaN(parseInt(cData.width))){

						var w = cData.width+'';

						attr.push('width:'+(parseInt(w)-24) + 'px');
					}

					return attr.length > 0 ? "style=" + attr.join(';') : "";

				})();
				var sort = cData.sort === undefined ? "" : sortHTML;

				if(cData.field){
					var sortName = cData.sortName === undefined ? "" : 'data-sortname=' + cData.sortName;
					html += '<th '+style+' data-field="'+cData.field+'"'+sortName+'>'+config.columns[i].title+sort+'</th>';
				}else{
					html += '<th '+style+' data-column="'+cData.column+'">'+config.columns[i].title+'</th>';
				}

			}

			dom.header.html(html);
			dom.checkAll = dom.header.find('[data-role=checkAll]');
			dom.columnTitle = dom.header.find('[data-field],[data-column]');

			this.toggleHeader();
		},
		toggleHeader : function(){
			var field = this.config.field;
			var noField = this.config.noField;
			var columnTitle = this.dom.columnTitle;
			var tmp;

			for(name in field){
				tmp = columnTitle.filter('[data-field='+name+']');
				tmp && (field[name].hidden ? tmp.hide() : tmp.show());
			}

			for(name in noField){
				tmp = columnTitle.filter('[data-column='+name+']');
				tmp && (noField[name].hidden ? tmp.hide() : tmp.show());
			}

		},
		checkedRows : function(){

			this.dom.checker.each(function(){
				var tr = $(this).parentsUntil('tr').parent();
				$(this).prop('checked') ? tr.addClass('checked') : tr.removeClass('checked');
			})

		},
		setField : function(c,show,hide){
			this.config.columns = c ? c : this.config.columns;

			var columns = this.config.columns;

			var isHide = (function(){
				var aShow = show ? show.split(',') : [];
				var aHide = hide ? hide.split(',') : [];
				var obj = {};
				for(var i=0; i<aShow.length; i++){
					obj[aShow[i]] = false;
				}
				for(var i=0; i<aHide.length; i++){
					obj[aHide[i]] = true;
				}
				return obj
			})();

			var tmpField,tmpColumn;

			for(var i=0; i<columns.length; i++){

				if(columns[i].field !== undefined){
					tmpField = columns[i].field;
					this.config.field[tmpField] = $.extend({index:i} ,columns[i]);
					if(isHide[tmpField] !== undefined){
						this.config.field[tmpField].hidden = isHide[tmpField]
					}
				}else{
					tmpColumn = columns[i].column || 'noFiled' + i;
					this.config.noField[tmpColumn] = $.extend({index:i} ,columns[i]);
					if(isHide[tmpColumn] !== undefined){
						this.config.noField[tmpColumn].hidden = isHide[tmpColumn]
					}
				}

			}

		},
		renderBody : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			var rows = config.data.rows;
			var tbody = '';
			var tr = '';
			var td = [];
			var checkbox = config.hasChecker ? '<td class="Table_checker"><input type="checkbox" data-role="checker"></td>' : '';

			for(var i=0; i<rows.length; i++){

				for (name in config.field){

					if(rows[i][name] !== undefined){
						td.push({
							html : config.field[name].formatter ? config.field[name].formatter(rows[i][name],rows[i]) : rows[i][name],
							index : config.field[name].index,
							hidden : config.field[name].hidden
						})
					}else{
						td.push({
							html : '',
							index : config.field[name].index
						})
					}

				}

				for (name in config.noField){

					td.push({
						html : config.noField[name].formatter(rows[i]),
						index : config.noField[name].index,
						hidden : config.noField[name].hidden
					});

				}

				if(td.length > 0){
					td.sort(function(n ,m){
						return n.index - m.index;
					});

					tr += checkbox;
					var isHide;
					for(var j=0; j<td.length; j++){
						isHide = td[j].hidden ? 'style="display:none;"' : '';
						tr += '<td '+isHide+'>'+td[j].html+'</td>'
					}
					dom.rows.push($('<tr data-role="row" class="row">'+tr+'</tr>'));

				}


				tr = '';
				td =[];
			}

			dom.body.append(dom.rows);
			dom.checker = dom.body.find('[data-role=checker]');

		},
		createBtns : function(data){
			var that = this;
			var config = this.config;
			var dom = this.dom;

			dom.btnGroupWrap.empty();

			if(data){
				config.toolBtns = data;
			}

			var btns = config.toolBtns;

			for(var i=0; i<btns.length; i++){
				(function(i){

					if(btns[i].type === 'select'){
						var btn = $(btns[i].html).addClass('Table_toolSelect');
						btn.on('change',function(){
							btns[i].onAction(that.getChecked(),$(this).val(),this)
						});
					}else{
						var btn = $('<a href="javascript:;" class="Table_toolBtn">'+btns[i].title+'</a>');
						btn.on('click',function(){
							btns[i].onAction(that.getChecked())
						});
					}

					dom.btnGroup.push(btn);
					dom.btnGroupWrap.append(btn);
				})(i);
			}
		},
		bindRowsEvent : function(){
			var that = this;
			var config = this.config;
			var dom = this.dom;

			if(config.event !== null){

				for(var i=0; i<config.event.length; i++){

					var ev = config.event[i];
					for( name in ev){
						if(name !== 'role'){
							if(config.eventFormatter[name] === undefined){
								config.eventFormatter[name] = [];
							}
							config.eventFormatter[name].push([ev.role,ev[name]])

						}
					}

				}
			}

			for(name in config.eventFormatter){
				(function(name){
					dom.body.on(name,function(e){
						var target = $(e.target);
						for(var i=0; i<config.eventFormatter[name].length; i++){
							if(target.data('role') === config.eventFormatter[name][i][0]){
								config.eventFormatter[name][i][1](target,config.data.rows[target.parentsUntil('[data-role=row]').parent().index()]);
							}
						}
					})
				})(name)

			}

		},
		getIndex : function(e){
			var p = e.parentsUntil('[data-role=row]');
			if(p.length > 0){
				return p.parent().index();
			}
		},
		getChecked : function(e){
			this.config.checked = [];
			var rows = this.dom.rows;
			var res = [];
			for(var i=0; i<rows.length; i++){
				if(rows[i].find('[data-role=checker]').prop('checked')){

					this.config.checked.push(i);
				}
			}

			for(var i=0; i<this.config.checked.length; i++){
				res.push(this.config.data.rows[this.config.checked[i]])
			}

			return res;
		},
		cleanBody : function(){
			this.dom.rows = [];
			this.config.checked = [];
			this.dom.body.empty();
			this.dom.checkAll.prop('checked',false);
		},
		load : function(data,cfg){
			var that = this;
			var config = this.config;
			var dom = this.dom;

			if(data){
				$.extend(config.param,data);
				if(data.page !== undefined && !isNaN(parseInt(data.page))){
					data.currentPage = parseInt(config.param.page);
				}
			}

			//如果参数变了，把当前页置为0（忽略page）
			if(!this.isEqualParam(config.param,config.oldParam)){
				config.param.page = 0;
				config.currentPage = 0;
			}
			config.oldParam = $.extend({},config.param);

			this.setField(false,cfg ? cfg.show : false,cfg ? cfg.hidden : false);
			this.toggleHeader();
			this.cleanBody();

			//console.log(config.param)
			this.ajax.send(config.param);



		},
		//弱对比两个obj值是否相等
		isEqualParam : function (a, b) {
			try{
				var aProps = Object.getOwnPropertyNames(a);
				var bProps = Object.getOwnPropertyNames(b);

				if (aProps.length != bProps.length) {
					return false;
				}

				for (var i = 0; i < aProps.length; i++) {
					var propName = aProps[i];
					if(propName === 'page') continue;

					if (a[propName] !== b[propName]) {
						return false;
					}
				}

				return true;
			}catch(e){
				return false;
			}

		},
		destroy : function(){
			if(this.config.hasPaging){
				this.config.paging.destroy();
			}

			if(this.config.eventFormatter){
				for(name in this.config.eventFormatter){
					this.dom.body.off(name);
				}
			}

			this.dom.body.off('click');
			this.dom.header.off('click');
			for(var i=0; i<this.dom.btnGroup.length; i++){
				this.dom.btnGroup[i].off('click');
				this.dom.btnGroup[i].off('change');
			}
			this.dom.wrap.remove();

			for(name in this.config){
				this.config[name] = null;
			}

			for(name in this.dom){
				this.dom[name] = null;
			}

			this.dom = null;
			this.config = null;

			this.ajax.destroy();
			this.ajax = null;

			this.destroy = function(){};

		}

	};

	window.Table = window.Table || Table;


})(window,jQuery);

//Paging 分页
(function(window,$,undefined){
	var html = '<div class="Paging">' +
			'<a href="javascript:void(0);" class="Paging_btn" data-role="first" >首页</a>' +
			'<a href="javascript:void(0);" class="Paging_btn" data-role="prev">上一页</a>' +
			'<input class="Paging_number" type="text" value="" data-role="input"/>' +
			'<p class="Paging_total">/<i data-role="total"></i></p>' +
			'<a href="javascript:void(0);"  class="Paging_btn" data-role="go">跳转</a>' +
			'<a href="javascript:void(0);"  class="Paging_btn" data-role="next">下一页</a>' +
			'<a href="javascript:void(0);"  class="Paging_btn" data-role="last">末页</a>' +
		'</div>';

	function Paging (cfg){
		this.config = {
			target : $('body'),  //目标容器
			style : null,		//自定义dom.wrap样式
			float : 'none',		//浮动
			current : 0,		//当前页索引
			total : 1,			//总页数
			onAction : function(){ return true}, //跳页时执行的函数，参数：目标页索引,
			autoRefresh : true
		};

		$.extend(this.config,cfg);

		this.dom = {
			wrap : null,	//外层容器
			first : null,	//首页按钮
			last : null,	//末页按钮
			prev : null,	//上一页按钮
			next : null,	//下一页按钮
			input : null,	//数字输入框
			total : null,	//总页数容器
			go : null		//跳转按钮
		};

		this.init();

	}

	Paging.prototype = {

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			dom.wrap = $(html);
			dom.first = dom.wrap.find('[data-role=first]');
			dom.last = dom.wrap.find('[data-role=last]');
			dom.prev = dom.wrap.find('[data-role=prev]');
			dom.next = dom.wrap.find('[data-role=next]');
			dom.input = dom.wrap.find('[data-role=input]');
			dom.total = dom.wrap.find('[data-role=total]');
			dom.go = dom.wrap.find('[data-role=go]');

			dom.wrap.appendTo(config.target.eq(0));

			this.load();

			dom.first.on('click',{btn:dom.first,type:'first'},action);
			dom.last.on('click',{btn:dom.last,type:'last'},action);
			dom.prev.on('click',{btn:dom.prev,type:'prev'},action);
			dom.next.on('click',{btn:dom.next,type:'next'},action);
			dom.go.on('click',{btn:dom.go,type:'go'},action);
			dom.input.on('input',inputChange)

			function action (e){
				var btn = e.data.btn;
				var type = e.data.type;
				if(!btn.hasClass('disable')){

						switch(type){
							case 'first' :
								//config.current = 0;
								if(config.onAction(0)){
									config.current = 0;
								}
								break;

							case 'last' :
								//config.current = config.total - 1;
								if(config.onAction(config.total - 1)){
									config.current = config.total - 1;
								}
								break;

							case 'prev' :
								//config.current --;
								if(config.onAction(config.current - 1)){
									config.current --;
								}
								break;

							case 'next' :
								//config.current ++;
								if(config.onAction(config.current + 1)){
									config.current ++
								}
								break;

							case 'go' :
								(function(){
									var val = parseInt(dom.input.val());
									if(!dom.go.hasClass('disable')){
										if(config.onAction(val - 1)){
											config.current = val - 1;
										}
									}
								})();

								break;
						}

						if(config.autoRefresh){
							dom.input.val(config.current + 1);
							that.refresh();
						}


				}


			}
			function inputChange (e){
				if(that.inputRange()){
					dom.go.removeClass('disable');
				}else{
					dom.go.addClass('disable');
				}
			}


		},

		inputRange : function(){
			var val = parseInt(this.dom.input.val());
			if((!isNaN(val) && val > 0 && val < this.config.total+1) && val !== this.config.current+1){
				return true;
			}else{
				return false;
			}
		},

		refresh : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			dom.total.text(config.total);
			dom.input.val(config.current+1);

			if(config.current === 0){
				dom.first.addClass('disable');
				dom.prev.addClass('disable');
			}else{
				dom.first.removeClass('disable');
				dom.prev.removeClass('disable');
			}

			if(config.current >= config.total){
				config.current = config.total - 1;
				dom.input.val(config.total);
			}

			if(config.current+1 === config.total){
				dom.last.addClass('disable');
				dom.next.addClass('disable');
			}else{
				dom.last.removeClass('disable');
				dom.next.removeClass('disable');
			}

			if(this.inputRange()){
				dom.go.removeClass('disable');
			}else{
				dom.go.addClass('disable');
			}

		},

		load : function(cfg){
			cfg && $.extend(this.config,cfg);

			this.dom.wrap.css("float",this.config.float);

			if(this.config.style !== null){
				this.dom.wrap.css(this.config.style);
			}

			this.refresh();

		},

		destroy : function(){
			this.dom.first.off('click');
			this.dom.last.off('click');
			this.dom.prev.off('click');
			this.dom.next.off('click');
			this.dom.go.off('click');
			this.dom.wrap.remove();

			for(name in this.dom){
				this.dom[name] = null;
			}

			for(name in this.config){
				this.config[name] = null;
			}

			this.config = null;
			this.dom = null;

			this.destroy = function(){};
		}

	};

	window.Paging = window.Paging || Paging;

})(window,jQuery);

//ConditionPicker 查询条件组 (单选、多选)
(function(window,$,undefined){

	function ConditionPicker (cfg){
		this.config = {
			wrap : null,	//目标容器
			data : null,	//用于渲染按钮的数据
			type : 'radio', //默认单选
			options : null,
			defaultCheck : null, //默认选中：单个数字(匹配索引)/文字(匹配名称) 或数组(选中多个)
			onAction : function(){}
		};

		$.extend(this.config,cfg);

		this.init();

	}

	ConditionPicker.prototype = {

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			config.data && this.render();

			config.wrap.on('click',function(e){
				var target = $(e.target);

				if(target.data('role') === 'option' && config.type === 'radio'){
					if(!target.hasClass('active')){
						target.siblings().removeClass('active');
						target.addClass('active');
						action(target);
					}

				}else if(target.data('role') === 'option' && config.type === 'checkbox'){
					target.toggleClass('active');
					action(target);
				}

				function action(target){
					config.onAction(target.data('val'),target.hasClass('active'));
				}
			});

		},
		select : function(data,isText){
			var options = this.config.wrap.find('[data-role=option]');
			var config = this.config;

			options.each(function(){
				var $this = $(this);
				if(isText){
					if($this.text() === data){
						if(config.type == 'radio'){
							options.removeClass('active');
						}
						$this.addClass('active');
					}
				}else{
					if($this.data('val') === data){
						if(config.type == 'radio'){
							options.removeClass('active');
						}
						$this.addClass('active');
					}
				}

			})
		},
		render : function (json){
			var config = this.config;
			config.data = json || config.data;

			var data = config.data;

			var str = "";
			for(var i=0; i<data.length; i++){
				if(data[i].checked == true){
					str += '<i data-role="option" data-val="'+data[i].value+'" class="active">'+data[i].name+'</i>';
				}else{
					str += '<i data-role="option" data-val="'+data[i].value+'">'+data[i].name+'</i>';
				}
			}

			config.wrap.length > 0 && config.wrap.html(str);

			var defaultCheck = [];

			if($.isArray(config.defaultCheck)){
				defaultCheck = config.defaultCheck;
			}else{
				defaultCheck.push(config.defaultCheck);
			}

			if(defaultCheck.length > 0){
				var opt = config.wrap.find('[data-role=option]');
				for(var i=0; i<defaultCheck.length; i++){
					if(typeof defaultCheck[i] === 'string'){
						opt.filter(':contains('+defaultCheck[i]+')').addClass('active');
					}else if(typeof defaultCheck[i] === 'number'){
						opt.eq(defaultCheck[i]).addClass('active');
					}
				}
			}

		},
		getVal : function(){
			var opt = this.config.wrap.find('[data-role=option]');
			var res = [];
			opt.each(function(){
				var c = $(this);
				if(c.hasClass('active')){
					res.push(c.data('val'))
				}
			});

			return res.join(',');
		},

		destroy : function(){

			this.config.wrap.off('click');

			if(this.config.data !== null){
				this.config.wrap.empty();
			}

		}

	};

	window.ConditionPicker = window.ConditionPicker || ConditionPicker;

})(window,jQuery);

//Tab 切换
(function(window,$,undefined){

	function Tab (cfg){
		this.config = {
			btnWrap : null,
			contentWrap : null,
			index : 0,
			triggerOnce : false,
			once : [],
			onAction : function(){}
		};

		$.extend(this.config,cfg);

		this.dom = {
			btns : null,
			contents : null
		};

		this.init();

	}

	Tab.prototype = {

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			if(config.btnWrap !== null && config.btnWrap.length > 0){
				dom.btns = config.btnWrap.children('[data-role=btn]')
			}else{
				dom.btns = $('<i></i>');
			}

			dom.contents = config.contentWrap.children('[data-role=content]');

			if(config.triggerOnce){
				this.goTo();
			}else{
				dom.btns.removeClass('active');
				dom.contents.hide();
				dom.btns.eq(config.index).addClass('active');
				dom.contents.eq(config.index).show();

				if(typeof config.once[config.index] === 'function'){
					config.once[config.index]();
					config.once[config.index] = null;
				}
			}

			dom.btns.on('click',function(){
				if($(this).hasClass('active')){
					return
				}
				var c = this;
				dom.btns.each(function(i){
					if(this === c){
						config.index = i;
					}
				});
				that.goTo();
			})

		},
		getIndex : function(){
			return this.config.index;
		},
		goTo : function(n,data){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			if(n !== undefined){
				config.index = n;
			}

			if(typeof config.once[config.index] === 'function'){
				config.once[config.index]();
				config.once[config.index] = null;
			}

			dom.btns.removeClass('active');
			dom.contents.hide();
			dom.btns.eq(config.index).addClass('active');
			dom.contents.eq(config.index).show();

			config.onAction(config.index,data);
		},

		destroy : function(){
			this.dom.btns.off('click').removeClass('active');
			this.dom.contents.show();

			for(name in this.config){
				this.config[name] = null;
			}
			this.config = null;

			for(name in this.dom){
				this.dom[name] = null;
			}
			this.dom = null;

			this.destroy = function(){};
		}

	};

	window.Tab = window.Tab || Tab;

})(window,jQuery);

//TagPicker 标签选择
(function(window,$,undefined){

	function TagPicker (cfg){
		this.config = {
			wrap : null,
			leftData : [],
			rightData : []
		};

		$.extend(this.config,cfg);

		this.dom = {
			leftWrap : null,
			rightWrap : null
		};

		this.init();

	}

	TagPicker.prototype = {

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			dom.leftWrap = config.wrap.find('[data-role=leftWrap]');
			dom.rightWrap = config.wrap.find('[data-role=rightWrap]');

			if(config.leftData.length > 0 || config.rightData.length > 0){
				this.render();
			}

			config.wrap.on('click',function(e){
				var target = $(e.target);
				var role = target.data('role');

				if(role === 'tag'){
					target.toggleClass('active');

				}else if(role === 'btnLeft'){
					that.moveTags('toLeft');

				}else if(role === 'btnRight'){
					that.moveTags('toRight');

				}else if(role === 'btnAllLeft'){
					that.moveTags('allToLeft');

				}else if(role === 'btnAllRight'){
					that.moveTags('allToRight');
				}
			});
		},
		render : function(leftData,rightData){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			if(leftData !== undefined){
				config.leftData = leftData;
			}

			if(rightData !== undefined){
				config.rightData = rightData;
			}

			var leftStr = '';
			var rightStr = '';

			for(var i=0; i<config.leftData.length; i++){
				leftStr += '<i data-role="tag" data-val="'+config.leftData[i].value+'">'+config.leftData[i].name+'</i>';
			}

			for(var i=0; i<config.rightData.length; i++){
				rightStr += '<i data-role="tag" data-val="'+config.rightData[i].value+'">'+config.rightData[i].name+'</i>';
			}

			dom.leftWrap.html(leftStr);
			dom.rightWrap.html(rightStr);

		},
		moveTags : function(type){
			var targetTags;
			var targetWrap;

			if(type === 'toLeft'){
				targetTags = this.dom.rightWrap.find('[data-role=tag].active');
				targetWrap = this.dom.leftWrap;

			}else if(type === 'toRight'){
				targetTags = this.dom.leftWrap.find('[data-role=tag].active');
				targetWrap = this.dom.rightWrap;

			}else if(type === 'allToLeft'){
				targetTags = this.dom.rightWrap.find('[data-role=tag]');
				targetWrap = this.dom.leftWrap;

			}else if(type === 'allToRight'){
				targetTags = this.dom.leftWrap.find('[data-role=tag]');
				targetWrap = this.dom.rightWrap;

			}

			targetTags.removeClass('active').appendTo(targetWrap);

		},
		getVal : function(){
			var leftTags = this.dom.leftWrap.find('[data-role=tag]');
			var rightTags = this.dom.rightWrap.find('[data-role=tag]');

			var leftVal = [];
			var rightVal = [];

			leftTags.each(function(){
				leftVal.push($(this).data('val'));
			});

			rightTags.each(function(){
				rightVal.push($(this).data('val'));
			});

			return [leftVal.join(','),rightVal.join(',')];
		},
		destroy : function(){

			this.config.wrap.off('click');

			for(name in this.config){
				this.config[name] = null;
			}
			this.config = null;

			for(name in this.dom){
				this.dom[name] = null;
			}
			this.dom = null;

			this.destroy = function(){};
		}

	};

	window.TagPicker = window.TagPicker || TagPicker;

})(window,jQuery);

//Validator 表单验证 (依赖验证规则: window.config.validationRules)
(function(window,$,undefined){

	function Validator (cfg){
		this.config = {
			wrap : null,
			rules : window.config.validationRules
		};

		$.extend(this.config,cfg);

		this.dom = {
			items : null,
			tips : null
		};

		this.init();

	}

	Validator.prototype = {

		init : function(){

			this.reload();


		},
		reload : function(){
			var dom = this.dom;
			var config = this.config;
			dom.items = config.wrap.find('[data-validate]');
			dom.tips = config.wrap.find('[data-role=tip]');

			//dom.tips.hide();

			dom.items.off('input blur')
			dom.items.on('input blur',{that:this},this.testOne)
		},

		test : function(){
			var that = this;
			var flag = true;
			this.dom.items.each(function(){
				if(!that.testOne.call(this,{data:{that:that}})){
					flag = false;
				}
			});
			return flag;
		},
		testOne : function(e){
			var $this = $(this);
			var that = e.data.that;
			var val = $.trim($this.val()).toString();
			var conditions = (function(){
				var validate = $this.data('validate');
				if(validate){
					return $.trim(validate).split(/\s+/);
				}else{
					return false;
				}

			})();
			var length = $this.data('length');
			var valL = val.length;
			var tipContent = (function(){
				var str = $this.data('tipcontent');
				var obj = {};
				if(str){
					var tmp = str.split(',');
					for(var i=0; i<tmp.length; i++){
						var content = tmp[i].split(':');
						obj[content[0]] = content[1];
					}
					return obj;
				}else{
					return false;
				}
			})();
			if(conditions){
				for(var i=0; i<conditions.length; i++){

					if(conditions[i] === 'required'){

						if(val !== "" && val !== undefined && val !== null){
							that.hideTip($this);

						}else{

							that.showTip($this,tipContent.required ? tipContent.required : that.config.rules[conditions[i]].tip);
							return false;

						}

					}else {
						if(that.config.rules[conditions[i]].reg.test(val)){
							that.hideTip($this)

						}else{
							that.showTip($this,tipContent[conditions[i]] ? tipContent[conditions[i]] : that.config.rules[conditions[i]].tip);
							return false;

						}
					}
				}
			}

			if(length !== undefined && valL > length){
				that.showTip($this,'输入字符数请不要超过' + length);
				return false;
			}else{
				that.hideTip($this)
			}
			return true;
		},
		showTip : function(e,txt){
			var tip;
			if(e.data('tip')){
				tip = this.dom.tips.filter('[data-tipName='+e.data('tip')+']');
			}else{
				var next = e.next();
				tip = next.data('role') === 'tip' ? next : null;
			}

			e.addClass('validationFailed');
			tip && tip.text(txt).show();

		},
		hideTip : function(e){
			e.removeClass('validationFailed');

			var tip;
			if(e.data('tip')){
				tip = this.dom.tips.filter('[data-tipName='+e.data('tip')+']');
			}else{
				var next = e.next();
				tip = next.data('role') === 'tip' ? next : null;
			}

			tip && tip.empty().hide()
			//this.dom.tips.filter('[data-tipName='+e.data('tip')+']').empty().hide();
		},
		cleanTips : function(){
			var that = this;
			this.dom.items.each(function(){
				that.hideTip($(this))
			})
		},
		destroy : function(){
			this.dom.items.off('input blur').css('border-color','');
			this.dom.tips.css('display','').empty();

			for(name in this.config){
				this.config[name] = null;
			}
			this.config = null;

			for(name in this.dom){
				this.dom[name] = null;
			}
			this.dom = null;

			this.destroy = function(){};
		}

	};

	window.Validator = window.Validator || Validator;

})(window,jQuery);

//DatePicker 日期、时间选择 (依赖: window.config.validationRules, window.common.zeroPadding)
(function(window,$,undefined){

	function DatePicker (cfg){
		this._date = new Date();	//填充日历用的时间对象，只维护了年/月，没有维护日

		this.config = {
			type : '',  //date,time,all
			status : 0,	//选择日期模式0 | 选择年月模式1
			target : null,	//input框
			currentTarget : null,
			selectedDate : '',	//选中的日期
			reg : window.config.validationRules,
			onAction : function(){}
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

			dom.wrap.on('click','.mgCalendar_filled',function(){
				config.selectedDate = $(this).data('val');
				var type = that.current.data.type;

				dom.dateTd.removeClass('mgCalendar_current');
				$(this).addClass('mgCalendar_current');

				if(!type || type === 'date'){
					that.current.input.val(config.selectedDate);
					config.target.trigger('input');
					dom.wrap.hide();
					that.action(config.selectedDate);
				}else{

				}

			});

			dom.timeConfirm.on('click',function(){
				var type = that.current.data.type;
				var time = that.getTime();

				if(type === 'time'){
					that.current.input.val(time);
					that.action(time);
				}else if(type === 'all'){
					that.current.input.val(that.config.selectedDate + ' ' +time);
					that.action(that.config.selectedDate + ' ' +time);
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
		action : function(val){
			if(typeof this.config.onAction === 'function'){
				this.config.onAction(this.current.input,val);
			}
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

			dom.wrap = $('<div class="mgCalendar"></div>');
			dom.dateWrap = $('<div></div>');
			dom.btnPrev = $('<a href="javascript:;" class="mgCalendar_prev"></a>');
			dom.btnNext = $('<a href="javascript:;" class="mgCalendar_next"></a>');

			var tbody='';
			for(var i=0; i<6; i++){
				tbody+='<tr><td></td><td></td><td></td><td></td><td></td><td class="mgCalendar_orange"></td><td class="mgCalendar_orange"></td></tr>'
			}
			dom.dateTable = $('<div class="mgCalendar_box"><div class="mgCalendar_tit"><span class="mgCalendar_titBtn"><span class="mgCalendar_year" contenteditable="true"></span>年<span class="mgCalendar_month"></span>月</span></div><table class="mgCalendar_table"><thead><tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th class="mgCalendar_orange">六</th><th class="mgCalendar_orange">日</th></tr></thead><tbody>'+tbody+'</tbody></table></div>')

			var monthList = $('<ul class="mgCalendar_monthList"><li>一月</li><li>二月</li><li>三月</li><li>四月</li><li>五月</li><li>六月</li><li>七月</li><li>八月</li><li>九月</li><li>十月</li><li>十一月</li><li>十二月</li></ul>');
			var inputYear = $('<div class="mgCalendar_inputYear"><input type="text" /> 年</div>');
			dom.btnConfirm = $('<div class="mgCalendar_confirm" style="display:none">确定</div>');
			dom.monthList = $('<div class="mgCalendar_box" style="display: none;"><div class="mgCalendar_tit"><span class="mgCalendar_year"></span>年</div></div>');
			dom.monthList.append(inputYear,monthList,dom.btnConfirm);

			dom.dateWrap.append(dom.btnPrev,dom.btnNext,dom.dateTable,dom.monthList);
			dom.wrap.append(dom.dateWrap);

			dom.dateTd = dom.wrap.find('.mgCalendar_table tbody td');
			dom.textYear = dom.wrap.find('.mgCalendar_year');
			dom.textMonth = dom.wrap.find('.mgCalendar_month');
			dom.btnMonth = dom.wrap.find('.mgCalendar_monthList li');
			dom.btnTit = dom.wrap.find('.mgCalendar_titBtn');
			dom.inputYear = dom.wrap.find('.mgCalendar_inputYear input');
		},
		createTime : function(){
			var dom = this.dom;

			var t24 = '';
			var t60 = '';
			var html = '';
			var tmp;
			for(var i=0; i<24; i++){
				tmp = common.zeroPadding(i,2);
				t24 += '<option value="'+tmp+'">'+tmp+'</option>'
			}
			for(var i=24; i<60; i++){
				tmp = common.zeroPadding(i,2);
				t60 += '<option value="'+tmp+'">'+tmp+'</option>'
			}

			html = '<div class="mgCalendar_timeWrap"><select class="mgCalendar_hours">'+t24+'</select> : <select class="mgCalendar_minutes">'+t24+t60+'</select> : <select class="mgCalendar_seconds">'+t24+t60+'</select> <a class="mgCalendar_timeConfirm" href="javascript:void(0);">确定</a></div>'
			$wrap = $(html);
			dom.timeWrap = $wrap;
			dom.hours = $wrap.find('.mgCalendar_hours');
			dom.minutes = $wrap.find('.mgCalendar_minutes');
			dom.seconds = $wrap.find('.mgCalendar_seconds');
			dom.timeConfirm = $wrap.find('.mgCalendar_timeConfirm');
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

			}else if(type === 'all'){

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
					config.selectedDate = that._date.getFullYear() + '-' + common.zeroPadding(that._date.getMonth()+1,2) + '-' + common.zeroPadding(that._date.getDate(),2);
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
				var res = 'mgCalendar_filled';

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
						res = 'mgCalendar_disabled';
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
						res = 'mgCalendar_disabled';
					}
				}

				return res;
			};

			dom.dateTd.empty().removeClass('mgCalendar_filled mgCalendar_today mgCalendar_current mgCalendar_disabled');

			for(i=0; i<n; i++){
				dom.dateTd.eq(i+blank).data('val',year+'-'+common.zeroPadding(month+1,2)+'-'+common.zeroPadding((i+1),2)).text(i+1).addClass(fillClass);
			}

			if(year === now.getFullYear() && month === now.getMonth()){
				dom.dateTd.each(function(){
					if($(this).text() == now.getDate()){
						$(this).addClass('mgCalendar_today');
					}
				})
			}

			dom.textYear.text(this._date.getFullYear());
			dom.inputYear.val(this._date.getFullYear());
			dom.textMonth.text(this._date.getMonth()+1);
			if(currentDay){
				dom.dateTd.filter('.mgCalendar_filled').eq(currentDay-1).addClass('mgCalendar_current');
			}
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

	window.DatePicker = window.DatePicker || DatePicker;

})(window,jQuery);

//Dialog 对话框
(function(window,$,undefined){

	var maskHtml = '<div class="Dialog_Mask" data-role="mask"></div>';

	function Dialog (cfg){
		this.config = {
			wrap : null,
			hasMask : true,
			top : 0,
			left : 0,
			hasCloseBtn : true,
			marginTop : '',
			marginLeft : '', //默认-271px
			//width : 542,
			//height : 'auto',
			target : null,		//对话框弹出时插入到的容器，如果target=null，对话框弹出是将不做插入操作，当对话框弹出的是自己定义好的dom时，应把target置为null
			onHide : function(){},  //return false 取消默认操作(隐藏，销毁，显示)
			onDestroy : function(){},
			onShow : function(){},
			onConfirm : function(){}
		};

		$.extend(this.config,cfg);

		this.dom = {
			mask : null

		};

		this.init();

	}

	Dialog.prototype = {

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			//this.centerOffset();

			config.wrap.on('click',function(e){
				var target = $(e.target);

				if(target.data('role') === 'hide'){
					that.hide();
				}else if(target.data('role') === 'destroy'){
					that.destroy();
				}if(target.data('role') && target.data('role').split('-')[0] === 'confirm'){
					var fn = target.data('role').split('-')[1];
					if(that.test(false,that.config.onConfirm) && typeof that[fn] === 'function'){
						that[fn](true);
					}

				}
			})

		},
		show : function(cancelActionFn){
			var flg = this.test(cancelActionFn,this.config.onShow);

			if(flg){
				if(this.config.target !== null){
					this.config.wrap.appendTo(this.config.target);

				}

				this.centerOffset();

				this.config.wrap.addClass('Dialog_show');
				if(!this.config.top){
					this.config.wrap.css({'margin-top':this.config.marginTop})
				}else{
					this.config.wrap.css({'top':this.config.top})
				}

				if(!this.config.left){
					this.config.wrap.css({'margin-left':this.config.marginLeft})
				}else{
					this.config.wrap.css({'left':this.config.left})
				}

				if(this.config.hasMask === true){
					this.dom.mask = $(maskHtml).appendTo('body');
				}
			}
		},

		hide : function(cancelActionFn){
			var flg = this.test(cancelActionFn,this.config.onHide);

			if(flg) {
				this.config.wrap.removeClass('Dialog_show');
				this.config.wrap.css({'top':'','margin-left':''});
				if (this.dom.mask.length > 0) {
					this.dom.mask.remove();
				}
			}
		},

		destroy : function(cancelActionFn){
			var flg = this.test(cancelActionFn,this.config.onDestroy);

			if(flg){
				if(this.dom.mask && this.dom.mask.length > 0 ){
					this.dom.mask.remove();
				}

				this.config.wrap.off('click');
				this.config.wrap.remove();

				for(name in this.dom){
					this.dom[name] = null;
				}

				for(name in this.config){
					this.config[name] = null;
				}

				this.config = null;
				this.dom = null;

				this.destroy = function(){};
			}


		},
		test : function(isCancel,fn){
			var flg;

			if(isCancel === true){
				flg = true
			}else{
				flg = fn() === false ? false : true ;
			}

			return flg;
		},
		centerOffset : function(){
			var config = this.config;
			config.marginTop =  - this.config.wrap.outerHeight()/2 + 'px';
			config.marginLeft =  - this.config.wrap.outerWidth()/2 + 'px';
		}

	};

	window.Dialog = window.Dialog || Dialog;

})(window,jQuery);

//Select 选择框
(function(window,$,undefined){

	function Select (cfg){
		this.config = {
			wrap : null,
			data : null

		};

		$.extend(this.config,cfg);

		this.dom = {
			options : null
		};

		this.init();

	}

	Select.prototype = {

		init : function(){
			var that = this;
			var dom = this.dom;
			var config = this.config;

			this.render();

		},
		render : function(arr){
			this.config.data = arr ? arr : this.config.data;
			var str = '';
			var data = this.config.data;
			if(data && data.length > 0){
				for(var i=0; i<data.length; i++){
					str += '<option value="'+data[i].value+'">'+data[i].name+'</option>'
				}
			}else{
				return false;
			}

			this.config.wrap.html(str);

			this.dom.options = this.config.wrap.find('option');

			this.config.data = arr;
		},
		select : function(data,isText){
			var options = this.dom.options;
			var type = isText ? 'text' : 'val';

			options.each(function(){
				var $this = $(this);

				if($this[type]() === data){
					$this.prop('selected',true);
				}
			})
		},
		getVal : function(){
			return this.config.wrap.val();
		},
		getName : function(){
			try{
				var val = this.config.wrap.val();
				var data = this.config.data;
				for(var i=0; i<data.length; i++){
					if(data[i].value === val){
						return data[i].name;
					}
				}
			}catch (e){
				return ''
			}

		},

		destroy : function(){

			for(name in this.dom){
				this.dom[name] = null;
			}

			for(name in this.config){
				this.config[name] = null;
			}

			this.config = null;
			this.dom = null;

			this.destroy = function(){};
		}

	};

	window.Select = window.Select || Select;

})(window,jQuery);

//Ajax (防止重复发请求)
(function(window,$,undefined){

	function Ajax(cfg){
		var that = this;
		var $body = $('body');
		this.beforeSend = cfg.beforeSend || function(){};
		this.complete = cfg.complete || function(){};

		this.btn = cfg.btn || $('<i></i>');

		this.request = null;

		this.param = {};

		delete cfg.btn;

		this.data = $.extend(cfg,{
			dataType : 'json',
			beforeSend : function(){
				that.btn.addClass('disabled');
				Ajax.count ++;
				if(Ajax.count === 1){
					//Ajax.loading.appendTo($body);
				}

				that.beforeSend();

			},
			complete : function(){
				that.btn.removeClass('disabled');
				Ajax.count --;
				if(Ajax.count === 0){
					//Ajax.loading.remove();
				}

				that.complete();
			}
		});

		if(this.data.data !== undefined){
			this.param = this.data.data;
			delete this.data.data;
		}

	}

	Ajax.count = 0;
	Ajax.loading = $('<div class="loading"><div class="loading_mask"></div></div>');

	Ajax.prototype = {
		send : function(param){
			var flg;

			this.data.data = param ? $.extend({},this.param,param) : this.param;

			if(this.isDisabled()){
				flg = false;
			}else{
				flg = true;
				this.request = $.ajax(this.data);
			}

			return flg;
		},
		isDisabled : function(){
			var flg = false;
			this.btn.each(function(){
				if($(this).hasClass('disabled')){
					flg = true;
				}
			});

			return flg;
		},
		abort : function(){
			if(this.request !== null){
				this.request.abort();
			}
		},
		destroy : function(){
			this.beforeSend = null;
			this.complete = null;
			this.btn = null;
			this.data = null;

			this.destroy = function(){};
		}
	};

	window.Ajax = window.Ajax || Ajax;

})(window,jQuery);

//RegionSelector 地区联动选择框
(function(window,$,undefined){
	//地区数据路径
	var regionDataUrl = [
		'data/region/province.json',
		'data/region/city.json',
		'data/region/district.json'
	];

	var RegionSelector = function(cfg){
		this.config = {
			wrap : null, //下拉框容器
			level : 3,  //联动级数：默认省市区
			validation:true, //是否验证用户完整选择地区
			//data : [],
			isLoaded : false, //地区数据是否加载完毕
			loadDataError : false, //用于标记是否加载失败
			onLoadError : function(){}, //加载地区数据失败回调
			onLoaded : function(){}, //加载地区数据完成回调
			onSelect : function(){}
		};

		this.regionData = []; //地区数据

		$.extend(this.config,cfg);

		this.selectors = {  //选择框数据 name是wrap的id selectors是wrap下的下拉框(jQuery对象) options是下拉框里的option（通过数据创造出来的部分，不包括html里本来就有的部分，如：「请选择」）
			//	name : {
			//		selectors : null,
			//		options : []
			//	}
		};

		this.init();

	};

	RegionSelector.prototype = {

		init : function(){

			//把this.config.wrap统一成数组
			if(!$.isArray(this.config.wrap) && this.config.wrap !== null){
				var arr = [];
				arr.push(this.config.wrap);
				this.config.wrap = arr;

			}else if(this.config.wrap === null){
				this.config.wrap = [];
			}

			this.loadData();

		},

		loadData : function(){
			var that = this;
			var config = this.config;

			var aLoaded = new Array(config.level);

			//加载level等级限定内的地区数据
			for(var i=0; i<config.level; i++){
				(function(index){
					if(that.regionData[index] === undefined){
						$.ajax({
							url : regionDataUrl[index],
							dataType : 'json',
							success : function (data){
								that.regionData[index] = data;
								aLoaded[index] = true;
								loadedAllTest();
							},
							error : function(e){
								if(!that.config.loadDataError){
									that.config.onLoadError(e);
								}
								that.config.loadDataError = true;
							}
						})
					}else{
						aLoaded[index] = true;
						loadedAllTest();
					}

				})(i);

			}

			//测试多个地区数据是否加载完成
			function loadedAllTest(){
				var flg = true;
				for(var i=0; i<aLoaded.length; i++){
					if(aLoaded[i] !== true){
						flg = false
					}
				}
				if(flg === true){

					//数据全部加载完执行
					that.isLoaded = true;
					that.initSelectors();

					that.config.onLoaded();

				}
			}
		},
		//把this.config.wrap中定义的选择框组add()
		initSelectors : function(){
			var config = this.config;

			if( this.wrap !== null && $.isArray(config.wrap)){

				for(var i=0; i<config.wrap.length; i++){
					this.add(config.wrap[i],true);

				}

			}else if( this.wrap !== null && !$.isArray(this.wrap)){

				this.add(config.wrap,true);
			}
		},
		//初始化选择框组，外部可调用，参数：选择框组的父级
		add : function(selectorWrap,isInnerAdd){

			if(!this.isLoaded) return;

			if(!isInnerAdd){  //如果是用户调用add（没传isInnerAdd），添加到this.config.wrap
				this.config.wrap.push(selectorWrap);
			}

			var that = this;
			var name = selectorWrap.attr('id');

			//创建selectors数据
			this.selectors[name] = {};
			this.selectors[name].selectors = selectorWrap.find('[data-role=selector]');
			this.selectors[name].options = [];

			//绑定事件
			this.selectors[name].selectors.on('change',function(){
				var val = $(this).val();
				var level = $(this).data('level');
				var options = that.selectors[name].options[level-1];
				var id;

				if(level == 1 || level == 2){

					that.selectors[name].options[2] && that.selectors[name].options[2].remove();
					that.selectors[name].options[2] = undefined;
					if(level == 1){
						that.selectors[name].options[1] && that.selectors[name].options[1].remove();
						that.selectors[name].options[2] = undefined;
					}
				}

				if( val !== '' && val !== undefined && options){
					id = options.filter('[value='+val+']').data('id');
					if(val !== '' && level < that.config.level){
						that.render(name,level+1,id);
					}
				}

				that.config.onSelect(val,that.getVal(name),name)

			});

			this.render(selectorWrap.attr('id'),1)
		},
		//给目标选择框添加option
		render : function(name,level,id){
			var selector = this.selectors[name].selectors.filter('[data-level='+level+']');
			var options = this.createOptions(this.regionData[level-1],level,id);

			if(options.length > 0){
				this.selectors[name].options[level-1] = options;
				selector.append(options);
				this.selectors[name].selectors.show();
			}else{
				this.selectors[name].selectors.each(function(){
					if($(this).data('level') >= level){
						$(this).hide();
					}
				})
			}

		},
		//通过data创建option并排序
		createOptions : function(data,level,id){
			return $(this['createOptionsL'+level](data,id).join(''));
		},
		createOptionsL1 : function(data){
			var arr =[]; //[[排序,options字符串],[排序,options字符串]]
			var arr2 =[]; //[options字符串,options字符串]

			for(var i=0; i<data.length; i++){
				arr.push([data[i].sort,'<option data-id="'+data[i].id+'" value="'+data[i].name+'">'+data[i].name+'</option>']);
			}

			arr.sort(function(n,m){
				return n[0] - m[0];
			});

			for(var i=0; i<arr.length; i++){
				arr2.push(arr[i][1]);
			}

			return arr2;
		},
		createOptionsL2 : function(data,id){
			var arr =[]; //[[排序,options字符串],[排序,options字符串]]
			var arr2 =[]; //[options字符串,options字符串]

			for(var i=0; i<data.length; i++){
				if(data[i].lastId === id-0){
					arr.push([data[i].sort,'<option data-id="'+data[i].id+'" value="'+data[i].name+'">'+data[i].name+'</option>']);
				}

			}

			arr.sort(function(n,m){
				return n[0] - m[0];
			});

			for(var i=0; i<arr.length; i++){
				arr2.push(arr[i][1]);
			}

			return arr2;
		},
		createOptionsL3 : function(data,id){
			var arr =[]; //[[排序,options字符串],[排序,options字符串]]

			for(var i=0; i<data.length; i++){
				if(data[i].lastId === id-0){
					arr.push('<option data-id="'+data[i].id+'" value="'+data[i].name+'">'+data[i].name+'</option>');
				}

			}

			return arr;
		},
		//通过用户给出的地区数据格式化下拉框，用户可用，参数：数据，id（可选）
		format : function(data,id){
			if(!this.isLoaded) return;

			var arr; //数据数组
			var name; //目标selector组
			var level = this.config.level;
			var regionData = this.regionData;

			if(typeof data === 'string'){
				arr = data.split(',')
			}else if($.isArray(data)){
				arr = data;
			}

			if(this.config.wrap.length > 0){
				name = id || this.config.wrap[0].attr('id');
			}else{
				return;
			}

			//console.log(arr,name)

			for(var i=0; i<level; i++){
				for(var j=0; j<regionData[i].length; j++){
					if(regionData[i][j].name === arr[i]){
						var selector = this.selectors[name].selectors.eq(i);
						selector.val(arr[i]);
						selector.trigger('change');
					}
				}
			}

		},
		clear : function(id){
			var name = id || this.config.wrap[0].attr('id');
			var selector = this.selectors[name].selectors.eq(0);
			selector.val('');
			selector.trigger('change');

		},
		//获取值，用户可用，可选参数：id
		getVal : function(name){
			var that = this;

			var arr = []; //结果数组
			var aVali = [];  //验证是否已选择数组
			var selector,val;
			var ok = true;  //是否已选择

			if(this.config.wrap.length > 0){
				getVal(name || this.config.wrap[0].attr('id'));
			}else{
				return;
			}

			function getVal(name){
				for(var i=0; i<that.config.level; i++){
					selector = that.selectors[name].selectors.eq(i);
					val = selector.val();
					(selector.css('display') !== 'none') && arr.push(val);

					if(val !== '' && val !== undefined){
						aVali.push(true);
					}else{
						aVali.push(false);
					}
				}
			}

			if(this.config.validation){

				for(var i=0; i<this.config.level; i++){
					if(aVali[i] === false) {ok = false};
				}
				if(ok){
					return arr.join(',');
				}else{
					return false;
				}
			}else{
				return arr.join(',');
			}

		},
		//销毁，用户可用，可选参数：id
		destroy : function(id){
			var that = this;
			if(id !== undefined){
				destroyOne(id);
			}else{
				for(name in this.selectors){
					destroyOne(name);
				}

				for(name in this.selectors){
					this.selectors[name] = null;
				}

				for(name in this.config){
					this.config[name] = null;
				}

				this.selectors = null;
				this.config = null;
				this.regionData = null;
			}

			function destroyOne (id){
				var options = that.selectors[id].options;

				that.selectors[id].selectors.off('change');
				that.selectors[id].selectors = null;

				for(var i=0; i<options.length; i++){
					options[i] && options[i].remove();
				}
				that.selectors[id].options = null;
			}
		}
	};

	window.RegionSelector = window.RegionSelector || RegionSelector;
})(window,jQuery);

//RegionPicker 地区多选对话框（依赖: Tab, Dialog）
(function(window,$,undefined){
	//地区数据路径
	var regionDataUrl = [
		'data/region/province.json',
		'data/region/city.json',
	];
	var wrapHtml = '<div class=RegionPicker></div>';
	var innerHtml = '<p class=RegionPicker_tit>选择城市</p><div class=RegionPicker_content><div class=RegionPicker_tabBtn><a data-role=btn href="javascript:void(0);">省份</a><a data-role=btn href="javascript:void(0);">城市</a></div><div class=RegionPicker_tabContent><div data-role=content><ul class=RegionPicker_tags></ul></div><div data-role=content class=RegionPicker_pr><label class=RegionPicker_checkAll><input id="ca" type=checkbox> 选择全部</label></div></div><p class=RegionPicker_tip>已选中：<span class=RegionPicker_count>0</span>个城市 <a class=RegionPicker_clear href="javascript:void(0);">清除全部</a></p><div class=RegionPicker_footer><a class=RegionPicker_btn data-role=confirm-hide href="javascript:void(0);">确 认</a><a class="RegionPicker_btn RegionPicker_cancel" data-role=hide href="javascript:void(0);">取 消</a></div></div>';

	var RegionPicker = function(cfg){
		this.config = {
			target : null,
			dialog : null,
			tab : null,
			isLoaded : false,
			level : 2,
			current : 1, //当前省ID
			onLoadError : function(){},
			onLoaded : function(){},
			onConfirm : function(){}
		};

		$.extend(this.config,cfg);

		this.regionData = [];
		this.result = {};

		this.dom = {
			wrap : null,
			btnWrap : null,
			contentWrap : null,
			count : null,
			checkAll : null,
			provinceWrap : null,
			cityWrap : null,
			pTags : null,//省份tags
			cUl : null //城市ul
		};

		this.init();

	};

	RegionPicker.prototype = {

		init : function(){
			var that = this;
			var config = this.config;
			var dom = this.dom;

			dom.wrap = $(wrapHtml);
			dom.wrap.html(innerHtml);
			dom.wrap.appendTo(config.target);

			dom.btnWrap = dom.wrap.find('.RegionPicker_tabBtn');
			dom.contentWrap = dom.wrap.find('.RegionPicker_tabContent');
			dom.provinceWrap = dom.wrap.find('[data-role=content]').eq(0);
			dom.cityWrap = dom.wrap.find('[data-role=content]').eq(1);
			dom.count = dom.wrap.find('.RegionPicker_count');
			dom.clear = dom.wrap.find('.RegionPicker_clear');
			dom.checkAll = dom.wrap.find('.RegionPicker_checkAll input');

			config.dialog = new Dialog({
				wrap : dom.wrap,
				top : '10%',
				onConfirm : function(){
					that.config.onConfirm(that.getVal());
					//that.clearActive();
					config.tab.goTo(0);
				},
				onHide : function(){
					//that.clearActive();
					config.tab.goTo(0);
				}
			});

			config.tab = new Tab({
				btnWrap : dom.btnWrap,
				contentWrap : dom.contentWrap,
				onAction : function(n){
					n === 1 && that.formatCheckAll();
				}
			});

			dom.clear.on('click',function(){
				that.clearActive();
			});

			dom.checkAll.on('change',function(){
				var val = $(this).prop('checked');
				var id = that.config.current;
				var cityTags = that.dom.cUl.filter('[data-lastid='+id+']').find('li');
				var provinceTag = that.dom.pTags.filter('[data-id='+id+']');

				if(val){
					cityTags.addClass('active');
					provinceTag.addClass('active');
					cityTags.each(function(){
						that.result[$(this).text()] = true;
					})
				}else{
					cityTags.removeClass('active');
					provinceTag.removeClass('active');
					cityTags.each(function(){
						that.result[$(this).text()] = false;
					})
				}

				that.count();
			});

			dom.wrap.find('[data-role=btn]').eq(1).off('click');

			this.loadData();

		},
		loadData : function(){
			var that = this;
			var config = this.config;

			var aLoaded = new Array(config.level);

			//加载地区数据
			for(var i=0; i<config.level; i++){
				(function(index){
					if(that.regionData[index] === undefined){
						$.ajax({
							url : regionDataUrl[index],
							dataType : 'json',
							success : function (data){
								that.regionData[index] = data;
								aLoaded[index] = true;
								loadedAllTest();
							},
							error : function(e){
								if(!that.config.loadDataError){
									that.config.onLoadError(e);
								}
								that.config.loadDataError = true;
							}
						})
					}else{
						aLoaded[index] = true;
						loadedAllTest();
					}

				})(i);

			}

			//测试多个地区数据是否加载完成
			function loadedAllTest(){
				var flg = true;
				for(var i=0; i<aLoaded.length; i++){
					if(aLoaded[i] !== true){
						flg = false
					}
				}
				if(flg === true){

					//数据全部加载完执行
					that.isLoaded = true;
					that.initTags();

					that.config.onLoaded();

				}
			}
		},
		initTags : function(){
			var that = this;
			var data = this.regionData;
			var dom = this.dom;

			this.regionData[0] = formatProvinceData();
			this.regionData[1] = formatCityData();

			createPtags();
			dom.provinceWrap.on('click','li',function(){
				var tag = $(this);
				var id = tag.data('id');
				var currentProvince;

				that.config.current = id;

				if(tag.data('iscity')){
					tag.toggleClass('active');
					that.result[tag.text()] = tag.hasClass('active');
					that.count();

				}else{
					currentProvince = dom.cUl.filter('[data-lastid='+id+']');
					dom.cUl.hide();
					currentProvince.show();
					that.config.tab.goTo(1);

				}
			});

			dom.cityWrap.on('click','li',function(){
				var tag = $(this);
				var id = tag.data('id');


				tag.toggleClass('active');
				that.result[tag.text()] = tag.hasClass('active');
				that.count();

				that.formatCheckAll();

			});

			createCtags();


			function createCtags(){
				var ul = '';
				var tags = '';
				var id;
				var n;

				for(name in that.regionData[1]){
					id = name.split('_')[1];
					n = that.regionData[1][name].length;
					for(var i=0; i<n; i++){
						tags += '<li>'+that.regionData[1][name][i].name+'</li>'
					}

					ul += '<ul style="display:none;" class="RegionPicker_tags" data-lastid="'+ id +'">'+tags+'</ul>';
					tags = '';
				}

				dom.cityWrap.append($(ul));
				dom.cUl = dom.cityWrap.find('ul');

			}

			function createPtags(){
				var pTagsStr = '';
				for(name in that.regionData[0]){
					pTagsStr += '<li data-isCity="'+(isCity(name) ? 1 : 0)+'" data-id="'+(name.split('_')[1])+'">'+that.regionData[0][name]+'</li>'
				}
				dom.pTags = $(pTagsStr);
				dom.pTags.appendTo(dom.provinceWrap.find('ul'));

				function isCity(name){
					return that.regionData[1]['lastId_'+(name.split('_')[1])].length < 2;
				}
			}

			function formatCityData(){
				var data = that.regionData[1];
				var newData = {};

				var tmp;
				for(var i=0; i<data.length; i++){
					tmp = newData['lastId_'+data[i].lastId];

					if(tmp === undefined) {
						newData['lastId_'+data[i].lastId] = [];
					}

					newData['lastId_'+data[i].lastId].push({
						checked : false,
						name : data[i].name
					});

				}

				return newData;
			}

			function formatProvinceData(){
				var data = that.regionData[0];
				var newData = {};

				data.sort(function(n,m){return n.sort - m.sort});

				for(var i=0; i<data.length; i++){
					newData['id_'+data[i].id] = data[i].name;
				}

				return newData;
			}
		},
		count : function(){
			var i = 0;
			for(name in this.result){
				this.result[name] && i++;
			}
			this.dom.count.text(i);
			return i;
		},
		formatCheckAll : function(){
			var id = this.config.current;
			var currentProvinceUl = this.dom.cUl.filter('[data-lastid='+id+']');
			var currentProvinceTag = this.dom.pTags.filter('[data-id='+id+']');
			var city = currentProvinceUl.find('li');
			var isAllChecked = true;
			var isNoneChecked = true;

			city.each(function(){
				var tag = $(this);
				if(!tag.hasClass('active')){
					isAllChecked = false;
					isNoneChecked = false;
				}
			});

			this.dom.checkAll.prop('checked',isAllChecked);
			isNoneChecked ? currentProvinceTag.removeClass('active') : currentProvinceTag.addClass('active');

		},
		show : function(data){
			if(!this.isLoaded){return}

			var that = this;
			var mached = {};

			if(data){
				this.clearActive();
				var arr = data.split(',');

				for(var i=0; i<arr.length; i++){
					mached[arr[i]] = false;
				}

				this.dom.pTags.each(function(){
					var tag = $(this);
					for(name in mached){
						if(match(tag,tag.text(),name)){
							mached[name] = true;
						}
					}
				});

				this.dom.cUl.each(function(){
					var id = $(this).data('lastid');
					var currentProvinceTag = that.dom.pTags.filter('[data-id='+id+']');
					var isNoneChecked = true;
					var tags = $(this).find('li');
					tags.each(function(){
						var tag = $(this);
						for(name in mached){
							if(match(tag,tag.text(),name)){
								mached[name] = true;
								isNoneChecked = false;
							}
						}
					});
					isNoneChecked ? currentProvinceTag.removeClass('active') : currentProvinceTag.addClass('active');
				});

				this.result = mached;

				this.count();
			}else if(data !== undefined){
				this.clearActive();
			}
			this.config.dialog.show();

			function match(tag,val1,val2){
				if(val1 === val2){
					tag.addClass('active');
            		return true;
				}else{
					return false;
				}
			}

		},
		clearActive : function(){
			this.result = {};
			this.count();

			this.dom.pTags.removeClass('active');
			this.dom.cUl.find('li').removeClass('active');
		},
		getVal : function(){
			var city = [];
			var total = 0;
			for(name in this.result){
				if(this.result[name]){
					total ++;
					city.push(name);
				}
			}

			return {city :city.join(','), total :total}
		},
		setVal : function(data){
			//var that = this;
			//var arr = data.split(',');
			//if(arr.length > 0 && data != ''){
			//	this.result = (function(){
			//		var res = {};
			//		for(var i=0; i<arr.length; i++){
			//			res[arr[i]] = true;
			//		}
			//		return res;
			//	})();
			//}
            //
			//var result = this.result;
			//this.clearActive();
            //
			//this.dom.cUl.each(function(){
			//	var id = $(this).data('lastid');
			//	var currentProvinceTag = that.dom.pTags.filter('[data-id='+id+']');
			//	var isNoneChecked = true;
			//	var tags = $(this).find('li');
			//	tags.each(function(){
			//		var tag = $(this);
			//		for(name in result){
			//			if(match(tag,tag.text(),name)){
			//				result[name] = true;
			//				isNoneChecked = false;
			//			}
			//		}
			//	});
			//	isNoneChecked ? currentProvinceTag.removeClass('active') : currentProvinceTag.addClass('active');
			//});
            //
			//this.count();

		},
		destroy : function(){
			this.config.tab && this.config.tab.destroy();
			this.config.dialog && this.config.dialog.destroy();

			this.dom.clear.off('click');
			this.dom.checkAll.off('change');
			this.dom.provinceWrap.off('click');
			this.dom.cityWrap.off('click');
			this.dom.wrap.remove();

			for(name in this.dom){
				this.dom[name] = null
			}
			for(name in this.config){
				this.config[name] = null
			}

			this.regionData = null;
			this.result = null;
			this.dom = null;
			this.config = null;
		}
	};

	window.RegionPicker = window.RegionPicker || RegionPicker;
})(window,jQuery);
