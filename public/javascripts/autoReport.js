// JavaScript Document
$(function() {
	var myReportListTable = undefined;
	$.ajaxSettings.cache = false;

	/**
	 * 我的报告列表
	 */
	$('#myReportList').click(function() {
		var isExist = $("#contentTabs").tabs("exists", '我的报告');
		if (isExist) {
			$("#contentTabs").tabs("select", '我的报告');
			return;
		}
		$("#contentTabs").tabs("add", {
			title : '我的报告',
			selected : true,
			border : false,
			closable : true
		});
		var myReportListTab = $("#contentTabs").tabs("getTab", "我的报告");

		myReportListTab.load('reportPage/MyReportList.html', function() {
			myReportListTable = $('#myReportListTable');
			myReportListTable.show();
			myReportListTable.datagrid({
				title : '',
				border : false,
				width : 'auto',
				height : 'auto',
				fitColumns : 'true',
				pageSize : 10,
				pageList : [5, 10, 15, 20, 25, 30],
				nowrap : true,
				striped : false,
				collapsible : true,
				url : 'report_getMyReport.do',
				loadMsg : '数据装载中......',
				onLoadError : function() {
					$.messager.alert('错误提示', '数据加载失败!');
				},
				idField : "id",
				sortName : 'id',
				sortOrder : 'asc',
				remoteSort : true,
				frozenColumns : [[{
					field : 'ck',
					checkbox : true,
					align : 'center'
				}]],
				columns : [[{
					title : '报告编号',
					field : 'id',
					width : '80',
					rowspan : 1,
					align : 'center',
					sortable : true
				}, {
					title : '报告名称',
					field : 'name',
					width : '150',
					rowspan : 1,
					align : 'left'
				}, {
					title : '创建时间',
					field : 'createTime',
					width : '200',
					rowspan : 1,
					align : 'center'
				}]],
				pagination : true,
				rownumbers : true,
				toolbar : [{
					text : '添加',
					iconCls : 'icon-add',
					handler : function() {
						addReport();
					}
				}, '-', {
					text : '修改',
					iconCls : 'icon-edit',
					handler : function() {

					}
				}, '-', {
					text : '删除',
					iconCls : 'icon-remove',
					handler : function() {

					}
				}, '-']
			});
			myTaskBaseListTable.datagrid('getPager').pagination({
				displayMsg : '当前显示从{from}到{to}共{total}记录'
			});
			$(".datagrid-header-inner .datagrid-cell").css("text-align", "center");
		});
	});
});

/**
 * 重命名报告
 */
function renameReport() {
	var reportId = $(this).next().next().next().next().val();
	$("#reNameReportDiv").css('display', 'block');
	$('#reNameReportDiv').dialog({
		title : '重命名报告',
		collapsible : true,
		closed : true,
		modal : true,
		buttons : [{
			text : '提交',
			handler : function() {
				var newName = $("#newReportName").val();
				if (newName == "") {
					jQuery.messager.alert('提示:', "请输入报告的新名称！", 'info');
				} else {
					$.ajax({
						type : "POST", // http请求方式
						url : "report_renameReport.do?reportId=" + reportId + "&newName=" + newName,
						dataType : "json", // 告诉JQuery返回的数据格式
						error : function() {
							$.messager.alert('警告', '出错啦', 'Warning');
						},
						success : function(data) {
							$('#reNameReportDiv').dialog('close');
							jQuery.messager.alert('提示:', data.message, 'info', function() {
								$('#autoReport').click();
							});
						}
					});
				}
			}
		}, {
			text : '关闭',
			handler : function() {
				$('#reNameReportDiv').dialog('close');
			}
		}]
	});
	$('#reNameReportDiv').dialog('open');
}

/**
 * 上传生成报告
 */
function addReport() {
	$('#fileUploadDiv').show();
	$('#fileUploadDiv').dialog({
		title : '上传模板生成报告',
		collapsible : true,
		closed : false,
		modal : true,
		buttons : [{
			text : '提交',
			id : 'submitBtn',
			handler : function() {
				var file = $("#upfileReport").val();
				if (file == "") {
					jQuery.messager.alert('提示:', "Please Choose file！", 'info');
				} else {
					jQuery.messager.alert('提示:', "Upload Successed！Please wait for the result!", 'info');
					$('#submitBtn').hide();
					$('#closeDialog').hide();
					$('#submitting').show();
					$.ajaxFileUpload({
						url : 'report_uploadReport.do', // 需要链接到服务器地址
						secureuri : false,
						fileElementId : 'upfileReport', // 文件选择框的id属性
						dataType : 'json', // 服务器返回的格式
						error : function(data, status, e) {
							jQuery.messager.alert('警告:', '出错啦，请刷新页面后重试', 'Warning');
						},
						success : function(data) // 相当于java中try语句块的用法
						{
							jQuery.messager.alert('提示:', data.message, 'info');
							$('#fileUploadDiv').dialog('close');
							$("#autoReport").click();
						}
					});
				}
			}
		}, {
			text : '关闭',
			id : 'closeDialog',
			handler : function() {
				$('#fileUploadDiv').dialog('close');
			}
		}, {
			text : '提交中...',
			id : 'submitting',
			handler : function() {
				jQuery.messager.alert('提示:', '提交中，请稍候...', 'info');
			}
		}]
	});
	$('#submitting').hide();
	$('#fileUploadDiv').dialog('open');
}

/**
 * 替换报告
 */
function replaceReport() {
	var reportId = $(this).next().next().next().val();
	$('#replaceReportDiv').css('display', 'block');
	$('#replaceReportDiv').dialog({
		title : '上传模板生成报告',
		collapsible : true,
		closed : true,
		modal : true,
		buttons : [{
			text : '提交',
			id : 'submitBtn1',
			handler : function() {
				var file = $("#replaceUpfile").val();
				if (file == "") {
					jQuery.messager.alert('提示:', "Please Choose file！", 'info');
				} else {
					$('#submitBtn1').hide();
					$('#closeDialog1').hide();
					$('#submitting1').show();
					$.ajaxFileUpload({
						url : 'report_replaceReport.do', // 需要链接到服务器地址
						secureuri : false,
						fileElementId : 'replaceUpfile', // 文件选择框的id属性
						dataType : 'json', // 服务器返回的格式
						data : {
							"reportId" : reportId
						},
						error : function(data, status, e) {
							jQuery.messager.alert('警告:', '出错啦，请刷新页面后重试', 'Warning');
						},
						success : function(data) // 相当于java中try语句块的用法
						{
							jQuery.messager.alert('提示:', data.message, 'info');
							$('#replaceReportDiv').dialog('close');
							$("#autoReport").click();
						}
					});
				}
			}
		}, {
			text : '关闭',
			id : 'closeDialog1',
			handler : function() {
				$('#replaceReportDiv').dialog('close');
			}
		}, {
			text : '提交中...',
			id : 'submitting1',
			handler : function() {
				jQuery.messager.alert('提示:', '提交中，请稍候...', 'info');
			}
		}]
	});
	$('#submitting1').hide();
	$('#replaceReportDiv').dialog('open');
}

/**
 * 删除报告
 */
function delReport() {
	var reportId = $(this).next().next().val();
	$.messager.confirm('删除报告', '你确定要删除这份报告?', function(data) {
		if (data) {
			$.ajax({
				type : "POST", // http请求方式
				url : "report_deleteReport.do?reportId=" + reportId,
				dataType : "json", // 告诉JQuery返回的数据格式
				error : function() {
					$.messager.alert('警告', '出错啦', 'Warning');
				},
				success : function(data) {
					$.messager.alert('提示:', data.message, 'info', function() {
						$("#autoReport").click();
					});
				}
			});
		}
	});
}

/**
 * 下载报告
 */
function downloadReport() {
	var reportId = $(this).next().val();
	var f = document.createElement("form");
	document.body.appendChild(f);
	var i = document.createElement("input");
	i.type = "hidden";
	f.appendChild(i);
	i.value = reportId;
	i.name = "reportId";
	f.action = "report_downloadReport.do";
	f.method = "post";
	f.submit();
}
