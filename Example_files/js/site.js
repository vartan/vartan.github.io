document.body.onload = function () {
	console.log("test")
	var links = document.getElementsByTagName("a")
	for(var i=0;i<links.length;i++)
		links[i].onclick = function(){location.reload()}
}
