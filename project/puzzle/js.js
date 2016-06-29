window.onload=function(){
	var oImg=document.getElementById('bottom');
	var aImg=oImg.getElementsByTagName('img');	//关卡图片
	for(var i=0; i<aImg.length; i++){	//给图片添加关卡
		(function(index){
			aImg[index].onclick=function(){
				var n=index+1;
				start(n);
			}
		})(i);
	}
	start('1');	//默认初始化第一关卡
}

function start(n){
	var oCont=document.getElementById('wall');	//拼图容器
	oCont.className='start'+n;	//通过给容器加class切换关卡
	oCont.style.cssText='';
	oCont.innerHTML='';

	//创建拼图块
	var aLi=document.createDocumentFragment();
	var arr=[];
	while(arr.length<24){
		var n=rnd(1,24);
		if(isInArry(n,arr)){
			continue;
		}else{
			var oLi=document.createElement('li');
			arr.push(n);
			oLi.className='b'+n;
			aLi.appendChild(oLi);
		}
	}
	oCont.appendChild(aLi);

	//布局转换,添加拖拽和换位
	var aDiv=oCont.children;
	for(var i=0; i<aDiv.length; i++){
		aDiv[i].style.top=aDiv[i].offsetTop+1+'px';
		aDiv[i].style.left=aDiv[i].offsetLeft+1+'px';
		drag(aDiv[i]);
	}
	for(var i=0; i<aDiv.length; i++){
		aDiv[i].style.position='absolute';
	}

	function getClosed(arr){ //找到距离最小块的索引
		var index=0;
		for(var i=0;i<arr.length; i++){
			if(arr[index].dis>arr[i].dis){
				index=i;
			}
		}
		return index;
	}

	function isDown(){	//是否完成拼图
		var arr=oCont.children;
		for(var i=0;i<arr.length;i++){
			var s=arr[i].className;
			if(!(s.substring(1)==i+1)){
				return false;
			}
		}
		return true;
	}

	var dragable=true;
	function drag(obj){	//拖拽和换位
		var oBlock=obj;//当前拖拽的block
		oBlock.onmousedown=function(e){
			if(!dragable) return;
			var oEvent=e||event;

			//当前拖拽块的状态（鼠标按下）
			oBlock.style.zIndex='2';
			oBlock.style.opacity='0.7';
			var oldL=oBlock.offsetLeft;
			var oldT=oBlock.offsetTop;
			var disX=oEvent.clientX-oBlock.offsetLeft;
			var disY=oEvent.clientY-oBlock.offsetTop;

			//其他块的状态
			var aOthers=[];
			for(var i=0; i<aDiv.length; i++){
				if(aDiv[i]==oBlock)continue;
				aDiv[i].left=aDiv[i].offsetLeft;
				aDiv[i].top=aDiv[i].offsetTop;
				aDiv[i].right=aDiv[i].offsetLeft+aDiv[i].offsetWidth;
				aDiv[i].bottom=aDiv[i].offsetTop+aDiv[i].offsetHeight;
				aDiv[i].cY=aDiv[i].offsetTop+aDiv[i].offsetHeight/2;
				aDiv[i].cX=aDiv[i].offsetLeft+aDiv[i].offsetWidth/2;
				aOthers.push(aDiv[i]);
			}

			var closeBlock;	//定义距离最小的块

			document.onmousemove=function(e){
				//计算当前托拽块的状态（拖动）
				var oEvent=e||event;
				var l=oEvent.clientX-disX;
				var t=oEvent.clientY-disY;
				oBlock.style.left=l+'px';
				oBlock.style.top=t+'px';
				var thisBlock={
					left:oBlock.offsetLeft,
					top:oBlock.offsetTop,
					right:oBlock.offsetLeft+oBlock.offsetWidth,
					bottom:oBlock.offsetTop+oBlock.offsetHeight,
					cY:oBlock.offsetTop+oBlock.offsetHeight/2,
					cX:oBlock.offsetLeft+oBlock.offsetWidth/2
				};

				//获得所有有接触的块
				var tachArr=[];
				for(var i=0; i<aOthers.length; i++){
					if(thisBlock.left>aOthers[i].right-30||thisBlock.top>aOthers[i].bottom-30||thisBlock.right<aOthers[i].left+30||thisBlock.bottom<aOthers[i].top+30){
						//FALSE
						// aOthers[i].style.cssText='';
						aOthers[i].style.boxShadow='';
						aOthers[i].style.zIndex='';
					}else{
						//TRUE
						var y=thisBlock.cY-aOthers[i].cY;
						var x=thisBlock.cX-aOthers[i].cX;
						aOthers[i].dis=Math.sqrt(y*y+x*x);
						tachArr.push(aOthers[i]);
					}
				}

				//在有接触的块里，获得距离最小的块closeBlock
				if(tachArr.length){
					for(var j=0; j<tachArr.length; j++){
						// tachArr[j].style.cssText=''
						tachArr[j].style.boxShadow='';
						tachArr[j].style.zIndex='';
					}
					closeBlock=tachArr[getClosed(tachArr)];
					closeBlock.style.boxShadow='0 0 20px #02FF6D';
					closeBlock.style.zIndex='1';
				}else{
					closeBlock=null;
				}
			};
			document.onmouseup=function(){
				//存在距离最小块，则交换位置
				if(closeBlock){
					var oI=document.createElement('i');
					oCont.insertBefore(oI,oBlock);
					oCont.insertBefore(oBlock,closeBlock);
					oCont.insertBefore(closeBlock,oI);
					oCont.removeChild(oI);
					// closeBlock.style.cssText='';
					var t=closeBlock.offsetTop;
					var l=closeBlock.offsetLeft;

					dragable=false;
					startMove(oBlock,{top:t+1,left:l+1})
					startMove(closeBlock,{top:oldT+1,left:oldL+1},{end:function(){
						closeBlock.style.zIndex='';
						oBlock.style.opacity='';
						oBlock.style.zIndex='';
						dragable=true;

						//是否完成拼图
						if(isDown()){
							alert('恭喜!!\n拼图已经完成')
							oCont.style.background='url(img/img'+oCont.className.substring(5)+'.jpg) center center no-repeat #000'
							oCont.style.boxShadow='0 0 10px #02FF6D'
							oCont.style.padding='0'
							oCont.style.height=602+'px'
							oCont.style.width=902+'px'
							oCont.innerHTML=''
						}
					}})
					closeBlock.style.boxShadow='';
					// closeBlock.style.zIndex='1';
					oBlock.style.opacity=1;
				}else{
					dragable=false;
					startMove(oBlock,{top:oldT+1,left:oldL+1},{end:function(){
						dragable=true;
					}});
					oBlock.style.opacity='';
					oBlock.style.zIndex='';
				}
				// oBlock.style.cssText='';
				document.onmousemove=null;
				document.onmouseup=null;
				oBlock.releaseCapture&&oBlock.releaseCapture();

				
			};
			oBlock.setCapture&&oBlock.setCapture();
			return false;
		}
	}
}