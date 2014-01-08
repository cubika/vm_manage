var sel_host = $("#select_host").val();
$("tbody tr:not(."+ sel_host +")").hide();
$("#select_host").change(function(){
	var sel_host = $("#select_host").val();
	$("tbody tr."+sel_host).show();
	$("tbody tr:not(."+ sel_host +")").hide();
});