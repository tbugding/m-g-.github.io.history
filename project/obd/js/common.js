
//获取屏幕宽高和用户代理
var client = {
	width : 0,
	height : 0,
	UA : ''
};
function getClient(){
	client.width = document.documentElement.clientWidth;
	client.height = document.documentElement.clientHeight;
}
getClient();
client.UA = window.navigator.userAgent;
if(client.UA.indexOf('MSIE 9')!=-1){
	$('<style>.ani01,.ani02,.ani03,.ani04{opacity:1;-ms-transform:scale(1);}</style>').appendTo('body')
}
$(window).on('resize',getClient);

$(function(){
	var nav = $('.nav');
	var navBtn = $('.nav_btn');
	var header = $('#header');
	var pageWrap = $('#pageWrap');
	var navBtnMask = $('#nav_btnMask');
	//原生click事件，JQ事件发现一次点击触发多次事件bug
	navBtn.get(0).onclick=function(){
		header.toggleClass('show');
		pageWrap.toggleClass('show');
	};
	$('body').on('click',function(e){
		if( header.hasClass('show') && e.target !== nav[0] && e.target !== navBtnMask[0]){
			header.removeClass('show');
			pageWrap.removeClass('show');
		}
	});
})

//ie8一下浏览器的forEach
if (!Array.prototype.forEach) {  
    Array.prototype.forEach = function(callback, thisArg) {  
        var T, k;  
        if (this == null) {  
            throw new TypeError(" this is null or not defined");  
        }  
        var O = Object(this);  
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32  
        if ({}.toString.call(callback) != "[object Function]") {  
            throw new TypeError(callback + " is not a function");  
        }  
        if (thisArg) {  
            T = thisArg;  
        }  
        k = 0;  
        while (k < len) {  
            var kValue;  
            if (k in O) {  
                kValue = O[k];  
                callback.call(T, kValue, k, O);  
            }  
            k++;  
        }  
    };  
}

//判断微信
function isWeixin(){
    return (navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1);
}  