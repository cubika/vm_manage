$.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, bStandingRedraw )
{
    // DataTables 1.10 compatibility - if 1.10 then versionCheck exists.
    // 1.10s API has ajax reloading built in, so we use those abilities
    // directly.
    if ( $.fn.dataTable.versionCheck ) {
        var api = new $.fn.dataTable.Api( oSettings );
 
        if ( sNewSource ) {
            api.ajax.url( sNewSource ).load( fnCallback, !bStandingRedraw );
        }
        else {
            api.ajax.reload( fnCallback, !bStandingRedraw );
        }
        return;
    }
 
    if ( sNewSource !== undefined && sNewSource !== null ) {
        oSettings.sAjaxSource = sNewSource;
    }
 
    // Server-side processing should just call fnDraw
    if ( oSettings.oFeatures.bServerSide ) {
        this.fnDraw();
        return;
    }
 
    this.oApi._fnProcessingDisplay( oSettings, true );
    var that = this;
    var iStart = oSettings._iDisplayStart;
    var aData = [];
 
    this.oApi._fnServerParams( oSettings, aData );
 
    oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aData, function(json) {
        /* Clear the old information from the table */
        that.oApi._fnClearTable( oSettings );
 
        /* Got the data - add it to the table */
        var aData =  (oSettings.sAjaxDataProp !== "") ?
            that.oApi._fnGetObjectDataFn( oSettings.sAjaxDataProp )( json ) : json;
 
        for ( var i=0 ; i<aData.length ; i++ )
        {
            that.oApi._fnAddData( oSettings, aData[i] );
        }
         
        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
 
        that.fnDraw();
 
        if ( bStandingRedraw === true )
        {
            oSettings._iDisplayStart = iStart;
            that.oApi._fnCalculateEnd( oSettings );
            that.fnDraw( false );
        }
 
        that.oApi._fnProcessingDisplay( oSettings, false );
 
        /* Callback user function - for event handlers etc */
        if ( typeof fnCallback == 'function' && fnCallback !== null )
        {
            fnCallback( oSettings );
        }
    }, oSettings );
};

var oTable;

var Manage = {
    setupLoading: function(){
        $(document).ajaxSend(function(event, request, settings) {
            $('#loading-indicator').show();
        });

        $(document).ajaxComplete(function(event, request, settings) {
            $('#loading-indicator').hide();
        });
    },
    init: function(){
        this.setupLoading();
         oTable = $('#vm_table').dataTable( {
            "sAjaxSource": "/dashboard/vm/load",
            "aoColumns": [
                {"sTitle":"ID", "sClass":"vm_id", "mData":"id"},
                {"sTitle":"名字", "sClass":"vm_name", "mData":"name"},
                {"sTitle":"IP地址", "sClass":"vm_ip", "mData":"ip"},
                {"sTitle":"计算节点", "sClass":"vm_host", "mData":"host"},
                {"sTitle":"所属者", "sClass":"vm_owner", "mData":"owner"},
                {"sTitle":"额度", "sClass":"vm_flavor", "mData":"flavor"},
                {"sTitle":"租户", "sClass":"vm_tenant", "mData":"tenant"},
                {"sTitle":"状态", "sClass":"vm_status", "mData":"status"},
                {"sTitle":"VNC", "mData":null,"bSortable": false,"mRender": function ( data, type, full ) {
                    return '<a href="/dashboard/vm/action?id='+full.id+'&action=getConsole" target="_blank"><img src="/dashboard/image/vnc.png" style="width:30px"/></a>';
                  }
                }
            ],
            "fnCreatedRow": function( nRow, aData, iDataIndex ) {
                $(nRow).data('alias',aData.alias);
            },
            "oLanguage": {
                "sLengthMenu": "每页显示 _MENU_ 条",
                "sZeroRecords": "没有找到的数据",
                "sInfo": "当前第 _START_ - _END_ 条　共计 _TOTAL_ 条",
                "sInfoEmpty": "没有记录",
                "sInfoFiltered": "(从 _MAX_ 条记录中过滤)",
                "sSearch": "搜索：",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": "前一页",
                    "sNext": "后一页",
                    "sLast": "尾页"
                }
            },
            "aaSorting": [[1, 'asc']],
             "aLengthMenu": [
                [5, 10, 20, -1],
                [5, 10, 20, "All"] // change per page values here
            ],
            // set the initial value
            "iDisplayLength": 10
        });
         oTable.refresh = $('<button id="refresh_table" class="btn blue">Refresh <i class="icon-refresh"></i></button>').appendTo('div.dataTables_filter');
         this.styleIt();
         this.addListener();
        
    },
    styleIt: function(){
        $('#vm_table_wrapper .dataTables_filter input').addClass("m-wrap small"); // modify table search input
        $('#vm_table_wrapper .dataTables_length select').addClass("m-wrap small"); // modify table per page dropdown
        $('#vm_table_wrapper .dataTables_length select').select2(); // initialzie select2 dropdown
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
                        self.doIt(id,action,"&flavorId="+flavor);
                    });
                }else if(action == "confirmResize" || action == "revertResize"){
                    if(status != "VERIFY_RESIZE" && status != "VERIFY_MIGRATE"){
                        self.addWarning("只有当实例状态为RESIZE/MIGRATE时才可以进行此操作");
                        $("#op_warning").fadeOut(2000);
                    }else{
                        self.doIt(id,action);
                    }
                }else if(action == "terminate"){
                    if(window.confirm("你确定要删除这个实例吗？")){
                        self.doIt(id,action);
                    }
                }else if(action == "liveMigrate"){
                    //choose new host
                }else{
                    self.doIt(id,action);
                }
            }
        });
        //monitor add/remove
        $("#monitor_op_drop a").on('click',function(){
            var sel_row = self.getSelectedRow(oTable);
            if(!sel_row){
                self.addWarning("你必须从表格中选择一个虚拟机条目");
            }else{
                var name = $(sel_row).find("td.vm_name").text(),
                server = $(sel_row).find("td.vm_host").text(),
                ip = $(sel_row).find("td.vm_ip").text(),
                alias = $(sel_row).data('alias'),
                action = $(this).data('action');
                $.get('/dashboard/vm/action?action='+action+"&name="+name+"&server="+server+"&ip="+ip+"&alias="+alias,function(result){
                    console.log(result);
                });

            }
        });
        oTable.refresh.on('click',function(){
            oTable.fnReloadAjax();
        });
    },
    doIt: function(id,action,suffix){
        $.get('/dashboard/vm/action?id='+id+"&action="+action+(suffix?suffix:''),function(result){
            console.log(result);
            oTable.fnReloadAjax();
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