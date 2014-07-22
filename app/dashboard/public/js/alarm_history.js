var History = {
	init: function(){
		$("#history_table").dataTable();
	}
}
History.init();
$("ul.page-sidebar-menu li.active").removeClass('active');
$("ul.page-sidebar-menu li.alarm").addClass('active');