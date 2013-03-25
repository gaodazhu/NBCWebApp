/** 定义一个全局的computerListTable,前面加上命名空间NBC.Computer */
Namespace.register("NBC.Computer");
NBC.Computer.computerListTable = undefined;

NBC.Computer.editingRow = undefined;
/**
 * 服务器管理js
 */
$(function() {
	
	$("#computerMngt").click(function() {
		var isExist = $("#contentTabs").tabs("exists", '服务器管理');
		if (isExist) {
			$("#contentTabs").tabs("select", '服务器管理');
			return;
		}
		$("#contentTabs").tabs("add", {
			title : '服务器管理',
			selected : true,
			border : false,
			closable : true
		});
		var computerMngtTab = $("#contentTabs").tabs("getTab", "服务器管理");
		computerMngtTab.load('taskPage/computerList.html', function() {
			NBC.Computer.computerListTable = $('#computerListTable');
			NBC.Computer.computerListTable.show().datagrid({
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
				url : 'computer_getComputerList.do',
				loadMsg : '数据装载中......',
				onLoadError : function() {
					$.messager.alert('错误提示', '数据加载失败!');
				},
				sortName : 'modifyDate',
				sortOrder : 'desc',
				remoteSort : true,
				frozenColumns : [[{
					title : '编号',
					field : 'id',
					checkbox : true,
					align : 'center',
					sortable : true
				}, {
					title : '服务器名',
					field : 'name',
					width : '100',
					align : 'center',
					editor : {
						type : 'validatebox',
						options : {
							required : true
						}
					}
				}, {
					title : '当前负荷',
					field : 'currentTaskSize',
					width : '100',
					align : 'center',
				}, {
					title : '总负荷量',
					field : 'enableTaskSize',
					width : '100',
					align : 'center',
					editor : {
						type : 'numberbox',
						options : {
							required : true
						}
					}
				}, {
					title : '启用状态',
					field : 'openState',
					width : '60',
					align : 'center',
					formatter : function(value, rowData, rowIndex) {
						if (value == 0) {
							return "未启用";
						}
						if (value == 1) {
							return "已启用";
						}
						if (value == 2) {
							return "已禁用";
						}
					}
				}, {
					title : '服务器类型',
					field : 'type',
					width : '100',
					align : 'center',
					formatter : function(value, rowData, rowIndex) {
						if (value == 0) {
							return "普通服务器";
						}
						if (value == 1) {
							return "web服务器";
						}
					},
					editor : {
						type : 'combobox',
						options : {
							required : true,
							editable : false,
							valueField : 'type',
							textField : 'value',
							data : [{
								type : '0',
								value : '普通服务器'
							}, {
								type : '1',
								value : 'web服务器'
							}]
						}
					}
				}]],
				columns : [[{
					title : '机器地址',
					field : 'ip',
					width : '150',
					align : 'left',
					editor : {
						type : 'validatebox',
						options : {
							required : true,
							validType : 'ipValid'
						}
					}
				}, {
					title : '监听端口',
					field : 'port',
					width : '100',
					align : 'center',
					editor : {
						type : 'numberbox',
						options : {
							required : true
						}
					}
				}, {
					title : '更新日期',
					field : 'modifyDate',
					width : '150',
					align : 'center',
					formatter : dateFormatter
				}, {
					title : '机器描述',
					field : 'description',
					width : '300',
					align : 'left',
					editor : {
						type : 'validatebox',
						options : {
							validType : 'length[0,100]'
						}
					}
				}, {
					title : ' ',
					field : 'abc',
					width : '10',
					align : 'left'
				}]],
				pagination : true,
				rownumbers : true,
				onBeforeEdit : function(rowIndex, rowData) {
					NBC.Computer.editingRow = rowData;
					NBC.Computer.computerListTable.datagrid("unselectAll");
				},
				onAfterEdit : function(rowIndex, rowData) {
					NBC.Computer.editingRow = undefined;
					NBC.Computer.saveOrModify(rowData);
				},
				onCancelEdit : function(rowIndex, rowData) {
					NBC.Computer.editingRow = undefined;
					NBC.Computer.computerListTable.datagrid('load', []);
				},
				onDblClickRow : function(rowIndex, rowData) {
					if (NBC.Computer.editingRow != undefined) {
						var index = NBC.Computer.computerListTable.datagrid('getRowIndex', NBC.Computer.editingRow);
						NBC.Computer.computerListTable.datagrid('endEdit', index);
						return;
					}
					if (NBC.Computer.editingRow == undefined) {
						NBC.Computer.computerListTable.datagrid('beginEdit', rowIndex);
					}
				},
				toolbar : [{
					text : '添加',
					iconCls : 'icon-add',
					handler : function() {
						if (NBC.Computer.editingRow != undefined) {
							var index = NBC.Computer.computerListTable.datagrid('getRowIndex', NBC.Computer.editingRow);
							NBC.Computer.computerListTable.datagrid('endEdit', index);
						}
						NBC.Computer.computerListTable.datagrid("insertRow", {
							index : 0, // index start with 0
							row : {
								currentTaskSize : 0,
								openState : 0
							}
						});
						NBC.Computer.computerListTable.datagrid('beginEdit', 0);
					}
				}, '-', {
					text : '保存',
					iconCls : 'icon-save',
					handler : function() {
						var index = NBC.Computer.computerListTable.datagrid('getRowIndex', NBC.Computer.editingRow);
						NBC.Computer.computerListTable.datagrid('endEdit', index);
					}
				}, '-', {
					text : '取消编辑',
					iconCls : 'icon-undo',
					handler : function() {
						var index = NBC.Computer.computerListTable.datagrid('getRowIndex', NBC.Computer.editingRow);
						NBC.Computer.computerListTable.datagrid('cancelEdit', index);
					}
				}, '-', {
					text : '删除',
					iconCls : 'icon-remove',
					handler : function() {
						var rowDatas = NBC.Computer.computerListTable.datagrid("getSelections");
						NBC.Computer.deleteComputers(rowDatas);
					}
				}, '-', {
					text : '启用',
					iconCls : 'icon-print',
					handler : function() {
						var rows = NBC.Computer.computerListTable.datagrid("getSelections");
						if (rows.length == 0) {
							$.messager.alert("提示", "您未选择任何项!", "error");
							return;
						}
						$.messager.confirm("提示", "启用只是取消禁用状态，系统会验证服务器的状态，请确认操作?", function(a) {
							if (!a) {
								return;
							}
							for ( var i = 0; i < rows.length; i++) {
								NBC.Computer.startOrStopComputer(rows[i], 0);
							}
						});
					}
				}, '-', {
					text : '禁用',
					iconCls : 'icon-no',
					handler : function() {
						var rows = NBC.Computer.computerListTable.datagrid("getSelections");
						if (rows.length == 0) {
							$.messager.alert("提示", "您未选择任何项!", "error");
							return;
						}
						$.messager.confirm("提示", "将会禁用选中服务器，请确认?", function(a) {
							if (!a) {
								return;
							}
							for ( var i = 0; i < rows.length; i++) {
								NBC.Computer.startOrStopComputer(rows[i], 2);
							}
						});
					}
				}, '-']
			});
			NBC.Computer.computerListTable.datagrid('getPager').pagination({
				displayMsg : '当前显示从{from}到{to}共{total}记录'
			});

			$(".datagrid-header-inner .datagrid-cell").css("text-align", "center");
			// $(".datagrid-view").css("overflow", "auto");
		});
	});
});

/**
 * 保存或修改数据
 * 
 * @param rowData
 */
NBC.Computer.saveOrModify = function(rowData) {
	$.ajax({
		url : "computer_handlerComputer.do?operate=saveOrModify",
		data : rowData,
		type : 'post',
		dataType : "json",
		success : function(data) {
			$.messager.show({
				title : '提示',
				msg : data.message
			});
			NBC.Computer.computerListTable.datagrid('load', []);
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
 * 禁用或启用
 * 
 * @param rowData
 */
NBC.Computer.startOrStopComputer = function(rowData, openState) {
	$.ajax({
		url : "computer_handlerComputer.do?operate=startOrStop",
		data : {
			id : rowData.id,
			openState : openState
		},
		type : 'post',
		dataType : "json",
		success : function(data) {
			$.messager.show({
				title : '提示',
				msg : data.message
			});
			NBC.Computer.computerListTable.datagrid('load', []);
		},
		error : function() {
			$.messager.show({
				title : '提示',
				msg : "发生异常啦!"
			});
		}

	});
};

NBC.Computer.deleteComputers = function(rowDatas) {
	if (rowDatas.length == 0) {
		$.messager.alert("提示", "您未选择任何项!", "error");
		return;
	}
	$.messager.confirm("提示", "将会删除选中的服务器，推荐选择禁用，请确认?", function(a) {
		if (!a) {
			return;
		}
		for ( var i = 0; i < rowDatas.length; i++) {
			$.ajax({
				url : "computer_handlerComputer.do?operate=remove",
				dataType : "json",
				type : 'post',
				data : rowDatas[i],
				success : function(data) {
					if (data.state) {
						$.messager.show({
							title : '提示',
							msg : '已成功删除！',
						});
					}
					NBC.Computer.computerListTable.datagrid('load', []);
				},
				error : function() {
					$.messager.show({
						title : '提示',
						msg : "删除失败，请重试"
					});
				}
			});
		}
	});
};