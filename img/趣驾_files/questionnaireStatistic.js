$(function(){
	var mainTab = new Tab({
		btnWrap : $('#pageTab_btn'),
		contentWrap : $('#pageTab_content'),
		onAction : function(i){}
	});

	var statisAjax = new Ajax({
		//url: interface.queryNmqPageData,
		url: interface.queryNmqStatisCount,
		dataType: "json",
		data: {
			//noticeId:'8a8a98934dc16f60014dc17111060000',//row.id
			token: global.token
		},
		success: function (data){
			console.log(data)

			if(data.resultCode == 200){
				renderStatis(data.data);

				//for(var i=0;i<data.data.length;i++){
				//	for(var j=0;j<data.data[i].pagingInfo.rows.length;j++) {
				//		console.log(data.data[i].pagingInfo.rows[j].result);
                //
				//	}
				//}
				//var questionsPaging = new Paging({
				//	target : $("#askQuestionPaging"),
				//	float : 'right',
				//	style : {'margin-right':'-2px'},
				//	current : 0,		//当前页索引
				//	total : 6,			//总页数
				//	autoRefresh : false,
				//	onAction : function(n){
				//		if(n >= this.total){
				//			this.current = this.total - 1;
				//		}else if(n < 0){
				//			this.current = 0;
				//		}
                //
				//		this.current = n;
				//		//that.load({page:this.current});
				//		return true;
				//	}
				//});
				//questionsPaging.load();
			}
		}
	});

	var dom = {
		title : $('#surveyName'),
		pushCount : $('#pushCount'),
		viewCount : $('#viewCount'),
		viewTimes : $('#viewTimes'),
		feedback : $('#feedback'),
		duration : $('#duration')
	};

	function renderStatis(data){
		//console.log(data);
	}

	//返回公告管理
	$('#editBack').on('click',function(){
		mainTab.goTo(0);
	});

	//queryCondition
	var qc = {
		//status : null,
		range : null,
		region : null,
		select4s : null,
		//type : null,
		time : null
	};

	initQueryCondition(global.domain); //0:4S店  1:车厂

	function initQueryCondition(domain){

		qc.time = common.timerSlot($('#timerSlot'));

		if(domain == 1){
			qc.range = new ConditionPicker({
				wrap : $('#range'),
				data : [{name:'全部',value:''},{name:'厂家',value:1},{name:'4S店',value:0}],
				defaultCheck : 0,
				onAction : function(i){
					if(i === 0){
						disableCondition(false)
					}else{
						disableCondition(true)
					}
				}
			});

			qc.region = new RegionSelector({
				wrap : $('#rs4'),
				level : 2,
				onSelect : function(val,res,id){  //本次选择的值，本组值，id
					var province,city;

					if(id === 'rs4'){
						if(!res){
							province = val;
							city = '';
						}else{
							var arr = res.split(',');
							province = arr[0];
							city = arr[1];
						}
						query4S(province,city)
					}

				}
			});

			qc.select4s = new Select({
				wrap : $('#deptName')
			});

			$('#range_box').show();
			$('#region').show();
		}

		function disableCondition(bDisabled){
			var target = $('#rs4 select');
			if(bDisabled){
				target.prop('disabled',true)
			}else{
				target.prop('disabled',false)
			}
		}

		function query4S(province,city){
			$.ajax({
				url:interface.DataSearch,
				data:{
					userId:global.userId,
					token:global.token,
					page:0,
					rows:100,
					province:province,
					city:city
				},
				dataType:'json',
				success:function(data){

					if(data.resultCode===200){
						renderSelector(qc.select4s,data.data.rows)

					}else{
						renderSelector(qc.select4s,[])
					}
				},
				error:function(e){
					renderSelector(qc.select4s,[])
				}
			});
		}

		function renderSelector(selector,data){
			//if(data.length < 1){
			//	selector.render([{name:'请选择4s店',value:''}]);
			//}else{
				var arr = [];
				arr.push({
					name : '所有4S店',
					value : ''
				});
				for(var i=0,p; p = data[i]; i++){
					arr.push({
						name : p.name,
						value : p.id
					})
				}

				selector.render(arr);
			//}

		}
	}

	var mainTable = new Table({
		target : $('#mainTable'),
		url : interface.queryNotice,
		rowsName : 'data.rows',
		totalPageName : 'data.totalPages',
		param :{

			page: 0,
			rows: 20,
			userId: global.userId,
			token: global.token,
			template:1,
			sort : 'createTime',
			sortType:0

		},
		onLoaded : function(e){
			console.log(e)
		},
		hasChecker : true,
		hasPaging : true,
		columns : [
			//{title:'data',formatter:function(e) {
			//	return e.data;
			//}},
			{field : 'id',title:'ID',sort:true,hidden:true},
			{field : 'title',title:'标题',sort:true},
			{field : 'auditName',title:'审核人',sort:true},
			{field : 'sourceName',title:'机构名称',sort:true},
			{field : 'auditTime',title:'发布时间',sort:true,formatter:function(val){
				return common.formatTime(val);
			}},
			{field : 'endTime',title:'结束时间',sort:true,formatter:function(e){
				return common.formatTime(e);
			}},
			{title:'操作',align:'center',formatter:function() {
				return '<a data-role="detail" href="javascript:" >查看</a>';
			}}

		],

		event : [
			{
				role : 'detail',
				click : function(e,row){
					dom.title.text(row.title);
					//var id = row.id;
					var id = '8a8a98934dc16f60014dc17111060000';
					statisAjax.send({
						noticeId : id
					});
					mainTab.goTo(1);
				}
			}
		]

	});


	$('#queryBtn').on('click',function(){
		var time = qc.time.getVal().split('-');

		var sourceId,sourceType;

		var data;

		//厂家
		if(global.domain == 1){
			sourceType = qc.range.getVal();
			if(sourceType === ''){
				sourceId = '';
			}else if(sourceType === '1'){
				sourceId = global.deptId;

			}else if(sourceType === '0'){
				sourceId = qc.select4s.getVal() ? qc.select4s.getVal() : '';
			}

		//4S店
		}else{
			sourceType = 0;
			sourceId = global.deptId;
		}

		data = {
			status : 3,
			startTime : time[0],
			endTime : time[1],
			type : '',
			sourceType: sourceType,
			sourceId: sourceId
		};

		console.log(data);
		mainTable.load(data)

	}).trigger('click');
});
