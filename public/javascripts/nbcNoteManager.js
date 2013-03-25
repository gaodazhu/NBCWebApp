/** 定义一个全局的computerListTable,前面加上命名空间NBC.Computer */
Namespace.register("NBC.Note");
NBC.Note.noteListTable = undefined;
NBC.Note.noteContentDiv = undefined;
NBC.Note.editingRow = undefined;
NBC.Note.editor = undefined;
NBC.Note.noteHistoryListTable = undefined;
/**
 * 用户管理js
 */
$(function() {
	$("#nbcNote").click(function() {
		var isExist = $("#contentTabs").tabs("exists", '云笔记');
		if (isExist) {
			$("#contentTabs").tabs("select", '云笔记');
			return;
		}
		$("#contentTabs").tabs("add", {
			title : '云笔记',
			selected : true,
			border : false,
			closable : true
		});
		var userManagerTab = $("#contentTabs").tabs("getTab", "云笔记");
		userManagerTab.load('nbcNotePage/nbcNote.html', function() {
			$("#nbcNoteManagerDiv").layout();
			$('#noteSearchBox').searchbox({
				searcher : function(value, name) {
					NBC.Note.renderDatagrid('note_searchNoteList.do?name=' + name + '&value=' + value);
				},
				menu : '#noteSearchCondition',
				prompt : '请输入关键字'
			});
			NBC.Note.renderDatagrid('note_searchNoteList.do');
			$("#noteToolbar").datagrid({
				toolbar : [{
					text : '新建笔记',
					iconCls : 'icon-add',
					handler : function() {
						if (NBC.Note.editingRow != undefined) {
							$.messager.alert('提示', '请先保存或取消正在编辑的笔记!');
							return;
						}
						NBC.Note.noteListTable.datagrid('insertRow', {
							index : 0, // index start with 0
							row : {
								title : '未命名',
							}
						});
						NBC.Note.noteListTable.datagrid('beginEdit', 0);
					}
				}, '-', {
					text : '编辑笔记',
					iconCls : 'icon-edit',
					handler : function() {
						var currentRow = NBC.Note.noteListTable.datagrid("getSelected");
						if (currentRow == null) {
							$.messager.alert("提示", "您未选择任何项!", "error");
							return;
						}
						var rowIndex = NBC.Note.noteListTable.datagrid('getRowIndex', currentRow);
						if (NBC.Note.editingRow != undefined) {
							$.messager.alert('提示', '请先保存或取消正在编辑的笔记!');
							return;
						}
						if (NBC.Note.editingRow == undefined) {
							NBC.Note.noteListTable.datagrid('beginEdit', rowIndex);
						}
					}
				}, '-', {
					text : '取消编辑',
					iconCls : 'icon-undo',
					handler : function() {
						if (NBC.Note.editingRow == undefined) {
							$.messager.alert('提示', '没有正在编辑的笔记!');
							return;
						}
						$.messager.confirm('提示', '将会取消您正在编辑的笔记，您确定要这么做？', function(a) {
							if (a) {
								var index = NBC.Note.noteListTable.datagrid('getRowIndex', NBC.Note.editingRow);
								NBC.Note.noteListTable.datagrid('cancelEdit', index);
							}
						});
					}
				}, '-', {
					text : '删除笔记',
					iconCls : 'icon-remove',
					handler : function() {
						var rowDatas = NBC.Note.noteListTable.datagrid("getSelections");
						NBC.Note.deleteNotes(rowDatas);
					}
				}, '-', {
					text : '保存笔记',
					iconCls : 'icon-save',
					handler : function() {
						if (NBC.Note.editingRow == undefined) {
							$.messager.alert('提示', '没有正在编辑的笔记!');
							return;
						}
						var index = NBC.Note.noteListTable.datagrid('getRowIndex', NBC.Note.editingRow);
						NBC.Note.noteListTable.datagrid('endEdit', index);
					}
				}, '-', {
					text : '同步笔记',
					iconCls : 'icon-reload',
					handler : function() {
						NBC.Note.noteListTable.datagrid('load', []);
					}
				}, '-', {
					text : '显示历史',
					iconCls : 'icon-reload',
					handler : function() {
						var currentRow = NBC.Note.noteListTable.datagrid("getSelected");
						if (currentRow == null) {
							$.messager.alert("提示", "您未选择任何项!", "error");
							return;
						}
						NBC.Note.findAndShowNoteHistory(currentRow);
					}
				}]
			});
			$(".datagrid-header-inner .datagrid-cell").css("text-align", "center");
		});
	});
});

/**
 * 根据所url得到数据渲染datagrid
 */
NBC.Note.renderDatagrid = function(url) {
	NBC.Note.noteContentDiv = $("#noteContentDiv");
	NBC.Note.noteListTable = $("#noteListTable");
	NBC.Note.noteListTable.show().datagrid({
		title : '',
		border : false,
		width : '339',
		height : '483',
		nowrap : true,
		singleSelect : true,
		striped : false,
		collapsible : true,
		url : url,
		loadMsg : '数据装载中......',
		onLoadError : function() {
			$.messager.alert('错误提示', '数据加载失败!');
		},
		rownumbers : true,
		sortName : 'id',
		sortOrder : 'asc',
		remoteSort : true,
		frozenColumns : [[{
			title : '编号',
			width : '30',
			field : 'id',
			align : 'center',
			sortable : true,
			checkbox : true
		}, {
			title : '标题',
			field : 'title',
			width : '200',
			align : 'left',
			editor : {
				type : 'validatebox',
				options : {
					required : true
				}
			},
			sortable : true
		}, {
			title : '作者',
			field : 'authorName',
			width : '60',
			align : 'center',
			sortable : true
		}]],
		onBeforeEdit : function(rowIndex, rowData) {
			NBC.Note.editingRow = rowData;
			if (rowData.id != undefined) {
				NBC.Note.findAndEditNote(rowData.id);
				return;
			}
			NBC.Note.noteContentDiv.html("");
			NBC.Note.noteContentDiv.load("nbcNotePage/createContent.html",function(){
				NBC.Note.editor = new UE.ui.Editor();
				NBC.Note.editor.render("noteContent");
			});
		},
		onAfterEdit : function(rowIndex, rowData) {
			NBC.Note.saveOrModify(rowData);
			NBC.Note.renderDatagrid('note_searchNoteList.do?name=title&value=' + rowData.title);
		},
		onCancelEdit : function(rowIndex, rowData) {
			NBC.Note.noteListTable.datagrid('load', []);
			if (NBC.Note.editingRow.id == undefined) {
				NBC.Note.noteContentDiv.html("");
			} else {
				NBC.Note.findAndShowNote(NBC.Note.editingRow.id,NBC.Note.noteContentDiv);
			}
			NBC.Note.editingRow = undefined;

		},
		onDblClickRow : function(rowIndex, rowData) {
			var id = rowData.id;
			NBC.Note.findAndShowNote(id,NBC.Note.noteContentDiv);
		}
	});
};

/**
 * 保存或修改笔记
 * 
 * @param rowData
 */
NBC.Note.saveOrModify = function(rowData) {
	$.ajax({
		url : "note_handlerNote.do?operate=saveOrModify",
		data : rowData,
		type : 'post',
		dataType : "json",
		success : function(data) {
			if (!data.state) {
				$.messager.show({
					title : '提示',
					msg : "发生异常啦!"
				});
				return;
			}
			var id = data.result.id;
			NBC.Note.editor.sync();
			$("#noteContentForm").form('submit', {
				url : "note_submitNoteContent.do?id=" + id,
				success : function(data) {
					data = $.parseJSON(data);
					if (data.state) {
						NBC.Note.editingRow = undefined;
						NBC.Note.editor = undefined;
						var htmlstr = data.result;
						NBC.Note.noteContentDiv.html("");
						NBC.Note.noteContentDiv.html(htmlstr);
						htmlstr = NBC.Note.noteContentDiv.text();
						NBC.Note.noteContentDiv.html("");
						NBC.Note.noteContentDiv.append(htmlstr);
					}
					$.messager.show({
						title : '提示',
						msg : data.message,
					});
				},
				error : function() {
					$.messager.show({
						title : '提示',
						msg : "发生异常啦!"
					});
				}
			});
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "发生异常啦!"
			});
		}

	});
};

/**
 * 删除笔记
 */
NBC.Note.deleteNotes = function(rowDatas) {
	if (rowDatas.length == 0) {
		$.messager.alert("提示", "您未选择任何项!", "error");
		return;
	}
	$.messager.confirm("提示", "将会删除选中笔记，您确认要这么做?", function(a) {
		if (!a) {
			return;
		}
		$.ajax({
			url : "note_handlerNote.do?operate=remove",
			dataType : "json",
			type : 'post',
			data : rowDatas[0],
			success : function(data) {
				if (data.state) {
					$.messager.show({
						title : '提示',
						msg : data.message
					});
				}
				var currentRow = NBC.Note.noteListTable.datagrid("getSelected");
				var rowIndex = NBC.Note.noteListTable.datagrid('getRowIndex', currentRow);
				NBC.Note.noteListTable.datagrid("deleteRow", rowIndex);
				NBC.Note.noteContentDiv.html("");
				NBC.Note.noteListTable.datagrid("acceptChanges");
			},
			error : function() {
				$.messager.show({
					title : '提示',
					msg : "删除失败，请重试"
				});
			}
		});
	});
};

/**
 * 根据id到后台找到当前最新版本的笔记正文并显示 然后显示在obj对象中
 */
NBC.Note.findAndShowNote = function(id, obj) {
	$.ajax({
		url : "note_findCurVerNoteContent.do?id=" + id,
		dataType : "json",
		type : 'post',
		success : function(data) {
			if (!data.state) {
				$.messager.show({
					title : '提示',
					msg : '载入出错啦！'
				});
				return;
			}
			var htmlstr = data.result;
			obj.html("");
			obj.html(htmlstr);
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "载入出错啦！请重试"
			});
		}
	});
};

/**
 * 根据id到后台找到当前最新版本的笔记正文并显示
 */
NBC.Note.findAndEditNote = function(id) {
	$.ajax({
		url : "note_findCurVerNoteContent.do?id=" + id,
		dataType : "json",
		type : 'post',
		success : function(data) {
			if (!data.state) {
				$.messager.show({
					title : '提示',
					msg : '载入出错啦！'
				});
				return;
			}
			var htmlstr = data.result;
			NBC.Note.noteContentDiv.html("");
			NBC.Note.noteContentDiv.load("nbcNotePage/createContent.html",function(){
				$("#noteContent").html(htmlstr);
				NBC.Note.editor = new UE.ui.Editor();
				NBC.Note.editor.render("noteContent");
			});
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "载入出错啦！请重试"
			});
		}
	});
};

/**
 * 找到并显示笔记的历史记录
 */
NBC.Note.findAndShowNoteHistory = function(rowData) {
	var id = rowData.id;
	$("#forNoteHistoryDiv").show().layout();
	$("#forNoteHistoryDiv").dialog({
		title : rowData.title + "的历史版本信息",
		modal : true,
		onClose : function() {
			$("#noteHistoryContentDiv").html("");
			$("#noteHistoryListDiv").html("");
		},
	});
	var noteHistoryContentDiv = $("#noteHistoryContentDiv");
	var htmlstr = '<table id="noteHistoryListTable" style="display: none; width: 320px"></table>';
	$("#noteHistoryListDiv").append($(htmlstr));
	NBC.Note.noteHistoryListTable = $("#noteHistoryListTable");
	NBC.Note.noteHistoryListTable.show().datagrid({
		title : '',
		border : false,
		width : '320',
		height : '483',
		nowrap : true,
		singleSelect : true,
		striped : false,
		collapsible : true,
		url : "note_findHistoryNote.do?id=" + id,
		loadMsg : '数据装载中......',
		onLoadError : function() {
			$.messager.alert('错误提示', '数据加载失败!');
		},
		remoteSort : true,
		frozenColumns : [[{
			title : '版本号',
			width : '80',
			field : 'version',
			align : 'center',
			formatter : function(value, rowData, rowIndex) {
				if (rowIndex == 0) {
					var htmlstr = rowData.content;
					noteHistoryContentDiv.html("");
					noteHistoryContentDiv.html(htmlstr);
					return '当前版本';
				}
				return '版本 ' + value;
			},
			sortable : true,
		}, {
			title : '修改日期',
			field : 'modifyDate',
			width : '150',
			align : 'center',
			formatter : dateFormatter,
			sortable : true
		}, {
			title : '修改人姓名',
			field : 'modifierName',
			width : '80',
			align : 'center',
			sortable : true
		}]],
		onDblClickRow : function(rowIndex, rowData) {
			var htmlstr = rowData.content;
			noteHistoryContentDiv.html("");
			noteHistoryContentDiv.html(htmlstr);
		},
		toolbar : [{
			text : '替换为最新版本',
			iconCls : 'icon-tip',
			handler : function() {
				var currentRow = NBC.Note.noteHistoryListTable.datagrid("getSelected");
				if (currentRow == null) {
					$.messager.alert("提示", "您未选择任何项!", "error");
					return;
				}
				$.messager.confirm("提示", "将选中项替换为最新版本，您确认要这么做?", function(a) {
					if(a){
						$("#forNoteHistoryDiv").dialog("close");
						NBC.Note.handlerNoteHistoryContent(id,currentRow.version,'replace');
					}
				});
			}
		}, '-', {
			text : '删除版本',
			iconCls : 'icon-remove',
			handler : function() {
				var currentRow = NBC.Note.noteHistoryListTable.datagrid("getSelected");
				if (currentRow == null) {
					$.messager.alert("提示", "您未选择任何项!", "error");
					return;
				}
				$.messager.confirm("提示", "将删除选中项，您确认要这么做?", function(a) {
					if(a){
						NBC.Note.handlerNoteHistoryContent(id,currentRow.version,'remove');
					}
				});
			}
		}, '-']
	});
};

/**
 * 根据note的id和选中的版本号和操作operate
 * operate为replace 将选中的版本替换为最新的版本
 * operate为remove 删除选中的版本
 */
NBC.Note.handlerNoteHistoryContent = function(id, version, operate){
	$.ajax({
		url : "note_handlerNoteHistoryContent.do",
		dataType : "json",
		type : 'post',
		data :{
			id : id,
			version : version,
			operate : operate
		},
		success : function(data) {
			$.messager.show({
				title : '提示',
				msg : data.message
			});
			if (data.state) {
				var currentRow = NBC.Note.noteListTable.datagrid("getSelected");
				NBC.Note.findAndShowNoteHistory(currentRow);
			}
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "操作失败！请重试"
			});
		}
	});
};

