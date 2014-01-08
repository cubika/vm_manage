var oTable;

var Manage = {
    init: function(){
         oTable = $('#vm_table').dataTable( {           
            "aoColumnDefs": [
                { "aTargets": [ 0 ] }
            ],
            "aaSorting": [[1, 'asc']],
             "aLengthMenu": [
                [5, 10, 20, -1],
                [5, 10, 20, "All"] // change per page values here
            ],
            // set the initial value
            "iDisplayLength": 10,
        });
         this.styleIt();
         this.addListener();
        
    },
    styleIt: function(){
        $('#vm_table_wrapper .dataTables_filter input').addClass("m-wrap small"); // modify table search input
        $('#vm_table_wrapper .dataTables_length select').addClass("m-wrap small"); // modify table per page dropdown
        $('#vm_table_wrapper .dataTables_length select').select2(); // initialzie select2 dropdown
        $("#basic_op_drop li a").css('cursor','pointer');
    },
    addListener: function(){
        var self = this;
        //add style for selected row
        $("#vm_table tbody").click(function(event) {
            $(oTable.fnSettings().aoData).each(function (){
                $(this.nTr).removeClass('row_selected');
            });
            $(event.target.parentNode).addClass('row_selected');
            if($("#op_warning").length > 0){
                $("#op_warning").remove();
            }
        });
        //basic operation
        $("#basic_op_drop a").on('click',function(){
            var sel_row = self.getSelectedRow(oTable);
            if(!sel_row){
                self.addWarning("你必须从表格中选择一个虚拟机条目");
            }else{
                var id = $(sel_row).find("td.vm_id").text(),
                    status = $(sel_row).find("td.vm_status").text(),
                    action = $(this).data('action');
                if(action == "pause" && status == "PAUSED"){
                    action = "unpause";
                }
                if(action == "suspend" && status == "SUSPENDED"){
                    action = "resume";
                }
                if(action == "resize"){
                    $("#modal_resize").modal('show');
                    $("#resizeOK").off('click').on('click',function(){
                        var flavor = $("#sel_resize").val();
                        $("#modal_resize").modal('hide');
                        $.get('/dashboard/vm/action?id='+id+"&action="+action+"&flavorId="+flavor,function(result){
                            console.log(result);
                        });
                    });
                }else if(action == "confirmResize" || action == "revertResize"){
                    if(status != "RESZIE"){
                        self.addWarning("只有当实例状态为RESIZE时才可以进行此操作");
                        $("#op_warning").fadeOut(500);
                    }else{
                        $.get('/dashboard/vm/action?id='+id+"&action="+action,function(result){
                            console.log(result);
                        });
                    }
                }else if(action == "terminate"){
                    if(window.confirm("你确定要删除这个实例吗？")){
                        $.get('/dashboard/vm/action?id='+id+"&action="+action,function(result){
                            console.log(result);
                        });
                    }
                }else{
                    $.get('/dashboard/vm/action?id='+id+"&action="+action,function(result){
                        console.log(result);
                    });
                }
            }
        });
    },
    addWarning: function(message){
        $("<div class='row-fluid' id='op_warning'><div class='alert alert-error'><strong>警告！</strong>"+ message +"</div></div>")
            .insertAfter($("div.page-content .container-fluid .row-fluid:eq(0)"));
    },
    getSelectedRow: function(oTableLocal){
         var aReturn = new Array();
        var aTrs = oTableLocal.fnGetNodes();
        for ( var i=0 ; i<aTrs.length ; i++ )
        {
            if ( $(aTrs[i]).hasClass('row_selected') )
            {
                aReturn.push( aTrs[i] );
            }
        }
        return aReturn[0];
    }
}

Manage.init();