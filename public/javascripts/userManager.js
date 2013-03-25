/** 定义一个全局的computerListTable,前面加上命名空间NBC.Computer */
Namespace.register("NBC.User");
NBC.User.userListTable = undefined;
NBC.User.editingRow = undefined;

/**
 * 用户管理js
 */
$(function() {
	
	$("#userManager").click(function() {
		var isExist = $("#contentTabs").tabs("exists", '用户管理');
		if (isExist) {
			$("#contentTabs").tabs("select", '用户管理');
			return;
		}
		$("#contentTabs").tabs("add", {
			title : '用户管理',
			selected : true,
			border : false,
			closable : true
		});
		var userManagerTab = $("#contentTabs").tabs("getTab", "用户管理");
		userManagerTab.load('userPage/userList.html', function() {
			NBC.User.userListTable = $('#userListTable');
			NBC.User.userListTable.show().datagrid({
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
				url : 'user_getUserList.do',
				loadMsg : '数据装载中......',
				onLoadError : function() {
					$.messager.alert('错误提示', '数据加载失败!');
				},
				sortName : 'username',
				sortOrder : 'asc',
				remoteSort : true,
				frozenColumns : [[{
					title : '编号',
					field : 'id',
					checkbox : true,
					align : 'center',
					sortable : true
				}, {
					title : '姓名',
					field : 'name',
					width : '100',
					align : 'center',
					editor : {
						type : 'validatebox',
						options : {
							required : true
						}
					}
				}]],
				columns : [[{
					title : '用户名',
					field : 'username',
					width : '100',
					align : 'center',
					editor : {
						type : 'validatebox',
						options : {
							required : true
						}
					}
				}, {
					title : '密码',
					field : 'password',
					width : '280',
					align : 'center',
					editor : {
						type : 'validatebox',
						options : {
							required : true
						}
					}
				}, {
					title : '用户类型',
					field : 'userType',
					width : '100',
					align : 'center',
					formatter : function(value, rowData, rowIndex) {
						if (value == 0) {
							return "销售人员";
						}
						if (value == 1) {
							return "研发人员";
						}
						if (value == 2) {
							return "技术人员";
						}
						if (value == 3) {
							return "客户";
						}
						if (value == 4) {
							return "经理";
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
								value : '销售人员'
							}, {
								type : '1',
								value : '研发人员'
							}, {
								type : '2',
								value : '技术人员'
							}, {
								type : '3',
								value : '客户'
							}, {
								type : '4',
								value : '经理'
							}]
						}
					}
				}, {
					title : '邮箱',
					field : 'email',
					width : '150',
					align : 'left',
					editor : {
						type : 'validatebox',
						options : {
							required : true,
							validType : 'email'
						}
					}
				}, {
					title : '更新日期',
					field : 'modifyDate',
					width : '150',
					align : 'center',
					formatter : dateFormatter
				}, {
					title : '描述',
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
					title : '  ',
					field : 'abc',
					width : '10',
					align : 'left',
				}]],
				pagination : true,
				rownumbers : true,
				onBeforeEdit : function(rowIndex, rowData) {
					NBC.User.editingRow = rowData;
					NBC.User.userListTable.datagrid("unselectAll");
				},
				onAfterEdit : function(rowIndex, rowData) {
					NBC.User.editingRow = undefined;
					NBC.User.saveOrModify(rowData);
				},
				onCancelEdit : function(rowIndex, rowData) {
					NBC.User.editingRow = undefined;
					NBC.User.userListTable.datagrid('load', []);
				},
				onDblClickRow : function(rowIndex, rowData) {
					if (NBC.User.editingRow != undefined) {
						var index = NBC.User.userListTable.datagrid('getRowIndex', NBC.User.editingRow);
						NBC.User.userListTable.datagrid('endEdit', index);
						return;
					}
					if (NBC.User.editingRow == undefined) {
						NBC.User.userListTable.datagrid('beginEdit', rowIndex);
					}
				},
				toolbar : [{
					text : '添加',
					iconCls : 'icon-add',
					handler : function() {
						if (NBC.User.editingRow != undefined) {
							var index = NBC.User.userListTable.datagrid('getRowIndex', NBC.User.editingRow);
							NBC.User.userListTable.datagrid('endEdit', index);
						}
						NBC.User.userListTable.datagrid("insertRow", {
							index : 0, // index start with 0
							row : {
								currentTaskSize : 0,
								openState : 0
							}
						});
						NBC.User.userListTable.datagrid('beginEdit', 0);
					}
				}, '-', {
					text : '保存',
					iconCls : 'icon-save',
					handler : function() {
						var index = NBC.User.userListTable.datagrid('getRowIndex', NBC.User.editingRow);
						NBC.User.userListTable.datagrid('endEdit', index);
					}
				}, '-', {
					text : '取消编辑',
					iconCls : 'icon-undo',
					handler : function() {
						var index = NBC.User.userListTable.datagrid('getRowIndex', NBC.User.editingRow);
						NBC.User.userListTable.datagrid('cancelEdit', index);
					}
				}, '-', {
					text : '删除',
					iconCls : 'icon-remove',
					handler : function() {
						var rowDatas = NBC.User.userListTable.datagrid("getSelections");
						NBC.User.deleteUsers(rowDatas);
					}
				}, '-']
			});
			NBC.User.userListTable.datagrid('getPager').pagination({
				displayMsg : '当前显示从{from}到{to}共{total}记录'
			});

			$(".datagrid-header-inner .datagrid-cell").css("text-align", "center");
		});
	});
});

/**
 * 保存或修改数据
 * 
 * @param rowData
 */
NBC.User.saveOrModify = function(rowData) {
	$.ajax({
		url : "user_handlerUser.do?operate=saveOrModify",
		data : rowData,
		type : 'post',
		dataType : "json",
		success : function(data) {
			$.messager.show({
				title : '提示',
				msg : data.message
			});
			NBC.User.userListTable.datagrid('load', []);
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
 * 删除用户
 */
NBC.User.deleteUsers = function(rowDatas) {
	if (rowDatas.length == 0) {
		$.messager.alert("提示", "您未选择任何项!", "error");
		return;
	}
	$.messager.confirm("提示", "将会删除选中用户，请确认?", function(a) {
		if (!a) {
			return;
		}
		for ( var i = 0; i < rowDatas.length; i++) {
			$.ajax({
				url : "user_handlerUser.do?operate=remove",
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
					NBC.User.userListTable.datagrid('load', []);
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