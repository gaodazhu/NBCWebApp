/** 加上命名空间NBC.Login */
Namespace.register("NBC.Login");
/** 任务阶段编辑累加器 */
NBC.Login.menuLevel = undefined;

$(function(){
	//检查登录，如果没登录，先让用户登录
	checkLogin();
	
});

/**
 * 检查用户是否登录，如果已登录，那么渲染主页
 */
function checkLogin(){
	$.ajax({
		url : "user_loginCheck.do",
		dataType : "json",
		type : 'post',
		success : function(data) {
			if (!data.state) {
				showLoginDialog();
				return;
			}
			renderHomePage(data.result);
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "系统故障无法登录，请刷新页面"
			});
		}
	});
}

/**
 * 显示登录页面
 */
function showLoginDialog(){
	$("body").load("userPage/login.html",function(){
		$("head").append("<link rel='stylesheet' type='text/css' href='css/login.css' />");
		$("#userLoginDiv").dialog({
			title:"上海烈冰登录",
			top: 100,
			closable: false,
			modal:true
		});
		$("#username").validatebox({
			required:true  
		});
		$("#password").validatebox({
			required:true  
		});
		document.onkeydown = function (e) { 
			var theEvent = window.event || e; 
			var code = theEvent.keyCode || theEvent.which; 
			if (code == 13) {
				$("#userLoginSubmit").click();
			}
		};
		$("#userLoginSubmit").click(function(){
			$("#userLoginForm").form("submit", {
				url : 'user_loginIn.do',
				success : function(data) {
					data = $.parseJSON(data);
					$.messager.show({
						title : '提示',
						msg : data.message
					});
					if(data.state){
						renderHomePage(data.result);
					}
				}
			});
		});
	});
}

/**
 * 渲染首页
 */
function renderHomePage(session){
	$("body").load("novelbioFrame.html",function(){
		$("#welcomeInfo").append("Welcome,"+session[1]+"! |<a href='#' id='loginOut' > log out</a>");
		$.parser.parse();
		$("head").append("<link rel='stylesheet' type='text/css' href='css/novelbioFrame.css' />");
		$("head").append("<link rel='stylesheet' type='text/css' href='css/asider.css' />");
		$("#novelbioFrameDiv").layout();
		NBC.Login.menuLevel = session[2];
		getAndRenderMenu();
	});
}

/**
 * 得到用户有权限的菜单并渲染菜单
 * @param menuLevel 菜单层级
 */
function getAndRenderMenu(){
	$.ajax({
		url : "user_getMenu.do",
		dataType : "json",
		type : 'post',
		data : {
			menuLevel : NBC.Login.menuLevel
		},
		success : function(data) {
			if (!data.state) {
				$.messager.show({
					title : '提示',
					msg : "获取菜单失败，请刷新页面"
				});
				return;
			}
			renderMenu(data.result);
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "获取菜单失败，请刷新页面"
			});
		}
	});
}

/**
 * 渲染菜单 只有两级菜单
 * @param menus 菜单集合
 */
function renderMenu(menus){
	for(var i=0; i < menus.length; i++){
		$("#menuUL").append("<li style='display:none' class='siderLi" + NBC.Login.menuLevel + "'><a class='sider' id='" + menus[i].id + "' href='#'>" + menus[i].funcName + "<span class='siderSpan'></span></a></li>");
	}
	if(NBC.Login.menuLevel == 1){
		change($(".siderLi2"), $(".siderLi1"));
	}else{
		change($(".siderLi1"), $(".siderLi2"));
	}
	$(".sider").hover(function() {
		if (this.iTime == null) {
			this.iTime = null;
			this.iSpeed = 6;
		}
		goTime(this, 30, 1);
	}, function() {
		goTime(this, 6, -1);
	});
}

/**
 * 菜单栏伸缩动画效果
 * @param obj
 * @param iTarget
 * @param toggle
 */
function goTime(obj, iTarget, toggle) {
	if (obj.iTime) {
		clearInterval(obj.iTime);
	}
	obj.iTime = setInterval(function() {
		if (obj.iSpeed === iTarget) {
			clearInterval(obj.iTime);
			obj.iTime = null;
		} else {
			obj.iSpeed += 2 * toggle;
			obj.style.paddingLeft = obj.iSpeed + 'px';
			obj.style.paddingRight = obj.iSpeed + 'px';
		}

	}, 30);
}

/**
 * 改变菜单的特效
 * @param outs 退出的菜单
 * @param ins 进入的菜单
 */
function change(outs, ins) {
	var times = 0;
	for ( var i = outs.length - 1; i >= 0; i--) {
		times = 50 * (outs.length - i);
		hideSider(outs[i], times);
	}
	for ( var j = 0; j < ins.length; j++) {
		showSider(ins[j], 50 * (j + 1) + times + 300);
	}
}

/**
 * 菜单特效淡出
 * @param obj
 * @param times
 */
function hideSider(obj, times) {
	setTimeout(function() {
		$(obj).fadeOut(300);
	}, times);
	setTimeout(function() {
		$(obj).remove();
	}, times+500);
}
/**
 * 菜单特效淡入
 * @param obj
 * @param times
 */
function showSider(obj, times) {
	setTimeout(function() {
		$(obj).fadeIn(300);
	}, times);
}