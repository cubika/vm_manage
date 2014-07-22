(function(){
	function gup (name) {
		name = RegExp ('[?&]' + name.replace (/([[\]])/, '\\$1') + '=([^&#]*)');
		return (window.location.href.match (name) || ['', ''])[1];
	}

	var host = gup('host') ? gup('host') : current_host;
	var span = gup('span') ? gup('span') : '4hour';
	$("span#time_range_selected").text($("a.range[data-short="+span+"]").text());	

	function encap (host,span){
		return location.protocol+"//"+location.hostname+":"+location.port+location.pathname+"?host="+host+"&span="+span;
	}
	$("#select_host").change(function(){
		host = $(this).val();
		location.href = encap(host,span);
	});
	$("a.range").on('click',function(){
		span = $(this).data('short');
		location.href = encap(host,span);
		return false;
	});
	setTimeout(function(){
		location.reload();
	},90*1000);

	$("ul.page-sidebar-menu li.active").removeClass('active');
	$("ul.page-sidebar-menu li.host").addClass('active');

	$("div.graph").imgAreaSelect({ 
		handles: false, 
		autoHide: true,
		//fadeSpeed: 500, 
		onSelectEnd: function(div, selection){
			var img = $(div).next('img')[0];
			var origSrc = img.src;
			var graph_width = $(div).width();
			var ostart = Math.abs(origSrc.match(/start=(\d+)/)[1]);
			var oend   = Math.abs(origSrc.match(/end=(\d+)/)[1]);
			var delta  = (oend - ostart);
			if( delta < 600 )
			    delta = 600;
			var sec_per_px = parseInt( delta / graph_width);
			var start = ostart + ( selection.x1 * sec_per_px );  
			var end   = ostart + ( selection.x2 * sec_per_px );  
			img.src = origSrc.replace(/start=(\d+)/,'start='+start).replace(/end=(\d+)/,'end='+end);
		}
	});
	
})();