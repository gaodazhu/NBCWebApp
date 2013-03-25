/** 加上命名空间NBC.Task */
Namespace.register("NBC.Task");
/** 任务阶段编辑累加器 */
NBC.Task.taskStageIndex = 5;
/** 任务编辑累加器 */
NBC.Task.taskIndex = 0;
/** 任务提交结果累加器 */
NBC.Task.result = 0;
/** 任务基本信息tab对象 */
NBC.Task.myTaskBaseListTab = undefined;
/** 任务基本信息表格datagrid对象 */
NBC.Task.myTaskBaseListTable = undefined;
/** 子任务表格datagrid对象 */
NBC.Task.taskInfoListTable = undefined;
/** 任务基本信息的定时刷新器 */
NBC.Task.TaskBaseDatagridTimer = undefined;
/** 子任务列表的定时刷新器 */
NBC.Task.TaskInfoDatagridTimer = undefined;

$(function() {
	/**
	 * 我的任务列表事件
	 */
	$("#myTaskList").click(function() {
		// 判断存不存在我的任务这个标签页，如果有，则选中它，没有就新增一个
		var isExist = $("#contentTabs").tabs("exists", '我的任务');
		if (isExist) {
			$("#contentTabs").tabs("select", '我的任务');
			return;
		}
		$("#contentTabs").tabs("add", {
			title : '我的任务',
			selected : true,
			border : false,
			closable : true
		});
		NBC.Task.myTaskBaseListTab = $("#contentTabs").tabs("getTab", "我的任务");
		// 载入我的任务基本信息列表这个页面，然后把里面的table格式化成easyui的表格样式
		NBC.Task.myTaskBaseListTab.load('taskPage/MyTaskBaseList.html', function() {
			NBC.Task.myTaskBaseListTable = $('#myTaskBaseListTable');
			NBC.Task.myTaskBaseListTable.show().datagrid({
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
				url : 'task_getMyTaskBase.do',
				loadMsg : '数据装载中......',
				onLoadError : function() {
					$.messager.alert('错误提示', '数据加载失败!');
				},
				sortName : 'taskId',
				sortOrder : 'desc',
				remoteSort : true,
				frozenColumns : [[{
					title : '任务编号',
					field : 'taskId',
					checkbox : true,
					align : 'center',
					sortable : true
				},{
					title : '任务名称',
					field : 'taskName',
					width : '100',
					align : 'left'
				}]],
				columns : [[{
					title : '任务创建者',
					field : 'assigner',
					width : '100',
					align : 'center',
					formatter : function(value, rowData, rowIndex) {
						return value.name;
					}
				}, {
					title : '创建时间',
					field : 'createDate',
					width : '150',
					align : 'center',
					formatter : dateFormatter,
					sortable : true
				}, {
					title : '任务提交时间',
					field : 'submitDate',
					width : '150',
					align : 'center',
					formatter : dateFormatter,
					sortable : true
				}, {
					title : '任务开始时间',
					field : 'startDate',
					width : '150',
					align : 'center',
					formatter : dateFormatter,
					sortable : true
				}, {
					title : '任务结束时间',
					field : 'finishDate',
					width : '150',
					align : 'center',
					formatter : dateFormatter,
					sortable : true
				}, {
					title : '任务状态',
					field : 'state',
					width : '60',
					align : 'center',
					formatter : taskStateFormatter,
					sortable : true
				}, {
					title : '任务总进展',
					field : 'progress',
					width : '300',
					formatter : progressFormatter,
					align : 'center',
					sortable : true
				},{
					title : '任务基本描述',
					field : 'description',
					width : '300',
					align : 'left'
				},{
					title : ' ',
					field : ' ',
					width : '10',
					align : 'center'
				}]],
				pagination : true,
				rownumbers : true,
				onDblClickRow : function(rowIndex, rowData) {
					if (!(rowData.submitDate == "" || rowData.submitDate == null || rowData.submitDate == "未知" || rowData.submitDate == undefined)) {
						$("#forDialog").load("taskPage/taskInfoList.html", function(response, status, xhr) {
							if (status != "success") {
								$.messager.show({
									title : '提示',
									msg : '载入失败'
								});
								return;
							}
							NBC.Task.taskInfoListTable = $("#taskInfoListTable");
							var taskInfoListDiv = $("#taskInfoListDiv");
							taskInfoListDiv.dialog({
								title : rowData.taskName + "的子任务信息",
								modal : true,
								onClose : function() {
									NBC.Task.taskInfoListTable = undefined;
									clearInterval(NBC.Task.TaskInfoDatagridTimer);
									taskInfoListDiv.dialog("destroy");
									$("#taskInfoListDiv").remove();
								},
							});
							NBC.Task.taskInfoListTable.show().datagrid({
								title : '',
								border : false,
								width : 'auto',
								height : 'auto',
								striped : false,
								nowrap : true,
								fitColumns : true,
								pageSize : 10,
								pageList : [5, 10],
								url : 'task_getTaskInfoList.do?taskBaseId=' + rowData.taskId,
								onLoadError : function() {
									$.messager.alert('错误提示', '数据加载失败!');
								},
								sortName : 'stageIndex',
								sortOrder : 'asc',
								remoteSort : true,
								frozenColumns : [[{
									title : '任务编号',
									field : 'taskId',
									checkbox : true,
									align : 'center',
									sortable : true
								}, {
									title : '任务类型',
									field : 'type',
									width : '100',
									align : 'left',
									sortable : true
								}, {
									title : '任务阶段',
									field : 'stageIndex',
									width : '100',
									align : 'center',
									formatter : function(value, rowData, rowIndex) {
										return "阶段 " + value;
									},
									sortable : true
								}, {
									title : '任务进度',
									field : 'progress',
									width : '300',
									formatter : progressFormatter,
									align : 'center',
									sortable : true
								}]],
								columns : [[{
									title : '任务大小',
									field : 'size',
									width : '100',
									align : 'center',
									sortable : true
								}, {
									title : '开始时间',
									field : 'startDate',
									width : '150',
									align : 'center',
									formatter : dateFormatter,
									sortable : true
								}, {
									title : '结束时间',
									field : 'finishDate',
									width : '150',
									align : 'center',
									formatter : dateFormatter,
									sortable : true
								}, {
									title : '服务器名',
									field : 'computer',
									width : '100',
									align : 'center',
									formatter : function(value, rowData, rowIndex) {
										if (value == "") {
											return "暂未指定";
										}
										return value.name;
									},
									sortable : true
								}, {
									title : '   ',
									field : 'taskBaseId',
									width : '100',
									align : 'center',
									formatter : function(value, rowData, rowIndex) {
										return "   ";
									}
								}]],
								pagination : true,
								rownumbers : true,
								toolbar : [{
									text : '修复',
									iconCls : 'icon-add',
									handler : function() {
										$.messager.alert('错误提示', '功能暂未实现!');
									}
								}, '-', {
									text : '删除',
									iconCls : 'icon-remove',
									handler : function() {
										$.messager.alert('错误提示', '功能暂未实现!');
									}
								}, '-']
							});
							NBC.Task.taskInfoListTable.datagrid('getPager').pagination({
								displayMsg : '当前显示从{from}到{to}共{total}记录'
							});
							$(".datagrid-header-inner .datagrid-cell").css("text-align", "center");
						});
						NBC.Task.TaskInfoDatagridTimer = setInterval(function() {
							NBC.Task.taskInfoListTable.datagrid("reload", []);
						}, 20000);
						return;
					}
					$("#forDialog").load("taskPage/createTaskStage.html", function(response, status, xhr) {
						if (status != "success") {
							$.messager.show({
								title : '提示',
								msg : '载入失败'
							});
							return;
						}

						$('#source').datagrid({
							singleSelect : true,
							height : 'auto',
							border : false,
							title : '可选任务列表',
							columns : [[{
								field : 'task1',
								width : 150
							}, {
								field : 'task2',
								width : 150
							}, {
								field : 'task3',
								width : 150
							}, {
								field : 'task4',
								width : 150
							}, {
								field : 'task5',
								width : 150
							}, {
								field : 'task6',
								width : 150
							}, {
								field : 'task7',
								width : 150
							}, {
								field : 'task8',
								width : 150
							}, {
								field : 'task9',
								width : 150
							}, {
								field : 'task10',
								width : 150
							}, {
								field : 'task11',
								width : 150
							}, {
								field : 'task12',
								width : 150
							}, {
								field : 'task13',
								width : 150
							}, {
								field : 'task14',
								width : 150
							}, {
								field : 'task15',
								width : 150
							}]]
						});
						$('#source').datagrid('appendRow', {
							task1 : "<div class='taskInfo' typename='testTask'>模拟任务<div class='forTaskInfo'></div></div>",
							task2 : "<div class='taskInfo'>任务 2<div class='forTaskInfo'></div></div>",
							task3 : "<div class='taskInfo'>任务 3<div class='forTaskInfo'></div></div>",
							task4 : "<div class='taskInfo'>任务 4<div class='forTaskInfo'></div></div>",
							task5 : "<div class='taskInfo'>任务 5<div class='forTaskInfo'></div></div>",
							task6 : "<div class='taskInfo'>任务 6<div class='forTaskInfo'></div></div>",
							task7 : "<div class='taskInfo'>任务 7<div class='forTaskInfo'></div></div>",
							task8 : "<div class='taskInfo'>任务 8<div class='forTaskInfo'></div></div>",
							task9 : "<div class='taskInfo'>任务 9<div class='forTaskInfo'></div></div>",
							task10 : "<div class='taskInfo'>任务 10<div class='forTaskInfo'></div></div>",
							task11 : "<div class='taskInfo'>任务 11<div class='forTaskInfo'></div></div>",
							task12 : "<div class='taskInfo'>任务 12<div class='forTaskInfo'></div></div>",
							task13 : "<div class='taskInfo'>任务 13<div class='forTaskInfo'></div></div>",
							task14 : "<div class='taskInfo'>任务 14<div class='forTaskInfo'></div></div>",
							task15 : "<div class='taskInfo'>任务 15<div class='forTaskInfo'></div></div>",
						});

						$('.panel-title').each(function() {
							var title = $(this).html();
							if (title == '可选任务列表') {
								$(this).css({
									"text-align" : "center",
									"background-color" : "white"
								});
							}
						});

						$('.sonTaskDiv1').layout();

						$('.taskInfo').draggable({
							proxy : 'clone',
							revert : true,
							cursor : 'auto',
							onStartDrag : function() {
								$(this).draggable('options').cursor = 'auto';
							},
							onStopDrag : function() {
								$(this).draggable('options').cursor = 'auto';
							}
						});

						$('.taskStageDiv').each(function(index, element) {
							turnToDroppable(this);
						});
						// turnToGrid($('.taskStage'));
						$('.source').droppable({
							accept : '.assigned',
							onDrop : function(e, source) {
								var delIndex = $(source).attr("taskindex");
								$("form[taskindex=" + delIndex + "]").parent().parent().parent().parent().remove();
								source.remove();
							}
						});
					});

					var sonTaskDiv = $("#sonTaskDiv");
					sonTaskDiv.show().dialog({
						title : "子任务列表",
						modal : true,
						onClose : function() {
							NBC.Task.result = 0;
							NBC.Task.taskStageIndex = 5;
							NBC.Task.taskIndex = 0;
							sonTaskDiv.dialog("destroy");
							$("#sonTaskDiv").remove();
						},
						buttons : [{
							text : "新增阶段",
							handler : function() {
								var htmlstr = '<div class="taskStageDiv datagrid-cell" stageid="' + NBC.Task.taskStageIndex + '" style="overflow-y:auto;width: 174px; text-align: left; height: 380px;border:1px solid #ccc" >' + '<div style="width:172px;border-bottom:1px solid #ccc;text-align:center;height:20px">任务阶段 ' + NBC.Task.taskStageIndex + '</div>' + '<table class="taskStage" ></table></div>';
								var htmltd = '<td></td>';
								var drop = turnToDroppable($(htmlstr));
								$(".taskStageTR").each(function() {
									$(this).append($(htmltd).append(drop));
								});
								NBC.Task.taskStageIndex++;
							}
						}, {
							text : "删除阶段",
							handler : function() {
								$.messager.confirm("提示", "将会为您删除最后一个阶段以及其中的任务，请确认!", function(a) {
									if (!a) {
										return;
									}
									$(".taskStageTR").each(function() {
										$(this).find(".edited").each(function(index, element) {
											var delIndex = $(element).attr("taskindex");
											$("form[taskindex=" + delIndex + "]").parent().parent().parent().parent().remove();
										});
										$(this).find("td:last").remove();
									});
									NBC.Task.taskStageIndex--;
								});
							}
						}, {
							text : "编辑任务",
							handler : function() {
								$(".assigned").each(function() {
									$(this).draggable("disable");
									if (!$(this).hasClass("edited")) {
										$(this).click(function() {
											showTaskInfo(this);
										});
									}
								});
							}
						}, {
							text : "拖动任务",
							handler : function() {
								$(".assigned").each(function() {
									$(this).draggable("enable");
								});
							}
						}, {
							text : "提交任务",
							handler : function() {
								var total = $('form').length;
								if (total == 0) {
									$.messager.alert("提示", "请至少指定并编辑一个任务!", "info");
									return;
								}
								$('form').each(function(index, element) {
									if (!$(this).form("validate")) {
										$(this).parent().parent().parent().parent().show();
										return false;
									}
									if (total - 1 == index) {
										$.messager.confirm("提示", "任务即将被提交，请确认!", function(a) {
											if (a) {
												$('form').each(function(index, element) {
													console.info(index);
													submitTaskInfo(this, rowData.taskId);
												});
												setTimeout(function() {
													if (NBC.Task.result == total) {
														$.messager.show({
															title : '提示',
															msg : '任务创建成功！'
														});
														NBC.Task.result = 0;
														NBC.Task.taskStageIndex = 5;
														NBC.Task.taskIndex = 0;
														sonTaskDiv.dialog("destroy");
														$("#sonTaskDiv").remove();
														NBC.Task.myTaskBaseListTable.datagrid('load', []);
													} else {
														$.messager.show({
															title : '提示',
															msg : '任务创建失败！'
														});
														// rollback 任务
														rollbackTask(rowData.taskId);
													}

												}, total * 500);
											}
										});
									}
								});

							}
						}]
					});
				},
				toolbar : [{
					text : '添加',
					iconCls : 'icon-add',
					handler : function() {
						createTaskBase();
					}
				}, '-', {
					text : '修改',
					iconCls : 'icon-edit',
					handler : function() {
						modifyTaskBase();
					}
				}, '-', {
					text : '删除',
					iconCls : 'icon-remove',
					handler : function() {
						deleteTaskBase();
					}
				}, '-', {
					text : '启动',
					iconCls : 'icon-reload',
					handler : function() {
						startTask();
					}
				}, '-']
			});
			NBC.Task.myTaskBaseListTable.datagrid('getPager').pagination({
				displayMsg : '当前显示从{from}到{to}共{total}记录'
			});
			$(".datagrid-header-inner .datagrid-cell").css("text-align", "center");
			// $(".datagrid-view").css("overflow", "auto");
		});
		NBC.Task.TaskBaseDatagridTimer = setInterval(function() {
			var isExist = $("#contentTabs").tabs("exists", '我的任务');
			if (isExist) {
				var tab = $("#contentTabs").tabs('getSelected');
				if (tab == NBC.Task.myTaskBaseListTab) {
					NBC.Task.myTaskBaseListTable.datagrid("reload", []);
					return;
				}
				return;
			}
			clearInterval(NBC.Task.TaskBaseDatagridTimer);
		}, 60000);
	});
});

/**
 * 任务状态格式化
 * 
 * @param value
 * @param rowData
 * @param rowIndex
 * @returns
 */
function taskStateFormatter(value, rowData, rowIndex) {
	if (value == 0) {
		return "未启动";
	}
	if (value == 1) {
		return "已提交";
	}
	if (value == 2) {
		return "已启动";
	}
	if (value == 3) {
		return "已结束";
	}
	return "未知";
}

/**
 * 创建基本任务信息
 */
function createTaskBase() {
	$("#forDialog").load("taskPage/createTaskBase.html", function(response, status, xhr) {
		if (status != "success") {
			$.messager.show({
				title : '提示',
				msg : '载入失败'
			});
			return;
		}
		$.parser.parse("#createTaskBaseForm");
		$("#clientCombobox").combobox({
			url : 'user_getClientCombo.do',
			valueField:'id',  
		    textField:'text'
		});
		var createTaskDiv = $("#createTaskDiv");
		createTaskDiv.show().dialog({
			title : '创建任务基本信息',
			modal : true,
			onClose : function() {
				createTaskDiv.dialog("destroy");
			},
			buttons : [{
				text : "提交",
				handler : function() {
					type = $("#createTaskBaseForm select[name=type]").val();
					var formBase = $("#createTaskBaseForm");
					formBase.form("submit", {
						url : 'task_handlerTaskBase.do?operate=insert',
						success : function(data) {
							data = $.parseJSON(data);
							$.messager.show({
								title : '提示',
								msg : data.message
							});
							createTaskDiv.dialog("destroy");
							NBC.Task.myTaskBaseListTable.datagrid('load', []);
						}
					});
				}
			}]
		});
	});
}

/**
 * 批量删除基本任务信息
 */
function deleteTaskBase() {
	var rows = NBC.Task.myTaskBaseListTable.datagrid("getSelections");
	if (rows.length == 0) {
		$.messager.alert("提示", "您未选择任何项!", "error");
		return;
	}
	$.messager.confirm("提示", "将会删除任务及所有的子任务内容，您确认要删除么?", function(a) {
		if (!a) {
			return;
		}
		for ( var i = 0; i < rows.length; i++) {
			$.ajax({
				url : "task_handlerTaskBase.do",
				dataType : "json",
				type : 'post',
				data : {
					taskId : rows[i].taskId,
					operate : "remove"
				},
				success : function(data) {
					if (data.state) {
						$.messager.show({
							title : '提示',
							msg : '任务已成功删除！',
						});
					}
					NBC.Task.myTaskBaseListTable.datagrid('load', []);
				},
				error : function() {
					$.messager.show({
						title : '提示',
						msg : "任务删除失败，请重试"
					});
				}
			});
		}
	});
}

/**
 * 修改基本任务信息
 */
function modifyTaskBase() {
	var rows = NBC.Task.myTaskBaseListTable.datagrid("getSelections");
	if (rows.length == 0) {
		$.messager.alert("提示", "您未选择任何项!", "error");
		return;
	}
	if (rows.length > 1) {
		$.messager.alert("提示", "您只能选择一项进行更改!", "error");
		return;
	}
	$("#forDialog").load("taskPage/createTaskBase.html", function(response, status, xhr) {
		if (status != "success") {
			$.messager.show({
				title : '提示',
				msg : '载入失败'
			});
			return;
		}
		$.parser.parse("#createTaskBaseForm");
		var createTaskDiv = $("#createTaskDiv");
		var formBase = $("#createTaskBaseForm");
		formBase.form("load", rows[0]);
		createTaskDiv.show().dialog({
			title : '创建任务基本信息',
			modal : true,
			onClose : function() {
				createTaskDiv.dialog("destroy");
			},
			buttons : [{
				text : "提交",
				handler : function() {
					type = $("#createTaskBaseForm select[name=type]").val();
					formBase.form("submit", {
						url : 'task_handlerTaskBase.do?operate=modify&taskId=' + rows[0].taskId,
						success : function(data) {
							data = $.parseJSON(data);
							$.messager.show({
								title : '提示',
								msg : data.message
							});
							createTaskDiv.dialog("destroy");
							NBC.Task.myTaskBaseListTable.datagrid('load', []);
						}
					});
				}
			}]
		});
	});
}

/**
 * 启动任务
 */
function startTask() {
	var rows = NBC.Task.myTaskBaseListTable.datagrid("getSelections");
	if (rows.length == 0) {
		$.messager.alert("提示", "您未选择任何项!", "error");
		return;
	}
	if (rows.length > 1) {
		$.messager.alert("提示", "每次只能启动一个任务!", "error");
		return;
	}
	if (rows[0].state == 0){
		$.messager.alert("提示", "请双击此任务进行创建，然后再启动!", "error");
	}
	if (rows[0].state == 2){
		$.messager.alert("提示", "任务已启动，请不要重复启动!", "info");
	}
	if (rows[0].state == 3){
		$.messager.alert("提示", "亲，任务已经结束啦!", "info");
	}
	$.messager.confirm("提示", "将会启动所选任务，请确认操作！", function(a) {
		if (!a) {
			return;
		}
		$.ajax({
			url : "task_handlerTaskBase.do",
			dataType : "json",
			type : 'post',
			data : {
				taskId : rows[0].taskId,
				operate : "start"
			},
			success : function(data) {
				if (data.state) {
					$.messager.show({
						title : '提示',
						msg : '任务已启动成功！',
					});
				}
				NBC.Task.myTaskBaseListTable.datagrid('load', []);
			},
			error : function() {
				$.messager.show({
					title : '提示',
					msg : "任务启动失败，请重试"
				});
			}
		});
	});
}

/**
 * 提交子任务信息
 * 
 * @param form
 *            任务表单
 * @param taskBaseId
 *            任务基本信息id
 */
function submitTaskInfo(form, taskBaseId) {
	var index = $(".taskInfo[taskindex=" + $(form).attr("taskindex") + "]").parent().attr("stageid");
	$(form).form('submit', {
		url : "task_submitTaskInfo.do?stageIndex=" + index + "&taskBaseId=" + taskBaseId,
		success : function(data) {
			data = $.parseJSON(data);
			if (data.state) {
				NBC.Task.result++;
			}
		},
		error : function() {
			return false;
		}
	});
}

/**
 * 回滚已保存的任务
 * 
 * @param taskBaseId
 */
function rollbackTask(taskBaseId) {
	$.ajax({
		url : "task_handlerTaskBase.do",
		data : {
			taskId : taskBaseId,
			operate : "rollback"
		},
		dataType : "json",
		type : 'post',
		success : function(data) {
			if (data.state) {
				$.messager.show({
					title : '提示',
					msg : "任务已成功回滚,请修改后重新提交！"
				});
			} else {
				$.messager.show({
					title : '提示',
					msg : "任务回滚失败,请手动删除任务基本信息！"
				});
			}
		}
	});
}

/**
 * 显示子任务填写界面
 * 
 * @param obj
 */
function showTaskInfo(obj) {
	var typename = $(obj).attr("typename");
	if ($(obj).hasClass("edited")) {
		return;
	}
	$(obj).find(".forTaskInfo").load("taskPage/" + typename + ".html", function(response, status, xhr) {
		if (status != "success") {
			$.messager.show({
				title : '提示',
				msg : '载入失败'
			});
			return;
		}
		$.parser.parse(obj);
		var forTaskInfo = $(obj).find(".forTaskInfo");
		var taskForm = $(obj).find(".taskForm");
		$(obj).attr("taskindex", NBC.Task.taskIndex);
		taskForm.attr("taskindex", NBC.Task.taskIndex);
		NBC.Task.taskIndex++;
		forTaskInfo.dialog({
			title : '创建子任务',
			modal : true,
			buttons : [{
				text : "确认",
				handler : function() {
					if (taskForm.form("validate")) {
						forTaskInfo.dialog("close");
					}
				}
			}]
		});
		forTaskInfo.dialog("open");
		$(obj).addClass("edited");
		$(obj).click(function() {
			forTaskInfo.dialog("open");
		});

	});
}

/**
 * 把对象变成可接收拖入对象的对象
 * 
 * @param obj
 * @returns
 */
function turnToDroppable(obj) {
	var drop = $(obj).droppable({
		accept : '.taskInfo',
		onDragEnter : function(e, source) {
			$(source).draggable('options').cursor = 'auto';
			$(source).draggable('proxy').css('border', '1px solid red');
			$(this).addClass('over');
		},
		onDragLeave : function(e, source) {
			$(source).draggable('options').cursor = 'auto';
			$(source).draggable('proxy').css('border', '1px solid #ccc');
			$(this).removeClass('over');
		},
		onDrop : function(e, source) {
			if ($(source).hasClass("assigned")) {
				$(this).append(source);
				$(source).attr("stageid", $(this).attr("stageid"));
				$(this).removeClass('over');
				return;
			}
			var c = $(source).clone();
			c.addClass('assigned');
			c.draggable({
				proxy : 'clone',
				revert : true,
				cursor : 'auto',
				onStartDrag : function() {
					$(this).draggable('options').cursor = 'auto';
				},
				onStopDrag : function() {
					$(this).draggable('options').cursor = 'auto';
				}
			});
			$(this).append(c);
			c.attr("stageid", $(this).attr("stageid"));
			$(this).removeClass('over');
		}
	});
	return drop;
}

