// 声明一个全局对象Namespace，用来注册命名空间
Namespace = new Object();

// 全局对象仅仅存在register函数，参数为名称空间全路径，如"Grandsoft.GEA"
Namespace.register = function(fullNS) {
	// 将命名空间切成N部分, 比如Grandsoft、GEA等
	var nsArray = fullNS.split('.');
	var sEval = "";
	var sNS = "";
	for ( var i = 0; i < nsArray.length; i++) {
		if (i != 0)
			sNS += ".";
		sNS += nsArray[i];
		// 依次创建构造命名空间对象（假如不存在的话）的语句
		// 比如先创建Grandsoft，然后创建Grandsoft.GEA，依次下去
		sEval += "if (typeof(" + sNS + ") == 'undefined') " + sNS + " = new Object();"
	}
	if (sEval != "")
		eval(sEval);
}

/**
 * 进度条格式化类
 * 
 * @param value
 *            只能任务进度值 0－100之间,大于100就是失败，100是成功 0是等待
 * @param rowData
 *            此行的数据对象
 * @param rowIndex
 *            此行的索引，第一行是0，第二行是1，以些类推
 * @returns {String}
 */
function progressFormatter(value, rowData, rowIndex) {
	var htmlstr = null;
	if (value == 100) {
		htmlstr = "<div class='easyui-progressbar progressbar' value='" + value + "' style='width: 285px;'><div class='progressbar-text' style='width: 285px;position:relative;margin-bottom:-18px'>任务已完成</div><div class='progressbar-value' style='width:" + value + "%;background-color:rgba(15, 218, 31, 0.59);'>&nbsp;</div></div>";
		return htmlstr;
	}
	if (value > 100) {
		value = 100;
		htmlstr = "<div class='easyui-progressbar progressbar' value='" + value + "' style='width: 285px;'><div class='progressbar-text' style='width: 285px;position:relative;margin-bottom:-18px'>任务失败</div><div class='progressbar-value' style='width:" + value + "%;background-color:rgba(95, 91, 91, 0.59);'>&nbsp;</div></div>";
		return htmlstr;
	}
	if (value == 0) {
		htmlstr = "<div class='easyui-progressbar progressbar' value='" + value + "' style='width: 285px;'><div class='progressbar-text' style='width: 285px;position:relative;margin-bottom:-18px'>等待中</div><div class='progressbar-value' style='width:" + value + "%;background-color:#FF9933;'>&nbsp;</div></div>";
		return htmlstr;
	}
	htmlstr = "<div class='easyui-progressbar progressbar' value='" + value + "' style='width: 285px;'><div class='progressbar-text' style='width: 285px;position:relative;margin-bottom:-18px'>任务进度" + value + "%</div><div class='progressbar-value' style='width:" + value + "%;background-color:rgba(240, 28, 9, 0.59);'>&nbsp;</div></div>";
	return htmlstr;
}

/**
 * 日期格式化工具
 * 
 * @param value
 * @param rowData
 * @param rowIndex
 * @returns
 */
function dateFormatter(value, rowData, rowIndex) {
	if (value == "") {
		return '未知';
	}
	return value;
}

/**
 *	屏蔽f5刷新 
 */
function unableF5(){
	$(document).bind("keydown", function(e) {
		e = window.event || e;
		if (e.keyCode == 116) {
			e.keyCode = 0;
			return false; // 屏蔽F5刷新键
		}
	});
}

/**
 * validatebox扩展
 */
$.extend($.fn.validatebox.defaults.rules, {
	// ip地址验证
	ipValid : {
		validator : function(value, param) {
			var result = false;
			var dataArray = value.split(".");
			if (dataArray.length == 4) {
				var num = 0;
				var index = 0;
				for ( var i = 0; i < 4; i++) {
					if (dataArray[i] != "") {
						num = Number(dataArray[i]);
						if (num <= 255 && num >= 0) {
							index++;
						}
					}
				}

				if (index == 4) {
					result = true;
				}
			}

			return result;
		},
		message : "格式不正确，例：192.168.1.1,数字大小不超过255"
	},

	// 正则表达式验证
	custRegExp : {
		validator : function(value, param) {
			var regExp = new RegExp(eval(param[0]));

			return regExp.test(value);
		},
		message : ""
	},

	// 整数判断
	// 事例：
	// intValid[9],intValid[,9] 表示最小值为9
	// intValid[0,9] 表示取值范围为0-9
	// intValid[,9] 表示最大值为9
	intValid : {
		validator : function(value, param) {
			// 先验证是否为整数
			var regExp = new RegExp(/^-?\d+$/);
			if (!regExp.test(value)) {
				$.fn.validatebox.defaults.rules.intValid.message = "只能输入整数";
				return false;
			}

			var isValueCorrect = true; // 判断指定值是否在某一范围内
			if (param != null) {
				switch (param.length) {
					case 1 : // intValid[9] 表示最小值为9
						isValueCorrect = (value >= param[0]);
						$.fn.validatebox.defaults.rules.intValid.message = "最小值为{0}";
						break;

					case 2 :
						if (typeof (param[0]) == "undefined") { // intValid[,9]
																// 表示最大值为9
							isValueCorrect = (value <= param[1]);
							$.fn.validatebox.defaults.rules.intValid.message = "最大值为{1}";
						} else if (typeof (param[1]) == "undefined") { // intValid[9,]
																		// 表示最小值为9
							isValueCorrect = (value >= param[0]);
							$.fn.validatebox.defaults.rules.intValid.message = "最小值为{0}";
						} else { // intValid[0,9] 表示取值范围为0-9
							isValueCorrect = ((value >= param[0]) && (value <= param[1]));
							$.fn.validatebox.defaults.rules.intValid.message = "范围为{0}到{1}";
						}
						break;

					defalut : isValueCorrect = true;
			}
		}

		return isValueCorrect;
	},
	message : ""
	}
});

/**
 * 动态加载js和样式
 */
$.extend({
    includePath: '',
    include: function(file)
    {
        var files = typeof file == "string" ? [file] : file;
        for (var i = 0; i < files.length; i++)
        {
            var name = files[i].replace(/^\s|\s$/g, "");
            var att = name.split('.');
            var ext = att[att.length - 1].toLowerCase();
            var isCSS = ext == "css";
            var tag = isCSS ? "link" : "script";
            var attr = isCSS ? " type='text/css' rel='stylesheet' " : " language='javascript' type='text/javascript' ";
            var link = (isCSS ? "href" : "src") + "='" + $.includePath + name + "'";
            if ($(tag + "[" + link + "]").length == 0) document.write("<" + tag + attr + link + "></" + tag + ">");
        }
    }
});