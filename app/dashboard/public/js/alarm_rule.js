var Rule = {
	init: function(){
		$("#rule_table").dataTable();
	}
}
Rule.init();
$("ul.page-sidebar-menu li.active").removeClass('active');
$("ul.page-sidebar-menu li.alarm").addClass('active');