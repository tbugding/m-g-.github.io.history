//global.js
var maplet; //地图
$(function(){

	window.global = {
		userId : undefined,  //用户id
		userName : undefined,  //用户名
		userMail : undefined,  //用户邮箱
		token : undefined,	 //token
		deptId : undefined,  //所属机构ID
		domain : undefined,  //厂家、4S店

		navBtns : null,	//侧导航按钮
		navData : null,	//侧导航数据

		mainContent : $('#mainContent'),	//页面容器
		logo : $('#logo'),
		mail : $('#mail'),
		logout : $('#logout'),

		currentPage : -1,
		urlSearch : common.search(),
		reloadInfo : false,
		menuStyle : [],

		//加载页面数据
		loadPage : function(url){
			$.ajax({
				url : url,
				success : function(data){
					var html = $(data).find('#mainContent').html();
					global.mainContent.html(html);

				}
			})
		},

		//加载导航数据
		loadInfo : function(){
			var isLocalData = config.nav ? true : false;
			$.ajax({
				url : config.nav ? config.nav : interface.getMyMenus,
				type : 'post',
				data : {
					token : global.token,
					userid : global.userId
				},
				success : function(data){
					if(isLocalData){
						localStorage.navData = JSON.stringify(data);
						global.navData = data;

					}else{
						localStorage.navData = JSON.stringify(data.data);
						global.navData = data.data;
					}
					global.formatPage();

				},
				error : function(e){
					if(e.status === 401){
						common.confirm('请重新登录。',function(){
							global.logout.trigger('click');
							//location.href = 'login.html';
						})
					}
				}
			})
		},

		//创建导航
		formatPage : function(){
			//创建导航dom
			$('#sidebar_nav').html(function(){
				var html = '';
				var length = global.navData.length;

				global.menuStyle = new Array(length);
				try{
					global.menuStyle = (localStorage.menuStyle && JSON.parse(localStorage.menuStyle).splice(0,length)) || global.menuStyle;
				}catch(e){}

				for( var i=0; i<length; i++){
					var dd = '';
					var children = global.navData[i].subMenus;
					var child;
					if(global.menuStyle[i]){
						for(var j=0; j<children.length; j++){
							child = children[j];
							if(child.name.length > 9){
								dd += '<dd><a class="'+child.iconClass+'" style="letter-spacing: -1px;" href="javascript:;" data-url="'+child.url+'">'+child.name+'</a></dd>';

							}else{
								dd += '<dd><a class="'+child.iconClass+'" href="javascript:;" data-url="'+child.url+'">'+child.name+'</a></dd>';
							}
						}
						html += '<li><dl><dt class="active">'+global.navData[i].name+'<img src="images/sidebar_ico2.png"/></dt>'+dd+'</dl></li>';
					}else{
						for(var j=0; j<children.length; j++){
							child = children[j];
							if(child.name.length > 9){
								dd += '<dd style="display: none;"><a class="'+child.iconClass+'" style="letter-spacing: -1px;" href="javascript:;" data-url="'+child.url+'">'+child.name+'</a></dd>';

							}else{
								dd += '<dd style="display: none;"><a class="'+child.iconClass+'" href="javascript:;" data-url="'+child.url+'">'+child.name+'</a></dd>';
							}
						}
						html += '<li><dl><dt>'+global.navData[i].name+'<img src="images/sidebar_ico2.png"/></dt>'+dd+'</dl></li>';
					}

				}
				return html;
			});

			//导航按钮绑定事件
			global.navBtns = $('#sidebar_nav dd a');

			global.navBtns.on('click',function(){
				var index = 0;
				while(this !== global.navBtns[index]){
					index ++;
				}

				var location = window.location;

				location.href = '?page=' + index;

			});

			//加载页面
			global.currentPage = (function(){
				var cPage = parseInt(global.urlSearch.page);

				if(isNaN(cPage)){
					return -1;
				}else{
					if(cPage >= global.navBtns.length || cPage < 0){
						return -1;
					}else{
						return cPage;
					}
				}
			})();
			if(global.currentPage === -1){
				global.loadPage(config.defaultPage);
			}else{
				global.loadPage(global.navBtns.eq(global.currentPage).data('url'));
				global.navBtns.eq(global.currentPage).addClass('active');
			}

			//导航菜单切换
			$('#sidebar_nav dt').on('click',function(){
				var $this = $(this);
				var index = $this.parents('li').index();
				$this.toggleClass('active');
				$this.siblings().toggle();
				global.menuStyle[index] = !global.menuStyle[index];
				localStorage.menuStyle = JSON.stringify(global.menuStyle);
			});
		},

		//返回默认页面
		toDefaultPage : function(){
			location.href = '?page=-1';
		},

		//退出登录
		toLogout : function(){
			common.deleteUserInfo();
			location.replace('login.html');
			delete localStorage.menuStyle
		}
	};

	//获取用户数据
	common.getUserInfo();

	if(localStorage.navData === undefined || global.reloadInfo){
		//请求导航数据再formatPage();
		global.loadInfo();

	}else{
		//从localStorage获得导航数据然后formatPage();
		global.navData = $.parseJSON(localStorage.navData);
		global.formatPage();

	}

	//logo和用户名点击跳转到默认页面
	global.logo.add(global.mail).on('click',global.toDefaultPage);

	//退出登录
	global.logout.on('click',global.toLogout);

	global.mail.text(global.userMail)

});

