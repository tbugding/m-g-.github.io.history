//取随机数
function rnd(n,m){	
	return parseInt(Math.random()*(m-n+1)+n);
}

//数组里是否有某个数
function isInArry(n,arr){	
	for(var i=0;i<arr.length;i++){
		if(n==arr[i]) return true;
	}
	return false;
}

//获取计算样式
function getStyle(o,a){return (o.currentStyle||getComputedStyle(o,false))[a]}

//运动
function startMove(obj,json,options){
	clearInterval(obj.timer);

	options=options||{};
	options.time=options.time||400;
	options.type=options.type||'ease-out';
	
	var start={};
	var dis={};
	var n=0;
	var count=Math.floor(options.time/30);

	for(var name in json){
		if(name=='opacity'){
			start[name]=Math.round(parseFloat(getStyle(obj,name))*100)||100;
		}else{
			start[name]=parseInt(getStyle(obj,name))||0;
		}
		dis[name]=json[name]-start[name];
	}
	
	obj.timer=setInterval(function(){
		n++;
		for(var name in json){
			switch(options.type){
				case 'linear':
					var a=n/count;
					var cur=start[name]+dis[name]*a;
					break;
				case 'ease-out':
					var a=1-n/count;
					var cur=start[name]+dis[name]*(1-a*a*a);
					break;
				case 'ease-in':
					var a=n/count;
					var cur=start[name]+dis[name]*a*a*a;
					break;
			}
			if(name=='opacity'){
				obj.style.opacity=cur/100;
				obj.style.filter='alpha(opacity='+cur+')';
			}else{
				obj.style[name]=cur+'px';
			}
		}
		if(n==count){
			clearInterval(obj.timer);
			options.end && options.end();
		}
	},30)
}

