// JavaScript Document

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
 * 框架界面
 */
$(function() {
	$.ajaxSettings.cache = false;
	$("#novelbioFrameDiv").layout();
	$(".siderA").hover(function() {
		if (this.iTime == null) {
			this.iTime = null;
			this.iSpeed = 6;
		}
		goTime(this, 30, 1);
	}, function() {
		goTime(this, 6, -1);
	});

});

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

function hideSider(obj, times) {
	setTimeout(function() {
		$(obj).fadeOut(300);
	}, times);
}

function showSider(obj, times) {
	setTimeout(function() {
		$(obj).fadeIn(300);
	}, times);
}
