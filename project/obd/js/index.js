var isFullPage = false,  //正在显示pc版/mobile版
	loadedPC = false,	//加载过pc代码
	loadedMobile = false,  //加载过mobile代码
	mobileSection,  //mobile动画块
	scrollTop,  //滚动条到顶部距离
	pcSection,  //pc动画块
	pcSlide,  //pc横向滚动块
	iSection,  //pc动画快数量
	iSlide,  //pc横向滚动块数量
	timer,
	km; //公里数
$(function(){
	var oHeader = $('#header'),  //页面头部
		oFooter = $('#footer'),  //页面底部
		oFullpage = $('#fullpage'),  //PC版容器
		oMobile = $('#mobile');  //mobile版容器
	function buildFullPage(){
		oFullpage.fullpage({
			verticalCentered: false,
			easing: 'easeOutQuint',
			css3: true,
			navigation: true,
			loopHorizontal: false,
			afterRender: function(){
				pcSection.eq(0).find('.ani01').addClass('ani01Start');
				$('#activityBannerPC').appendTo('body');
			},
			onLeave: function(i,n,d){
				if(n!==iSection){
					oFooter.removeClass('footer_pcShow');
				}
				if(n!==1 && n!==3){
					oHeader.addClass('header_pcHide');
					pcSection.eq(n-1).find('.ani01').addClass('ani01Start');
					pcSection.eq(n-1).find('.ani02').addClass('ani02Start');
					pcSection.eq(n-1).find('.ani03').addClass('ani03Start');
					pcSection.eq(n-1).find('.ani04').addClass('ani04Start');
				}
				if(n===3){
					pcSection.eq(n-1).find('section:eq(0) .ani01').addClass('ani01Start');
					pcSection.eq(n-1).find('section:eq(0) .ani02').addClass('ani02Start');
				}


			},
			onSlideLeave: function(a,n,i,d){
				var now = d === 'right' ? i+1 : i-1;
				pcSlide.eq(now).find('.ani01').addClass('ani01Start');
				pcSlide.eq(now).find('.ani02').addClass('ani02Start');
				pcSlide.eq(now).find('.ani03').addClass('ani03Start');
				pcSlide.eq(now).find('.ani04').addClass('ani04Start');
			},
			afterLoad: function(a,i){
				if(i==iSection){
					oFooter.addClass('footer_pcShow')
				}

				if(i==1){
					oHeader.removeClass('header_pcHide');
				}
			}
		});
	}
	

	

	$(window).on('resize',function(){
		loadIframe(winResize);
	});
	
	function winResize(){

		if(client.width<=720){
			console.log('mobile')
			oHeader.removeClass('header_pc header_pcHide');
			oFullpage.removeClass('fullpage_pc').hide();
			oMobile.removeClass('fullpage_pc').show();
			oFooter.removeClass('footer_pc footer_pcShow');
			if(isFullPage){
				isFullPage = false;
				$.fn.fullpage.destroy('all');
				$('#animation01 .ani01').addClass('ani01Start');
				$('#activityFixed').appendTo('body');
				$('#activityBannerPC').appendTo(oFullpage);
			}
		}else{
			console.log('pc')
			oHeader.addClass('header_pc');
			oFullpage.addClass('fullpage_pc').show();
			oMobile.removeClass('fullpage_pc').hide();
			oFooter.addClass('footer_pc');
			if(!isFullPage){
				$(window).scrollTop(0);//解决mobile滑动到底部，最大化之后pc版底部空白#footer高度的bug
				isFullPage = true;
				buildFullPage();
				
				$('#mobile .ani01.ani01Start').removeClass('ani01Start');
				$('#activityFixed').appendTo('#activityBanner');
			}
			$.fn.fullpage.reBuild();
		}
	}

	loadIframe(winResize);
	function loadIframe(bc){
		if(client.width<=720 && !loadedMobile){
			oMobile.load('index_mobile.html #mobile > *',function(){
				loadedMobile = true;

				$('#animation01 .ani01').addClass('ani01Start');

				oFooter.addClass('ani01 delay08');
				mobileSection = [$('#animation02'),$('#animation03'),$('#animation04'),$('#animation05'),$('#animation06'),$('#animation07'),$('#animation08'),$('#animation09'),$('#animation10'),$('#animation11')];
				$('#activityFixed').appendTo('body');
				$('#activityBannerPC').appendTo(oFullpage);
				bc();
				//getKM();



				//修改微信下下载地址
				if(navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1){
					$('.weixinDL').show().siblings().hide();
				}
			})
		}else if(client.width>720 && !loadedPC){
			oFullpage.load('index_pc.html #fullpage >*',function(){
				loadedPC = true;
				pcSection = $('.section');
				pcSlide = $('.slide');
				iSection = pcSection.length;
				iSlide = pcSlide.length;
				oFooter.removeClass('ani01');
				bc();
				//getKM();
			})
		}else{
			timer = setTimeout(function(){
				clearTimeout(timer)
				bc();
			},100)
		}

	}
	
	
	$('body').on('click','#activityClose',function(){
		$('#activityBanner').hide();
	});

	$('body').on('click','#activityPCClose',function(){
		$('#activityBannerPC').hide();
	})

	$('body').on('click','.mobile_userBoxBtns li',function(){
		var index = $(this).index();
		$('.mobile_userBoxContent').hide();
		$('.mobile_userBoxContent').eq(index).show();
		$(this).addClass('current');
		$(this).siblings().removeClass('current');
	})

	/*手机端动画控制*/
	if(isFullPage){
		$(window).off('scroll',mobileAnimation);
	}else{
		$(window).on('scroll',mobileAnimation);
	}

	function mobileAnimation(){
		scrollTop = $(window).scrollTop();
		mobileSection.forEach(eachBlock);
	}

	function eachBlock(block,i){
		if(scrollTop > block.offset().top-300 && scrollTop < block.offset().top+500){
			block.find('.ani01').addClass('ani01Start');
			if(i == mobileSection.length-1){ // 底部
				oFooter.addClass('ani01Start');
			}
			if(i == 7){
				// #animation09
				setTimeout(function(){
					block.find('.mobile_userBoxTit').addClass('noAnimate');
					block.find('.mobile_userBoxText').addClass('noAnimate');
				},2000)
			}
		}
	}

	//弹出二维码
    var btnQrCode = $('.qrCode_btn');
    
    $('body').on('click','.qrCode_btn',function(){
        var qrCode = $(this).parent().find('.qrCode');
        qrCode.show();
    });
    $('body').on('mouseout','.qrCode_btn',function(){
        var qrCode = $(this).parent().find('.qrCode');
        qrCode.hide();
    });

    //复制网址到剪贴板
    $('body').on('click','#copyToClipBoard',copyToClipBoard)

    function copyToClipBoard(){
        if(window.clipboardData){
            var url = window.clipboardData.setData("Text",window.location.href);
            alert("复制成功");
        }else{
            alert("您的浏览器暂不支持此功能\n您可以在地址栏全选网址，然后按ctrl+c键复制");
        }
    }
    //获取公里数
    //function getKM(){
    //	$.ajax({
	 //   	url: '/obd/km',
	 //   	success : function(data){
	 //   		var json = eval('('+data+')');
	 //   		if(json.code == 200){
	 //   			km=json.msg.split('');
	 //   			km.splice(km.length-3,0,',');
	 //   			km=km.join('')+'万';
	 //   			$('.km').text(km);
	 //   		}
	 //   	}
	 //   });
    //}



    	var imgUrl = "http://box.mapbar.com/img/index_ico_logo.png";
        var lineLink = "http://box.mapbar.com";
        var descContent = "图吧汽车卫士（OBD行车电脑）是由图吧全新推出的一款车主应用软件，为您打造全新的车生活。";
        var shareTitle = "图吧汽车卫士OBD行车电脑";
        var timelineTit = "图吧汽车卫士是由图吧全新推出的车主应用软件，为您打造全新的车生活。"
        var appid = "";

        
        function shareFriend() {
            WeixinJSBridge.invoke('sendAppMessage',{
                "appid": appid,
                "img_url": imgUrl,
                "img_width": "200",
                "img_height": "200",
                "link": lineLink,
                "desc": descContent,
                "title": shareTitle
            }, function(res) {
                //_report('send_msg', res.err_msg);
            })
        }
        function shareTimeline() {
            WeixinJSBridge.invoke('shareTimeline',{
                "img_url": imgUrl,
                "img_width": "200",
                "img_height": "200",
                "link": lineLink,
                "desc": descContent,
                "title": timelineTit
            }, function(res) {
                   //_report('timeline', res.err_msg);
            });
        }
        function shareWeibo() {
            WeixinJSBridge.invoke('shareWeibo',{
                "content": descContent,
                "url": lineLink,
            }, function(res) {
                //_report('weibo', res.err_msg);
            });
        }
        // 当微信内置浏览器完成内部初始化后会触发WeixinJSBridgeReady事件。
        document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
            // 发送给好友
            WeixinJSBridge.on('menu:share:appmessage', function(argv){
                shareFriend();
            });
            // 分享到朋友圈
            WeixinJSBridge.on('menu:share:timeline', function(argv){
                shareTimeline();
            });
            // 分享到微博
            WeixinJSBridge.on('menu:share:weibo', function(argv){
                shareWeibo();
            });
        }, false);
})