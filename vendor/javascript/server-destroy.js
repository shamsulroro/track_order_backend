var e={};e=enableDestroy;function enableDestroy(e){var o={};e.on("connection",(function(e){var n=e.remoteAddress+":"+e.remotePort;o[n]=e;e.on("close",(function(){delete o[n]}))}));e.destroy=function(n){e.close(n);for(var r in o)o[r].destroy()}}var o=e;export default o;

