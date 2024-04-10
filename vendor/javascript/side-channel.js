import*as t from"get-intrinsic";import*as e from"call-bind/callBound";import*as r from"object-inspect";import*as a from"es-errors/type";var n=t;try{"default"in t&&(n=t.default)}catch(t){}var o=e;try{"default"in e&&(o=e.default)}catch(t){}var f=r;try{"default"in r&&(f=r.default)}catch(t){}var u=a;try{"default"in a&&(u=a.default)}catch(t){}var i={};var p=n;var v=o;var c=f;var l=u;var s=p("%WeakMap%",true);var y=p("%Map%",true);var d=v("WeakMap.prototype.get",true);var h=v("WeakMap.prototype.set",true);var x=v("WeakMap.prototype.has",true);var m=v("Map.prototype.get",true);var M=v("Map.prototype.set",true);var k=v("Map.prototype.has",true);
/** @type {import('.').listGetNode} */var listGetNode=function(t,e){
/** @type {typeof list | NonNullable<(typeof list)['next']>} */
var r=t;
/** @type {(typeof list)['next']} */var a;for(;(a=r.next)!==null;r=a)if(a.key===e){r.next=a.next;a.next=/** @type {NonNullable<typeof list.next>} */t.next;t.next=a;return a}};
/** @type {import('.').listGet} */var listGet=function(t,e){var r=listGetNode(t,e);return r&&r.value};
/** @type {import('.').listSet} */var listSet=function(t,e,r){var a=listGetNode(t,e);a?a.value=r:t.next=/** @type {import('.').ListNode<typeof value>} */{key:e,next:t.next,value:r}};
/** @type {import('.').listHas} */var listHas=function(t,e){return!!listGetNode(t,e)};
/** @type {import('.')} */i=function getSideChannel(){
/** @type {WeakMap<object, unknown>} */var t;
/** @type {Map<object, unknown>} */var e;
/** @type {import('.').RootNode<unknown>} */var r;
/** @type {import('.').Channel} */var a={assert:function(t){if(!a.has(t))throw new l("Side channel does not contain "+c(t))},get:function(a){if(s&&a&&(typeof a==="object"||typeof a==="function")){if(t)return d(t,a)}else if(y){if(e)return m(e,a)}else if(r)return listGet(r,a)},has:function(a){if(s&&a&&(typeof a==="object"||typeof a==="function")){if(t)return x(t,a)}else if(y){if(e)return k(e,a)}else if(r)return listHas(r,a);return false},set:function(a,n){if(s&&a&&(typeof a==="object"||typeof a==="function")){t||(t=new s);h(t,a,n)}else if(y){e||(e=new y);M(e,a,n)}else{r||(r={key:{},next:null});listSet(r,a,n)}}};return a};var b=i;export{b as default};

