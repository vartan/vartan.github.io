$(document).ready(function() {
	// Every image referenced from a Markdown document
	$(".postcontent img").each(function() {
		// Let's put a caption if there is one
		if($(this).attr("alt"))
			$(this).wrap('<div class="panel panel-default mdimage"></div>')
				.after('<div class="panel-footer">'+$(this).attr("alt")+'</div>').wrap('<div class="panel-body text-center"><a href="'+$(this).attr("src")+'"></a></div>');
		else
			$(this).wrap('<div class="panel panel-default mdimage"><a href="'+$(this).attr("src")+'"></a></div>');
		});
});