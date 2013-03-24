/**
 * Created with JetBrains WebStorm.
 * User: gaozhu
 * Date: 13-3-24
 * Time: 下午2:53
 * To change this template use File | Settings | File Templates.
 */
$(function(){
    //$.messager.alert("sdfs","dsafas","warning");
    $("#center").click(function(){
        $.ajax({
           url:"/users",
           type:"post",
           dataType:"json",
           success:function(data){
               $.messager.alert("niad",data.msg,"info");
           }

        });
    });
})
