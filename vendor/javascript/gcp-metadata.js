import*as e from"gaxios";import*as t from"json-bigint";import*as s from"fs";import*as n from"os";import o from"process";var r="default"in s?s.default:s;var a="default"in n?n.default:n;var i={};var c=o;Object.defineProperty(i,"__esModule",{value:true});i.detectGCPResidency=i.isGoogleComputeEngine=i.isGoogleComputeEngineMACAddress=i.isGoogleComputeEngineLinux=i.isGoogleCloudServerless=i.GCE_LINUX_BIOS_PATHS=void 0;const u=r;const E=a;i.GCE_LINUX_BIOS_PATHS={BIOS_DATE:"/sys/class/dmi/id/bios_date",BIOS_VENDOR:"/sys/class/dmi/id/bios_vendor"};const l=/^42:01/;
/**
 * Determines if the process is running on a Google Cloud Serverless environment (Cloud Run or Cloud Functions instance).
 *
 * Uses the:
 * - {@link https://cloud.google.com/run/docs/container-contract#env-vars Cloud Run environment variables}.
 * - {@link https://cloud.google.com/functions/docs/env-var Cloud Functions environment variables}.
 *
 * @returns {boolean} `true` if the process is running on GCP serverless, `false` otherwise.
 */function isGoogleCloudServerless$1(){const e=c.env.CLOUD_RUN_JOB||c.env.FUNCTION_NAME||c.env.K_SERVICE;return!!e}i.isGoogleCloudServerless=isGoogleCloudServerless$1;
/**
 * Determines if the process is running on a Linux Google Compute Engine instance.
 *
 * @returns {boolean} `true` if the process is running on Linux GCE, `false` otherwise.
 */function isGoogleComputeEngineLinux$1(){if("linux"!==(0,E.platform)())return false;try{(0,u.statSync)(i.GCE_LINUX_BIOS_PATHS.BIOS_DATE);const e=(0,u.readFileSync)(i.GCE_LINUX_BIOS_PATHS.BIOS_VENDOR,"utf8");return/Google/.test(e)}catch(e){return false}}i.isGoogleComputeEngineLinux=isGoogleComputeEngineLinux$1;
/**
 * Determines if the process is running on a Google Compute Engine instance with a known
 * MAC address.
 *
 * @returns {boolean} `true` if the process is running on GCE (as determined by MAC address), `false` otherwise.
 */function isGoogleComputeEngineMACAddress$1(){const e=(0,E.networkInterfaces)();for(const t of Object.values(e))if(t)for(const{mac:e}of t)if(l.test(e))return true;return false}i.isGoogleComputeEngineMACAddress=isGoogleComputeEngineMACAddress$1;
/**
 * Determines if the process is running on a Google Compute Engine instance.
 *
 * @returns {boolean} `true` if the process is running on GCE, `false` otherwise.
 */function isGoogleComputeEngine$1(){return isGoogleComputeEngineLinux$1()||isGoogleComputeEngineMACAddress$1()}i.isGoogleComputeEngine=isGoogleComputeEngine$1;
/**
 * Determines if the process is running on Google Cloud Platform.
 *
 * @returns {boolean} `true` if the process is running on GCP, `false` otherwise.
 */function detectGCPResidency$1(){return isGoogleCloudServerless$1()||isGoogleComputeEngine$1()}i.detectGCPResidency=detectGCPResidency$1;var d="default"in e?e.default:e;var A="default"in t?t.default:t;var p={};var C=o;var g=p&&p.__createBinding||(Object.create?function(e,t,s,n){void 0===n&&(n=s);var o=Object.getOwnPropertyDescriptor(t,s);o&&!("get"in o?!t.__esModule:o.writable||o.configurable)||(o={enumerable:true,get:function(){return t[s]}});Object.defineProperty(e,n,o)}:function(e,t,s,n){void 0===n&&(n=s);e[n]=t[s]});var _=p&&p.__exportStar||function(e,t){for(var s in e)"default"===s||Object.prototype.hasOwnProperty.call(t,s)||g(t,e,s)};Object.defineProperty(p,"__esModule",{value:true});p.requestTimeout=p.setGCPResidency=p.getGCPResidency=p.gcpResidencyCache=p.resetIsAvailableCache=p.isAvailable=p.project=p.instance=p.METADATA_SERVER_DETECTION=p.HEADERS=p.HEADER_VALUE=p.HEADER_NAME=p.SECONDARY_HOST_ADDRESS=p.HOST_ADDRESS=p.BASE_PATH=void 0;const f=d;const R=A;const T=i;p.BASE_PATH="/computeMetadata/v1";p.HOST_ADDRESS="http://169.254.169.254";p.SECONDARY_HOST_ADDRESS="http://metadata.google.internal.";p.HEADER_NAME="Metadata-Flavor";p.HEADER_VALUE="Google";p.HEADERS=Object.freeze({[p.HEADER_NAME]:p.HEADER_VALUE});p.METADATA_SERVER_DETECTION=Object.freeze({"assume-present":"don't try to ping the metadata server, but assume it's present",none:"don't try to ping the metadata server, but don't try to use it either","bios-only":"treat the result of a BIOS probe as canonical (don't fall back to pinging)","ping-only":"skip the BIOS probe, and go straight to pinging"});
/**
 * Returns the base URL while taking into account the GCE_METADATA_HOST
 * environment variable if it exists.
 *
 * @returns The base URL, e.g., http://169.254.169.254/computeMetadata/v1.
 */function getBaseUrl(e){e||(e=C.env.GCE_METADATA_IP||C.env.GCE_METADATA_HOST||p.HOST_ADDRESS);/^https?:\/\//.test(e)||(e=`http://${e}`);return new URL(p.BASE_PATH,e).href}function validate(e){Object.keys(e).forEach((e=>{switch(e){case"params":case"property":case"headers":break;case"qs":throw new Error("'qs' is not a valid configuration option. Please use 'params' instead.");default:throw new Error(`'${e}' is not a valid configuration option.`)}}))}async function metadataAccessor(e,t,s=3,n=false){t=t||{};"string"===typeof t&&(t={property:t});let o="";"object"===typeof t&&t.property&&(o="/"+t.property);validate(t);try{const r=n?fastFailMetadataRequest:f.request;const a=await r({url:`${getBaseUrl()}/${e}${o}`,headers:Object.assign({},p.HEADERS,t.headers),retryConfig:{noResponseRetries:s},params:t.params,responseType:"text",timeout:requestTimeout()});if(a.headers[p.HEADER_NAME.toLowerCase()]!==p.HEADER_VALUE)throw new Error(`Invalid response from metadata service: incorrect ${p.HEADER_NAME} header.`);if(!a.data)throw new Error("Invalid response from the metadata service");if("string"===typeof a.data)try{return R.parse(a.data)}catch(e){}return a.data}catch(e){const t=e;t.response&&200!==t.response.status&&(t.message=`Unsuccessful response status code. ${t.message}`);throw e}}async function fastFailMetadataRequest(e){const t={...e,url:e.url.replace(getBaseUrl(),getBaseUrl(p.SECONDARY_HOST_ADDRESS))};let s=false;const n=(0,f.request)(e).then((e=>{s=true;return e})).catch((e=>{if(s)return o;s=true;throw e}));const o=(0,f.request)(t).then((e=>{s=true;return e})).catch((e=>{if(s)return n;s=true;throw e}));return Promise.race([n,o])}function instance(e){return metadataAccessor("instance",e)}p.instance=instance;function project(e){return metadataAccessor("project",e)}p.project=project;function detectGCPAvailableRetries(){return C.env.DETECT_GCP_RETRIES?Number(C.env.DETECT_GCP_RETRIES):0}let S;async function isAvailable(){if(C.env.METADATA_SERVER_DETECTION){const e=C.env.METADATA_SERVER_DETECTION.trim().toLocaleLowerCase();if(!(e in p.METADATA_SERVER_DETECTION))throw new RangeError(`Unknown \`METADATA_SERVER_DETECTION\` env variable. Got \`${e}\`, but it should be \`${Object.keys(p.METADATA_SERVER_DETECTION).join("`, `")}\`, or unset`);switch(e){case"assume-present":return true;case"none":return false;case"bios-only":return getGCPResidency();case"ping-only":}}try{void 0===S&&(S=metadataAccessor("instance",void 0,detectGCPAvailableRetries(),!(C.env.GCE_METADATA_IP||C.env.GCE_METADATA_HOST)));await S;return true}catch(e){const t=e;C.env.DEBUG_AUTH&&console.info(t);if("request-timeout"===t.type)return false;if(t.response&&404===t.response.status)return false;if(!(t.response&&404===t.response.status)&&(!t.code||!["EHOSTDOWN","EHOSTUNREACH","ENETUNREACH","ENOENT","ENOTFOUND","ECONNREFUSED"].includes(t.code))){let e="UNKNOWN";t.code&&(e=t.code);C.emitWarning(`received unexpected error = ${t.message} code = ${e}`,"MetadataLookupWarning")}return false}}p.isAvailable=isAvailable;function resetIsAvailableCache(){S=void 0}p.resetIsAvailableCache=resetIsAvailableCache;p.gcpResidencyCache=null;function getGCPResidency(){null===p.gcpResidencyCache&&setGCPResidency();return p.gcpResidencyCache}p.getGCPResidency=getGCPResidency;function setGCPResidency(e=null){p.gcpResidencyCache=null!==e?e:(0,T.detectGCPResidency)()}p.setGCPResidency=setGCPResidency;
/**
 * Obtain the timeout for requests to the metadata server.
 *
 * In certain environments and conditions requests can take longer than
 * the default timeout to complete. This function will determine the
 * appropriate timeout based on the environment.
 *
 * @returns {number} a request timeout duration in milliseconds.
 */function requestTimeout(){return getGCPResidency()?0:3e3}p.requestTimeout=requestTimeout;_(i,p);const v=p.__esModule,m=p.gcpResidencyCache,D=p.METADATA_SERVER_DETECTION,y=p.HEADERS,G=p.HEADER_VALUE,O=p.HEADER_NAME,h=p.SECONDARY_HOST_ADDRESS,b=p.HOST_ADDRESS,N=p.BASE_PATH,P=p.detectGCPResidency,H=p.isGoogleComputeEngine,I=p.isGoogleComputeEngineMACAddress,M=p.isGoogleComputeEngineLinux,U=p.isGoogleCloudServerless,w=p.GCE_LINUX_BIOS_PATHS;const $=p.requestTimeout,j=p.setGCPResidency,B=p.getGCPResidency,L=p.resetIsAvailableCache,V=p.isAvailable,q=p.project,x=p.instance;export{N as BASE_PATH,w as GCE_LINUX_BIOS_PATHS,y as HEADERS,O as HEADER_NAME,G as HEADER_VALUE,b as HOST_ADDRESS,D as METADATA_SERVER_DETECTION,h as SECONDARY_HOST_ADDRESS,v as __esModule,p as default,P as detectGCPResidency,m as gcpResidencyCache,B as getGCPResidency,x as instance,V as isAvailable,U as isGoogleCloudServerless,H as isGoogleComputeEngine,M as isGoogleComputeEngineLinux,I as isGoogleComputeEngineMACAddress,q as project,$ as requestTimeout,L as resetIsAvailableCache,j as setGCPResidency};

