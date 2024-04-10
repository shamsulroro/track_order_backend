import t from"events";import e from"debug";var o={};Object.defineProperty(o,"__esModule",{value:true});function promisify(t){return function(e,o){return new Promise(((r,n)=>{t.call(this,e,o,((t,e)=>{t?n(t):r(e)}))}))}}o.default=promisify;var r={};var n=r&&r.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};const s=t;const i=n(e);const c=n(o);const l=i.default("agent-base");function isAgent(t){return Boolean(t)&&"function"===typeof t.addRequest}function isSecureEndpoint(){const{stack:t}=new Error;return"string"===typeof t&&t.split("\n").some((t=>-1!==t.indexOf("(https.js:")||-1!==t.indexOf("node:https:")))}function createAgent(t,e){return new createAgent.Agent(t,e)}(function(t){
/**
   * Base `http.Agent` implementation.
   * No pooling/keep-alive is implemented by default.
   *
   * @param {Function} callback
   * @api public
   */
class Agent extends s.EventEmitter{constructor(t,e){super();let o=e;"function"===typeof t?this.callback=t:t&&(o=t);this.timeout=null;o&&"number"===typeof o.timeout&&(this.timeout=o.timeout);this.maxFreeSockets=1;this.maxSockets=1;this.maxTotalSockets=Infinity;this.sockets={};this.freeSockets={};this.requests={};this.options={}}get defaultPort(){return"number"===typeof this.explicitDefaultPort?this.explicitDefaultPort:isSecureEndpoint()?443:80}set defaultPort(t){this.explicitDefaultPort=t}get protocol(){return"string"===typeof this.explicitProtocol?this.explicitProtocol:isSecureEndpoint()?"https:":"http:"}set protocol(t){this.explicitProtocol=t}callback(t,e,o){throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`')}addRequest(t,e){const o=Object.assign({},e);"boolean"!==typeof o.secureEndpoint&&(o.secureEndpoint=isSecureEndpoint());null==o.host&&(o.host="localhost");null==o.port&&(o.port=o.secureEndpoint?443:80);null==o.protocol&&(o.protocol=o.secureEndpoint?"https:":"http:");o.host&&o.path&&delete o.path;delete o.agent;delete o.hostname;delete o._defaultAgent;delete o.defaultPort;delete o.createConnection;t._last=true;t.shouldKeepAlive=false;let r=false;let n=null;const s=o.timeout||this.timeout;const onerror=e=>{if(!t._hadError){t.emit("error",e);t._hadError=true}};const ontimeout=()=>{n=null;r=true;const t=new Error(`A "socket" was not created for HTTP request before ${s}ms`);t.code="ETIMEOUT";onerror(t)};const callbackError=t=>{if(!r){if(null!==n){clearTimeout(n);n=null}onerror(t)}};const onsocket=e=>{if(r)return;if(null!=n){clearTimeout(n);n=null}if(isAgent(e)){l("Callback returned another Agent instance %o",e.constructor.name);e.addRequest(t,o);return}if(e){e.once("free",(()=>{this.freeSocket(e,o)}));t.onSocket(e);return}const s=new Error(`no Duplex stream was returned to agent-base for \`${t.method} ${t.path}\``);onerror(s)};if("function"===typeof this.callback){if(!this.promisifiedCallback)if(this.callback.length>=3){l("Converting legacy callback function to promise");this.promisifiedCallback=c.default(this.callback)}else this.promisifiedCallback=this.callback;"number"===typeof s&&s>0&&(n=setTimeout(ontimeout,s));"port"in o&&"number"!==typeof o.port&&(o.port=Number(o.port));try{l("Resolving socket for %o request: %o",o.protocol,`${t.method} ${t.path}`);Promise.resolve(this.promisifiedCallback(t,o)).then(onsocket,callbackError)}catch(t){Promise.reject(t).catch(callbackError)}}else onerror(new Error("`callback` is not defined"))}freeSocket(t,e){l("Freeing socket %o %o",t.constructor.name,e);t.destroy()}destroy(){l("Destroying agent %o",this.constructor.name)}}t.Agent=Agent;t.prototype=t.Agent.prototype})(createAgent||(createAgent={}));r=createAgent;var a=r;export default a;

