import*as e from"child_process";import*as t from"fs";import*as r from"gcp-metadata";import*as s from"os";import*as n from"path";import{d as i,a as o,b as a,c,e as l}from"../../_/a3344d80.js";import*as u from"arrify";import*as d from"gaxios";import h from"buffer";import p from"process";import*as f from"gtoken";import*as m from"jws";import*as g from"lru-cache";import*as A from"stream";import*as E from"querystring";import*as y from"util";import"ecdsa-sig-formatter";import"base64-js";import"fast-text-encoding";import"crypto";import"events";var _="default"in u?u.default:u;var w="default"in d?d.default:d;var T="default"in r?r.default:r;var C={},v=false;function dew$l(){if(v)return C;v=true;Object.defineProperty(C,"__esModule",{value:true});C.Compute=void 0;const e=_;const t=w;const r=T;const s=i();class Compute extends s.OAuth2Client{constructor(t={}){super(t);this.credentials={expiry_date:1,refresh_token:"compute-placeholder"};this.serviceAccountEmail=t.serviceAccountEmail||"default";this.scopes=e(t.scopes)}
/**
     * Refreshes the access token.
     * @param refreshToken Unused parameter
     */async refreshTokenNoCache(e){const s=`service-accounts/${this.serviceAccountEmail}/token`;let n;try{const e={property:s};this.scopes.length>0&&(e.params={scopes:this.scopes.join(",")});n=await r.instance(e)}catch(e){if(e instanceof t.GaxiosError){e.message=`Could not refresh access token: ${e.message}`;this.wrapError(e)}throw e}const i=n;if(n&&n.expires_in){i.expiry_date=(new Date).getTime()+1e3*n.expires_in;delete i.expires_in}this.emit("tokens",i);return{tokens:i,res:null}}
/**
     * Fetches an ID token.
     * @param targetAudience the audience for the fetched ID token.
     */async fetchIdToken(e){const t=`service-accounts/${this.serviceAccountEmail}/identity?format=full&audience=${e}`;let s;try{const e={property:t};s=await r.instance(e)}catch(e){e instanceof Error&&(e.message=`Could not fetch ID token: ${e.message}`);throw e}return s}wrapError(e){const t=e.response;if(t&&t.status){e.code=t.status.toString();403===t.status?e.message="A Forbidden error was returned while attempting to retrieve an access token for the Compute Engine built-in service account. This may be because the Compute Engine instance does not have the correct permission scopes specified: "+e.message:404===t.status&&(e.message="A Not Found error was returned while attempting to retrieve an accesstoken for the Compute Engine built-in service account. This may be because the Compute Engine instance does not have any permission scopes specified: "+e.message)}}}C.Compute=Compute;return C}var k={},O=false;function dew$k(){if(O)return k;O=true;var e=h.Buffer;Object.defineProperty(k,"__esModule",{value:true});k.IdTokenClient=void 0;const t=i();class IdTokenClient extends t.OAuth2Client{constructor(e){super();this.targetAudience=e.targetAudience;this.idTokenProvider=e.idTokenProvider}async getRequestMetadataAsync(e){if(!this.credentials.id_token||!this.credentials.expiry_date||this.isTokenExpiring()){const e=await this.idTokenProvider.fetchIdToken(this.targetAudience);this.credentials={id_token:e,expiry_date:this.getIdTokenExpiryDate(e)}}const t={Authorization:"Bearer "+this.credentials.id_token};return{headers:t}}getIdTokenExpiryDate(t){const r=t.split(".")[1];if(r){const t=JSON.parse(e.from(r,"base64").toString("ascii"));return 1e3*t.exp}}}k.IdTokenClient=IdTokenClient;return k}var b="default"in r?r.default:r;var S={},I=false;function dew$j(){if(I)return S;I=true;var e=p;Object.defineProperty(S,"__esModule",{value:true});S.getEnv=S.clear=S.GCPEnv=void 0;const t=b;var r;(function(e){e.APP_ENGINE="APP_ENGINE";e.KUBERNETES_ENGINE="KUBERNETES_ENGINE";e.CLOUD_FUNCTIONS="CLOUD_FUNCTIONS";e.COMPUTE_ENGINE="COMPUTE_ENGINE";e.CLOUD_RUN="CLOUD_RUN";e.NONE="NONE"})(r=S.GCPEnv||(S.GCPEnv={}));let s;function clear(){s=void 0}S.clear=clear;async function getEnv(){if(s)return s;s=getEnvMemoized();return s}S.getEnv=getEnv;async function getEnvMemoized(){let e=r.NONE;e=isAppEngine()?r.APP_ENGINE:isCloudFunction()?r.CLOUD_FUNCTIONS:await isComputeEngine()?await isKubernetesEngine()?r.KUBERNETES_ENGINE:isCloudRun()?r.CLOUD_RUN:r.COMPUTE_ENGINE:r.NONE;return e}function isAppEngine(){return!!(e.env.GAE_SERVICE||e.env.GAE_MODULE_NAME)}function isCloudFunction(){return!!(e.env.FUNCTION_NAME||e.env.FUNCTION_TARGET)}function isCloudRun(){return!!e.env.K_CONFIGURATION}async function isKubernetesEngine(){try{await t.instance("attributes/cluster-name");return true}catch(e){return false}}async function isComputeEngine(){return t.isAvailable()}return S}var j="default"in m?m.default:m;var P="default"in g?g.default:g;var x={},R=false;function dew$i(){if(R)return x;R=true;Object.defineProperty(x,"__esModule",{value:true});x.JWTAccess=void 0;const e=j;const t=P;const r={alg:"RS256",typ:"JWT"};class JWTAccess{
/**
     * JWTAccess service account credentials.
     *
     * Create a new access token by using the credential to create a new JWT token
     * that's recognized as the access token.
     *
     * @param email the service account email address.
     * @param key the private key that will be used to sign the token.
     * @param keyId the ID of the private key used to sign the token.
     */
constructor(e,r,s,n){this.cache=new t({max:500,maxAge:36e5});this.email=e;this.key=r;this.keyId=s;this.eagerRefreshThresholdMillis=null!==n&&void 0!==n?n:3e5}
/**
     * Ensures that we're caching a key appropriately, giving precedence to scopes vs. url
     *
     * @param url The URI being authorized.
     * @param scopes The scope or scopes being authorized
     * @returns A string that returns the cached key.
     */getCachedKey(e,t){let r=e;t&&Array.isArray(t)&&t.length?r=e?`${e}_${t.join("_")}`:`${t.join("_")}`:"string"===typeof t&&(r=e?`${e}_${t}`:t);if(!r)throw Error("Scopes or url must be provided");return r}
/**
     * Get a non-expired access token, after refreshing if necessary.
     *
     * @param url The URI being authorized.
     * @param additionalClaims An object with a set of additional claims to
     * include in the payload.
     * @returns An object that includes the authorization header.
     */getRequestHeaders(t,s,n){const i=this.getCachedKey(t,n);const o=this.cache.get(i);const a=Date.now();if(o&&o.expiration-a>this.eagerRefreshThresholdMillis)return o.headers;const c=Math.floor(Date.now()/1e3);const l=JWTAccess.getExpirationTime(c);let u;Array.isArray(n)&&(n=n.join(" "));u=n?{iss:this.email,sub:this.email,scope:n,exp:l,iat:c}:{iss:this.email,sub:this.email,aud:t,exp:l,iat:c};if(s)for(const e in u)if(s[e])throw new Error(`The '${e}' property is not allowed when passing additionalClaims. This claim is included in the JWT by default.`);const d=this.keyId?{...r,kid:this.keyId}:r;const h=Object.assign(u,s);const p=e.sign({header:d,payload:h,secret:this.key});const f={Authorization:`Bearer ${p}`};this.cache.set(i,{expiration:1e3*l,headers:f});return f}
/**
     * Returns an expiration time for the JWT token.
     *
     * @param iat The issued at time for the JWT.
     * @returns An expiration time for the JWT.
     */static getExpirationTime(e){const t=e+3600;return t}
/**
     * Create a JWTAccess credentials instance using the given input options.
     * @param json The input object.
     */fromJSON(e){if(!e)throw new Error("Must pass in a JSON object containing the service account auth settings.");if(!e.client_email)throw new Error("The incoming JSON object does not contain a client_email field");if(!e.private_key)throw new Error("The incoming JSON object does not contain a private_key field");this.email=e.client_email;this.key=e.private_key;this.keyId=e.private_key_id;this.projectId=e.project_id}fromStream(e,t){if(!t)return this.fromStreamAsync(e);this.fromStreamAsync(e).then((()=>t()),t)}fromStreamAsync(e){return new Promise(((t,r)=>{e||r(new Error("Must pass in a stream containing the service account auth settings."));let s="";e.setEncoding("utf8").on("data",(e=>s+=e)).on("error",r).on("end",(()=>{try{const e=JSON.parse(s);this.fromJSON(e);t()}catch(e){r(e)}}))}))}}x.JWTAccess=JWTAccess;return x}var N="default"in f?f.default:f;var U={},F=false;function dew$h(){if(F)return U;F=true;Object.defineProperty(U,"__esModule",{value:true});U.JWT=void 0;const e=N;const t=dew$i();const r=i();class JWT extends r.OAuth2Client{constructor(e,t,r,s,n,i){const o=e&&"object"===typeof e?e:{email:e,keyFile:t,key:r,keyId:i,scopes:s,subject:n};super({eagerRefreshThresholdMillis:o.eagerRefreshThresholdMillis,forceRefreshOnFailure:o.forceRefreshOnFailure});this.email=o.email;this.keyFile=o.keyFile;this.key=o.key;this.keyId=o.keyId;this.scopes=o.scopes;this.subject=o.subject;this.additionalClaims=o.additionalClaims;this.credentials={refresh_token:"jwt-placeholder",expiry_date:1}}
/**
     * Creates a copy of the credential with the specified scopes.
     * @param scopes List of requested scopes or a single scope.
     * @return The cloned instance.
     */createScoped(e){return new JWT({email:this.email,keyFile:this.keyFile,key:this.key,keyId:this.keyId,scopes:e,subject:this.subject,additionalClaims:this.additionalClaims})}
/**
     * Obtains the metadata to be sent with the request.
     *
     * @param url the URI being authorized.
     */async getRequestMetadataAsync(e){e=this.defaultServicePath?`https://${this.defaultServicePath}/`:e;const r=!this.hasUserScopes()&&e||this.useJWTAccessWithScope&&this.hasAnyScopes();if(!this.apiKey&&r){if(this.additionalClaims&&this.additionalClaims.target_audience){const{tokens:e}=await this.refreshToken();return{headers:this.addSharedMetadataHeaders({Authorization:`Bearer ${e.id_token}`})}}{this.access||(this.access=new t.JWTAccess(this.email,this.key,this.keyId,this.eagerRefreshThresholdMillis));let r;this.hasUserScopes()?r=this.scopes:e||(r=this.defaultScopes);const s=await this.access.getRequestHeaders(null!==e&&void 0!==e?e:void 0,this.additionalClaims,this.useJWTAccessWithScope?r:void 0);return{headers:this.addSharedMetadataHeaders(s)}}}return this.hasAnyScopes()||this.apiKey?super.getRequestMetadataAsync(e):{headers:{}}}
/**
     * Fetches an ID token.
     * @param targetAudience the audience for the fetched ID token.
     */async fetchIdToken(t){const r=new e.GoogleToken({iss:this.email,sub:this.subject,scope:this.scopes||this.defaultScopes,keyFile:this.keyFile,key:this.key,additionalClaims:{target_audience:t},transporter:this.transporter});await r.getToken({forceRefresh:true});if(!r.idToken)throw new Error("Unknown error: Failed to fetch ID token");return r.idToken}hasUserScopes(){return!!this.scopes&&this.scopes.length>0}hasAnyScopes(){return!!(this.scopes&&this.scopes.length>0)||!!(this.defaultScopes&&this.defaultScopes.length>0)}authorize(e){if(!e)return this.authorizeAsync();this.authorizeAsync().then((t=>e(null,t)),e)}async authorizeAsync(){const e=await this.refreshToken();if(!e)throw new Error("No result returned");this.credentials=e.tokens;this.credentials.refresh_token="jwt-placeholder";this.key=this.gtoken.key;this.email=this.gtoken.iss;return e.tokens}
/**
     * Refreshes the access token.
     * @param refreshToken ignored
     * @private
     */async refreshTokenNoCache(e){const t=this.createGToken();const r=await t.getToken({forceRefresh:this.isTokenExpiring()});const s={access_token:r.access_token,token_type:"Bearer",expiry_date:t.expiresAt,id_token:t.idToken};this.emit("tokens",s);return{res:null,tokens:s}}createGToken(){this.gtoken||(this.gtoken=new e.GoogleToken({iss:this.email,sub:this.subject,scope:this.scopes||this.defaultScopes,keyFile:this.keyFile,key:this.key,additionalClaims:this.additionalClaims,transporter:this.transporter}));return this.gtoken}
/**
     * Create a JWT credentials instance using the given input options.
     * @param json The input object.
     */fromJSON(e){if(!e)throw new Error("Must pass in a JSON object containing the service account auth settings.");if(!e.client_email)throw new Error("The incoming JSON object does not contain a client_email field");if(!e.private_key)throw new Error("The incoming JSON object does not contain a private_key field");this.email=e.client_email;this.key=e.private_key;this.keyId=e.private_key_id;this.projectId=e.project_id;this.quotaProjectId=e.quota_project_id}fromStream(e,t){if(!t)return this.fromStreamAsync(e);this.fromStreamAsync(e).then((()=>t()),t)}fromStreamAsync(e){return new Promise(((t,r)=>{if(!e)throw new Error("Must pass in a stream containing the service account auth settings.");let s="";e.setEncoding("utf8").on("error",r).on("data",(e=>s+=e)).on("end",(()=>{try{const e=JSON.parse(s);this.fromJSON(e);t()}catch(e){r(e)}}))}))}
/**
     * Creates a JWT credentials instance using an API Key for authentication.
     * @param apiKey The API Key in string form.
     */fromAPIKey(e){if("string"!==typeof e)throw new Error("Must provide an API Key string.");this.apiKey=e}async getCredentials(){if(this.key)return{private_key:this.key,client_email:this.email};if(this.keyFile){const e=this.createGToken();const t=await e.getCredentials(this.keyFile);return{private_key:t.privateKey,client_email:t.clientEmail}}throw new Error("A key or a keyFile must be provided to getCredentials.")}}U.JWT=JWT;return U}var $={},M=false;function dew$g(){if(M)return $;M=true;Object.defineProperty($,"__esModule",{value:true});$.UserRefreshClient=$.USER_REFRESH_ACCOUNT_TYPE=void 0;const e=i();$.USER_REFRESH_ACCOUNT_TYPE="authorized_user";class UserRefreshClient extends e.OAuth2Client{constructor(e,t,r,s,n){const i=e&&"object"===typeof e?e:{clientId:e,clientSecret:t,refreshToken:r,eagerRefreshThresholdMillis:s,forceRefreshOnFailure:n};super({clientId:i.clientId,clientSecret:i.clientSecret,eagerRefreshThresholdMillis:i.eagerRefreshThresholdMillis,forceRefreshOnFailure:i.forceRefreshOnFailure});this._refreshToken=i.refreshToken;this.credentials.refresh_token=i.refreshToken}
/**
     * Refreshes the access token.
     * @param refreshToken An ignored refreshToken..
     * @param callback Optional callback.
     */async refreshTokenNoCache(e){return super.refreshTokenNoCache(this._refreshToken)}
/**
     * Create a UserRefreshClient credentials instance using the given input
     * options.
     * @param json The input object.
     */fromJSON(e){if(!e)throw new Error("Must pass in a JSON object containing the user refresh token");if("authorized_user"!==e.type)throw new Error('The incoming JSON object does not have the "authorized_user" type');if(!e.client_id)throw new Error("The incoming JSON object does not contain a client_id field");if(!e.client_secret)throw new Error("The incoming JSON object does not contain a client_secret field");if(!e.refresh_token)throw new Error("The incoming JSON object does not contain a refresh_token field");this._clientId=e.client_id;this._clientSecret=e.client_secret;this._refreshToken=e.refresh_token;this.credentials.refresh_token=e.refresh_token;this.quotaProjectId=e.quota_project_id}fromStream(e,t){if(!t)return this.fromStreamAsync(e);this.fromStreamAsync(e).then((()=>t()),t)}async fromStreamAsync(e){return new Promise(((t,r)=>{if(!e)return r(new Error("Must pass in a stream containing the user refresh token."));let s="";e.setEncoding("utf8").on("error",r).on("data",(e=>s+=e)).on("end",(()=>{try{const e=JSON.parse(s);this.fromJSON(e);return t()}catch(e){return r(e)}}))}))}}$.UserRefreshClient=UserRefreshClient;return $}var D="default"in d?d.default:d;var G={},J=false;function dew$f(){if(J)return G;J=true;Object.defineProperty(G,"__esModule",{value:true});G.Impersonated=G.IMPERSONATED_ACCOUNT_TYPE=void 0;const e=i();const t=D;G.IMPERSONATED_ACCOUNT_TYPE="impersonated_service_account";class Impersonated extends e.OAuth2Client{
/**
     * Impersonated service account credentials.
     *
     * Create a new access token by impersonating another service account.
     *
     * Impersonated Credentials allowing credentials issued to a user or
     * service account to impersonate another. The source project using
     * Impersonated Credentials must enable the "IAMCredentials" API.
     * Also, the target service account must grant the orginating principal
     * the "Service Account Token Creator" IAM role.
     *
     * @param {object} options - The configuration object.
     * @param {object} [options.sourceClient] the source credential used as to
     * acquire the impersonated credentials.
     * @param {string} [options.targetPrincipal] the service account to
     * impersonate.
     * @param {string[]} [options.delegates] the chained list of delegates
     * required to grant the final access_token. If set, the sequence of
     * identities must have "Service Account Token Creator" capability granted to
     * the preceding identity. For example, if set to [serviceAccountB,
     * serviceAccountC], the sourceCredential must have the Token Creator role on
     * serviceAccountB. serviceAccountB must have the Token Creator on
     * serviceAccountC. Finally, C must have Token Creator on target_principal.
     * If left unset, sourceCredential must have that role on targetPrincipal.
     * @param {string[]} [options.targetScopes] scopes to request during the
     * authorization grant.
     * @param {number} [options.lifetime] number of seconds the delegated
     * credential should be valid for up to 3600 seconds by default, or 43,200
     * seconds by extending the token's lifetime, see:
     * https://cloud.google.com/iam/docs/creating-short-lived-service-account-credentials#sa-credentials-oauth
     * @param {string} [options.endpoint] api endpoint override.
     */
constructor(t={}){var r,s,n,i,o,a;super(t);this.credentials={expiry_date:1,refresh_token:"impersonated-placeholder"};this.sourceClient=null!==(r=t.sourceClient)&&void 0!==r?r:new e.OAuth2Client;this.targetPrincipal=null!==(s=t.targetPrincipal)&&void 0!==s?s:"";this.delegates=null!==(n=t.delegates)&&void 0!==n?n:[];this.targetScopes=null!==(i=t.targetScopes)&&void 0!==i?i:[];this.lifetime=null!==(o=t.lifetime)&&void 0!==o?o:3600;this.endpoint=null!==(a=t.endpoint)&&void 0!==a?a:"https://iamcredentials.googleapis.com"}
/**
     * Refreshes the access token.
     * @param refreshToken Unused parameter
     */async refreshToken(e){var r,s,n,i,o,a;try{await this.sourceClient.getAccessToken();const e="projects/-/serviceAccounts/"+this.targetPrincipal;const t=`${this.endpoint}/v1/${e}:generateAccessToken`;const r={delegates:this.delegates,scope:this.targetScopes,lifetime:this.lifetime+"s"};const s=await this.sourceClient.request({url:t,data:r,method:"POST"});const n=s.data;this.credentials.access_token=n.accessToken;this.credentials.expiry_date=Date.parse(n.expireTime);return{tokens:this.credentials,res:s}}catch(e){if(!(e instanceof Error))throw e;let c=0;let l="";if(e instanceof t.GaxiosError){c=null===(n=null===(s=null===(r=null===e||void 0===e?void 0:e.response)||void 0===r?void 0:r.data)||void 0===s?void 0:s.error)||void 0===n?void 0:n.status;l=null===(a=null===(o=null===(i=null===e||void 0===e?void 0:e.response)||void 0===i?void 0:i.data)||void 0===o?void 0:o.error)||void 0===a?void 0:a.message}if(c&&l){e.message=`${c}: unable to impersonate: ${l}`;throw e}e.message=`unable to impersonate: ${e}`;throw e}}
/**
     * Generates an OpenID Connect ID token for a service account.
     *
     * {@link https://cloud.google.com/iam/docs/reference/credentials/rest/v1/projects.serviceAccounts/generateIdToken Reference Documentation}
     *
     * @param targetAudience the audience for the fetched ID token.
     * @param options the for the request
     * @return an OpenID Connect ID token
     */async fetchIdToken(e,t){var r;await this.sourceClient.getAccessToken();const s=`projects/-/serviceAccounts/${this.targetPrincipal}`;const n=`${this.endpoint}/v1/${s}:generateIdToken`;const i={delegates:this.delegates,audience:e,includeEmail:null===(r=null===t||void 0===t?void 0:t.includeEmail)||void 0===r||r};const o=await this.sourceClient.request({url:n,data:i,method:"POST"});return o.data.token}}G.Impersonated=Impersonated;return G}var q="default"in E?E.default:E;var L={},W=false;function dew$e(){if(W)return L;W=true;Object.defineProperty(L,"__esModule",{value:true});L.getErrorFromOAuthErrorResponse=L.OAuthClientAuthHandler=void 0;const e=q;const t=o();const r=["PUT","POST","PATCH"];class OAuthClientAuthHandler{
/**
     * Instantiates an OAuth client authentication handler.
     * @param clientAuthentication The client auth credentials.
     */
constructor(e){this.clientAuthentication=e;this.crypto=(0,t.createCrypto)()}
/**
     * Applies client authentication on the OAuth request's headers or POST
     * body but does not process the request.
     * @param opts The GaxiosOptions whose headers or data are to be modified
     *   depending on the client authentication mechanism to be used.
     * @param bearerToken The optional bearer token to use for authentication.
     *   When this is used, no client authentication credentials are needed.
     */applyClientAuthenticationOptions(e,t){this.injectAuthenticatedHeaders(e,t);t||this.injectAuthenticatedRequestBody(e)}
/**
     * Applies client authentication on the request's header if either
     * basic authentication or bearer token authentication is selected.
     *
     * @param opts The GaxiosOptions whose headers or data are to be modified
     *   depending on the client authentication mechanism to be used.
     * @param bearerToken The optional bearer token to use for authentication.
     *   When this is used, no client authentication credentials are needed.
     */injectAuthenticatedHeaders(e,t){var r;if(t){e.headers=e.headers||{};Object.assign(e.headers,{Authorization:`Bearer ${t}}`})}else if("basic"===(null===(r=this.clientAuthentication)||void 0===r?void 0:r.confidentialClientType)){e.headers=e.headers||{};const t=this.clientAuthentication.clientId;const r=this.clientAuthentication.clientSecret||"";const s=this.crypto.encodeBase64StringUtf8(`${t}:${r}`);Object.assign(e.headers,{Authorization:`Basic ${s}`})}}
/**
     * Applies client authentication on the request's body if request-body
     * client authentication is selected.
     *
     * @param opts The GaxiosOptions whose headers or data are to be modified
     *   depending on the client authentication mechanism to be used.
     */injectAuthenticatedRequestBody(t){var s;if("request-body"===(null===(s=this.clientAuthentication)||void 0===s?void 0:s.confidentialClientType)){const s=(t.method||"GET").toUpperCase();if(-1===r.indexOf(s))throw new Error(`${s} HTTP method does not support ${this.clientAuthentication.confidentialClientType} client authentication`);{let r;const s=t.headers||{};for(const e in s)if("content-type"===e.toLowerCase()&&s[e]){r=s[e].toLowerCase();break}if("application/x-www-form-urlencoded"===r){t.data=t.data||"";const r=e.parse(t.data);Object.assign(r,{client_id:this.clientAuthentication.clientId,client_secret:this.clientAuthentication.clientSecret||""});t.data=e.stringify(r)}else{if("application/json"!==r)throw new Error(`${r} content-types are not supported with ${this.clientAuthentication.confidentialClientType} client authentication`);t.data=t.data||{};Object.assign(t.data,{client_id:this.clientAuthentication.clientId,client_secret:this.clientAuthentication.clientSecret||""})}}}}}L.OAuthClientAuthHandler=OAuthClientAuthHandler;
/**
   * Converts an OAuth error response to a native JavaScript Error.
   * @param resp The OAuth error response to convert to a native Error object.
   * @param err The optional original error. If provided, the error properties
   *   will be copied to the new error.
   * @return The converted native Error object.
   */function getErrorFromOAuthErrorResponse(e,t){const r=e.error;const s=e.error_description;const n=e.error_uri;let i=`Error code ${r}`;"undefined"!==typeof s&&(i+=`: ${s}`);"undefined"!==typeof n&&(i+=` - ${n}`);const o=new Error(i);if(t){const e=Object.keys(t);t.stack&&e.push("stack");e.forEach((e=>{"message"!==e&&Object.defineProperty(o,e,{value:t[e],writable:false,enumerable:true})}))}return o}L.getErrorFromOAuthErrorResponse=getErrorFromOAuthErrorResponse;return L}var H="default"in d?d.default:d;var B="default"in E?E.default:E;var z={},K=false;function dew$d(){if(K)return z;K=true;Object.defineProperty(z,"__esModule",{value:true});z.StsCredentials=void 0;const e=H;const t=B;const r=a();const s=dew$e();class StsCredentials extends s.OAuthClientAuthHandler{
/**
     * Initializes an STS credentials instance.
     * @param tokenExchangeEndpoint The token exchange endpoint.
     * @param clientAuthentication The client authentication credentials if
     *   available.
     */
constructor(e,t){super(t);this.tokenExchangeEndpoint=e;this.transporter=new r.DefaultTransporter}
/**
     * Exchanges the provided token for another type of token based on the
     * rfc8693 spec.
     * @param stsCredentialsOptions The token exchange options used to populate
     *   the token exchange request.
     * @param additionalHeaders Optional additional headers to pass along the
     *   request.
     * @param options Optional additional GCP-specific non-spec defined options
     *   to send with the request.
     *   Example: `&options=${encodeUriComponent(JSON.stringified(options))}`
     * @return A promise that resolves with the token exchange response containing
     *   the requested token and its expiration time.
     */async exchangeToken(r,n,i){var o,a,c;const l={grant_type:r.grantType,resource:r.resource,audience:r.audience,scope:null===(o=r.scope)||void 0===o?void 0:o.join(" "),requested_token_type:r.requestedTokenType,subject_token:r.subjectToken,subject_token_type:r.subjectTokenType,actor_token:null===(a=r.actingParty)||void 0===a?void 0:a.actorToken,actor_token_type:null===(c=r.actingParty)||void 0===c?void 0:c.actorTokenType,options:i&&JSON.stringify(i)};Object.keys(l).forEach((e=>{"undefined"===typeof l[e]&&delete l[e]}));const u={"Content-Type":"application/x-www-form-urlencoded"};Object.assign(u,n||{});const d={url:this.tokenExchangeEndpoint,method:"POST",headers:u,data:t.stringify(l),responseType:"json"};this.applyClientAuthenticationOptions(d);try{const e=await this.transporter.request(d);const t=e.data;t.res=e;return t}catch(t){if(t instanceof e.GaxiosError&&t.response)throw(0,s.getErrorFromOAuthErrorResponse)(t.response.data,t);throw t}}}z.StsCredentials=StsCredentials;return z}var X="default"in A?A.default:A;var V={},Y=false;function dew$c(){if(Y)return V;Y=true;Object.defineProperty(V,"__esModule",{value:true});V.BaseExternalAccountClient=V.CLOUD_RESOURCE_MANAGER=V.EXTERNAL_ACCOUNT_TYPE=V.EXPIRATION_TIME_OFFSET=void 0;const e=X;const t=c();const r=dew$d();const s="urn:ietf:params:oauth:grant-type:token-exchange";const n="urn:ietf:params:oauth:token-type:access_token";const i="https://www.googleapis.com/auth/cloud-platform";const o=3600;V.EXPIRATION_TIME_OFFSET=3e5;V.EXTERNAL_ACCOUNT_TYPE="external_account";V.CLOUD_RESOURCE_MANAGER="https://cloudresourcemanager.googleapis.com/v1/projects/";const a="//iam.googleapis.com/locations/[^/]+/workforcePools/[^/]+/providers/.+";class BaseExternalAccountClient extends t.AuthClient{
/**
     * Instantiate a BaseExternalAccountClient instance using the provided JSON
     * object loaded from an external account credentials file.
     * @param options The external account options object typically loaded
     *   from the external account JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     */
constructor(e,t){var s,n;super();if(e.type!==V.EXTERNAL_ACCOUNT_TYPE)throw new Error(`Expected "${V.EXTERNAL_ACCOUNT_TYPE}" type but received "${e.type}"`);this.clientAuth=e.client_id?{confidentialClientType:"basic",clientId:e.client_id,clientSecret:e.client_secret}:void 0;this.stsCredential=new r.StsCredentials(e.token_url,this.clientAuth);this.scopes=[i];this.cachedAccessToken=null;this.audience=e.audience;this.subjectTokenType=e.subject_token_type;this.quotaProjectId=e.quota_project_id;this.workforcePoolUserProject=e.workforce_pool_user_project;const c=new RegExp(a);if(this.workforcePoolUserProject&&!this.audience.match(c))throw new Error("workforcePoolUserProject should not be set for non-workforce pool credentials.");this.serviceAccountImpersonationUrl=e.service_account_impersonation_url;this.serviceAccountImpersonationLifetime=null!==(n=null===(s=e.service_account_impersonation)||void 0===s?void 0:s.token_lifetime_seconds)&&void 0!==n?n:o;"number"!==typeof(null===t||void 0===t?void 0:t.eagerRefreshThresholdMillis)?this.eagerRefreshThresholdMillis=V.EXPIRATION_TIME_OFFSET:this.eagerRefreshThresholdMillis=t.eagerRefreshThresholdMillis;this.forceRefreshOnFailure=!!(null===t||void 0===t?void 0:t.forceRefreshOnFailure);this.projectId=null;this.projectNumber=this.getProjectNumber(this.audience);this.universeDomain=e.universe_domain}getServiceAccountEmail(){var e;if(this.serviceAccountImpersonationUrl){const t=/serviceAccounts\/(?<email>[^:]+):generateAccessToken$/;const r=t.exec(this.serviceAccountImpersonationUrl);return(null===(e=null===r||void 0===r?void 0:r.groups)||void 0===e?void 0:e.email)||null}return null}
/**
     * Provides a mechanism to inject GCP access tokens directly.
     * When the provided credential expires, a new credential, using the
     * external account options, is retrieved.
     * @param credentials The Credentials object to set on the current client.
     */setCredentials(e){super.setCredentials(e);this.cachedAccessToken=e}async getAccessToken(){this.cachedAccessToken&&!this.isExpired(this.cachedAccessToken)||await this.refreshAccessTokenAsync();return{token:this.cachedAccessToken.access_token,res:this.cachedAccessToken.res}}async getRequestHeaders(){const e=await this.getAccessToken();const t={Authorization:`Bearer ${e.token}`};return this.addSharedMetadataHeaders(t)}request(e,t){if(!t)return this.requestAsync(e);this.requestAsync(e).then((e=>t(null,e)),(e=>t(e,e.response)))}async getProjectId(){const e=this.projectNumber||this.workforcePoolUserProject;if(this.projectId)return this.projectId;if(e){const t=await this.getRequestHeaders();const r=await this.transporter.request({headers:t,url:`${V.CLOUD_RESOURCE_MANAGER}${e}`,responseType:"json"});this.projectId=r.data.projectId;return this.projectId}return null}
/**
     * Authenticates the provided HTTP request, processes it and resolves with the
     * returned response.
     * @param opts The HTTP request options.
     * @param retry Whether the current attempt is a retry after a failed attempt.
     * @return A promise that resolves with the successful response.
     */async requestAsync(t,r=false){let s;try{const e=await this.getRequestHeaders();t.headers=t.headers||{};e&&e["x-goog-user-project"]&&(t.headers["x-goog-user-project"]=e["x-goog-user-project"]);e&&e.Authorization&&(t.headers.Authorization=e.Authorization);s=await this.transporter.request(t)}catch(s){const n=s.response;if(n){const s=n.status;const i=n.config.data instanceof e.Readable;const o=401===s||403===s;if(!r&&o&&!i&&this.forceRefreshOnFailure){await this.refreshAccessTokenAsync();return await this.requestAsync(t,true)}}throw s}return s}async refreshAccessTokenAsync(){const e=await this.retrieveSubjectToken();const t={grantType:s,audience:this.audience,requestedTokenType:n,subjectToken:e,subjectTokenType:this.subjectTokenType,scope:this.serviceAccountImpersonationUrl?[i]:this.getScopesArray()};const r=!this.clientAuth&&this.workforcePoolUserProject?{userProject:this.workforcePoolUserProject}:void 0;const o=await this.stsCredential.exchangeToken(t,void 0,r);this.serviceAccountImpersonationUrl?this.cachedAccessToken=await this.getImpersonatedAccessToken(o.access_token):o.expires_in?this.cachedAccessToken={access_token:o.access_token,expiry_date:(new Date).getTime()+1e3*o.expires_in,res:o.res}:this.cachedAccessToken={access_token:o.access_token,res:o.res};this.credentials={};Object.assign(this.credentials,this.cachedAccessToken);delete this.credentials.res;this.emit("tokens",{refresh_token:null,expiry_date:this.cachedAccessToken.expiry_date,access_token:this.cachedAccessToken.access_token,token_type:"Bearer",id_token:null});return this.cachedAccessToken}
/**
     * Returns the workload identity pool project number if it is determinable
     * from the audience resource name.
     * @param audience The STS audience used to determine the project number.
     * @return The project number associated with the workload identity pool, if
     *   this can be determined from the STS audience field. Otherwise, null is
     *   returned.
     */getProjectNumber(e){const t=e.match(/\/projects\/([^/]+)/);return t?t[1]:null}
/**
     * Exchanges an external account GCP access token for a service
     * account impersonated access token using iamcredentials
     * GenerateAccessToken API.
     * @param token The access token to exchange for a service account access
     *   token.
     * @return A promise that resolves with the service account impersonated
     *   credentials response.
     */async getImpersonatedAccessToken(e){const t={url:this.serviceAccountImpersonationUrl,method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},data:{scope:this.getScopesArray(),lifetime:this.serviceAccountImpersonationLifetime+"s"},responseType:"json"};const r=await this.transporter.request(t);const s=r.data;return{access_token:s.accessToken,expiry_date:new Date(s.expireTime).getTime(),res:r}}
/**
     * Returns whether the provided credentials are expired or not.
     * If there is no expiry time, assumes the token is not expired or expiring.
     * @param accessToken The credentials to check for expiration.
     * @return Whether the credentials are expired or not.
     */isExpired(e){const t=(new Date).getTime();return!!e.expiry_date&&t>=e.expiry_date-this.eagerRefreshThresholdMillis}getScopesArray(){return"string"===typeof this.scopes?[this.scopes]:"undefined"===typeof this.scopes?[i]:this.scopes}}V.BaseExternalAccountClient=BaseExternalAccountClient;return V}var Q="default"in t?t.default:t;var Z="default"in y?y.default:y;var ee={},te=false;function dew$b(){if(te)return ee;te=true;var e,t,r;Object.defineProperty(ee,"__esModule",{value:true});ee.IdentityPoolClient=void 0;const s=Q;const n=Z;const i=dew$c();const o=(0,n.promisify)(null!==(e=s.readFile)&&void 0!==e?e:()=>{});const a=(0,n.promisify)(null!==(t=s.realpath)&&void 0!==t?t:()=>{});const c=(0,n.promisify)(null!==(r=s.lstat)&&void 0!==r?r:()=>{});class IdentityPoolClient extends i.BaseExternalAccountClient{
/**
     * Instantiate an IdentityPoolClient instance using the provided JSON
     * object loaded from an external account credentials file.
     * An error is thrown if the credential is not a valid file-sourced or
     * url-sourced credential or a workforce pool user project is provided
     * with a non workforce audience.
     * @param options The external account options object typically loaded
     *   from the external account JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     */
constructor(e,t){var r,s;super(e,t);this.file=e.credential_source.file;this.url=e.credential_source.url;this.headers=e.credential_source.headers;if(!this.file&&!this.url)throw new Error('No valid Identity Pool "credential_source" provided');this.formatType=(null===(r=e.credential_source.format)||void 0===r?void 0:r.type)||"text";this.formatSubjectTokenFieldName=null===(s=e.credential_source.format)||void 0===s?void 0:s.subject_token_field_name;if("json"!==this.formatType&&"text"!==this.formatType)throw new Error(`Invalid credential_source format "${this.formatType}"`);if("json"===this.formatType&&!this.formatSubjectTokenFieldName)throw new Error("Missing subject_token_field_name for JSON credential_source format")}async retrieveSubjectToken(){return this.file?await this.getTokenFromFile(this.file,this.formatType,this.formatSubjectTokenFieldName):await this.getTokenFromUrl(this.url,this.formatType,this.formatSubjectTokenFieldName,this.headers)}
/**
     * Looks up the external subject token in the file path provided and
     * resolves with that token.
     * @param file The file path where the external credential is located.
     * @param formatType The token file or URL response type (JSON or text).
     * @param formatSubjectTokenFieldName For JSON response types, this is the
     *   subject_token field name. For Azure, this is access_token. For text
     *   response types, this is ignored.
     * @return A promise that resolves with the external subject token.
     */async getTokenFromFile(e,t,r){try{e=await a(e);if(!(await c(e)).isFile())throw new Error}catch(t){t instanceof Error&&(t.message=`The file at ${e} does not exist, or it is not a file. ${t.message}`);throw t}let s;const n=await o(e,{encoding:"utf8"});if("text"===t)s=n;else if("json"===t&&r){const e=JSON.parse(n);s=e[r]}if(!s)throw new Error("Unable to parse the subject_token from the credential_source file");return s}
/**
     * Sends a GET request to the URL provided and resolves with the returned
     * external subject token.
     * @param url The URL to call to retrieve the subject token. This is typically
     *   a local metadata server.
     * @param formatType The token file or URL response type (JSON or text).
     * @param formatSubjectTokenFieldName For JSON response types, this is the
     *   subject_token field name. For Azure, this is access_token. For text
     *   response types, this is ignored.
     * @param headers The optional additional headers to send with the request to
     *   the metadata server url.
     * @return A promise that resolves with the external subject token.
     */async getTokenFromUrl(e,t,r,s){const n={url:e,method:"GET",headers:s,responseType:t};let i;if("text"===t){const e=await this.transporter.request(n);i=e.data}else if("json"===t&&r){const e=await this.transporter.request(n);i=e.data[r]}if(!i)throw new Error("Unable to parse the subject_token from the credential_source URL");return i}}ee.IdentityPoolClient=IdentityPoolClient;return ee}var re={},se=false;function dew$a(){if(se)return re;se=true;Object.defineProperty(re,"__esModule",{value:true});re.AwsRequestSigner=void 0;const e=o();const t="AWS4-HMAC-SHA256";const r="aws4_request";class AwsRequestSigner{
/**
     * Instantiates an AWS API request signer used to send authenticated signed
     * requests to AWS APIs based on the AWS Signature Version 4 signing process.
     * This also provides a mechanism to generate the signed request without
     * sending it.
     * @param getCredentials A mechanism to retrieve AWS security credentials
     *   when needed.
     * @param region The AWS region to use.
     */
constructor(t,r){this.getCredentials=t;this.region=r;this.crypto=(0,e.createCrypto)()}
/**
     * Generates the signed request for the provided HTTP request for calling
     * an AWS API. This follows the steps described at:
     * https://docs.aws.amazon.com/general/latest/gr/sigv4_signing.html
     * @param amzOptions The AWS request options that need to be signed.
     * @return A promise that resolves with the GaxiosOptions containing the
     *   signed HTTP request parameters.
     */async getRequestOptions(e){if(!e.url)throw new Error('"url" is required in "amzOptions"');const t="object"===typeof e.data?JSON.stringify(e.data):e.data;const r=e.url;const s=e.method||"GET";const n=e.body||t;const i=e.headers;const o=await this.getCredentials();const a=new URL(r);const c=await generateAuthenticationHeaderMap({crypto:this.crypto,host:a.host,canonicalUri:a.pathname,canonicalQuerystring:a.search.substr(1),method:s,region:this.region,securityCredentials:o,requestPayload:n,additionalAmzHeaders:i});const l=Object.assign(c.amzDate?{"x-amz-date":c.amzDate}:{},{Authorization:c.authorizationHeader,host:a.host},i||{});o.token&&Object.assign(l,{"x-amz-security-token":o.token});const u={url:r,method:s,headers:l};"undefined"!==typeof n&&(u.body=n);return u}}re.AwsRequestSigner=AwsRequestSigner;
/**
   * Creates the HMAC-SHA256 hash of the provided message using the
   * provided key.
   *
   * @param crypto The crypto instance used to facilitate cryptographic
   *   operations.
   * @param key The HMAC-SHA256 key to use.
   * @param msg The message to hash.
   * @return The computed hash bytes.
   */async function sign(e,t,r){return await e.signWithHmacSha256(t,r)}
/**
   * Calculates the signing key used to calculate the signature for
   * AWS Signature Version 4 based on:
   * https://docs.aws.amazon.com/general/latest/gr/sigv4-calculate-signature.html
   *
   * @param crypto The crypto instance used to facilitate cryptographic
   *   operations.
   * @param key The AWS secret access key.
   * @param dateStamp The '%Y%m%d' date format.
   * @param region The AWS region.
   * @param serviceName The AWS service name, eg. sts.
   * @return The signing key bytes.
   */async function getSigningKey(e,t,r,s,n){const i=await sign(e,`AWS4${t}`,r);const o=await sign(e,i,s);const a=await sign(e,o,n);const c=await sign(e,a,"aws4_request");return c}
/**
   * Generates the authentication header map needed for generating the AWS
   * Signature Version 4 signed request.
   *
   * @param option The options needed to compute the authentication header map.
   * @return The AWS authentication header map which constitutes of the following
   *   components: amz-date, authorization header and canonical query string.
   */async function generateAuthenticationHeaderMap(s){const n=s.additionalAmzHeaders||{};const i=s.requestPayload||"";const o=s.host.split(".")[0];const a=new Date;const c=a.toISOString().replace(/[-:]/g,"").replace(/\.[0-9]+/,"");const l=a.toISOString().replace(/[-]/g,"").replace(/T.*/,"");const u={};Object.keys(n).forEach((e=>{u[e.toLowerCase()]=n[e]}));s.securityCredentials.token&&(u["x-amz-security-token"]=s.securityCredentials.token);const d=Object.assign({host:s.host},u.date?{}:{"x-amz-date":c},u);let h="";const p=Object.keys(d).sort();p.forEach((e=>{h+=`${e}:${d[e]}\n`}));const f=p.join(";");const m=await s.crypto.sha256DigestHex(i);const g=`${s.method}\n${s.canonicalUri}\n${s.canonicalQuerystring}\n${h}\n${f}\n${m}`;const A=`${l}/${s.region}/${o}/${r}`;const E=`${t}\n${c}\n${A}\n`+await s.crypto.sha256DigestHex(g);const y=await getSigningKey(s.crypto,s.securityCredentials.secretAccessKey,l,s.region,o);const _=await sign(s.crypto,y,E);const w=`${t} Credential=${s.securityCredentials.accessKeyId}/${A}, SignedHeaders=${f}, Signature=${(0,e.fromArrayBufferToHex)(_)}`;return{amzDate:u.date?void 0:c,authorizationHeader:w,canonicalQuerystring:s.canonicalQuerystring}}return re}var ne={},ie=false;function dew$9(){if(ie)return ne;ie=true;var e=p;Object.defineProperty(ne,"__esModule",{value:true});ne.AwsClient=void 0;const t=dew$a();const r=dew$c();class AwsClient extends r.BaseExternalAccountClient{
/**
     * Instantiates an AwsClient instance using the provided JSON
     * object loaded from an external account credentials file.
     * An error is thrown if the credential is not a valid AWS credential.
     * @param options The external account options object typically loaded
     *   from the external account JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     */
constructor(e,t){super(e,t);this.environmentId=e.credential_source.environment_id;this.regionUrl=e.credential_source.region_url;this.securityCredentialsUrl=e.credential_source.url;this.regionalCredVerificationUrl=e.credential_source.regional_cred_verification_url;this.imdsV2SessionTokenUrl=e.credential_source.imdsv2_session_token_url;this.awsRequestSigner=null;this.region="";this.validateEnvironmentId()}validateEnvironmentId(){var e;const t=null===(e=this.environmentId)||void 0===e?void 0:e.match(/^(aws)(\d+)$/);if(!t||!this.regionalCredVerificationUrl)throw new Error('No valid AWS "credential_source" provided');if(1!==parseInt(t[2],10))throw new Error(`aws version "${t[2]}" is not supported in the current build.`)}async retrieveSubjectToken(){if(!this.awsRequestSigner){const e={};this.shouldUseMetadataServer()&&this.imdsV2SessionTokenUrl&&(e["x-aws-ec2-metadata-token"]=await this.getImdsV2SessionToken());this.region=await this.getAwsRegion(e);this.awsRequestSigner=new t.AwsRequestSigner((async()=>{if(this.securityCredentialsFromEnv)return this.securityCredentialsFromEnv;const t=await this.getAwsRoleName(e);const r=await this.getAwsSecurityCredentials(t,e);return{accessKeyId:r.AccessKeyId,secretAccessKey:r.SecretAccessKey,token:r.Token}}),this.region)}const e=await this.awsRequestSigner.getRequestOptions({url:this.regionalCredVerificationUrl.replace("{region}",this.region),method:"POST"});const r=[];const s=Object.assign({"x-goog-cloud-target-resource":this.audience},e.headers);for(const e in s)r.push({key:e,value:s[e]});return encodeURIComponent(JSON.stringify({url:e.url,method:e.method,headers:r}))}async getImdsV2SessionToken(){const e={url:this.imdsV2SessionTokenUrl,method:"PUT",responseType:"text",headers:{"x-aws-ec2-metadata-token-ttl-seconds":"300"}};const t=await this.transporter.request(e);return t.data}
/**
     * @param headers The headers to be used in the metadata request.
     * @return A promise that resolves with the current AWS region.
     */async getAwsRegion(e){if(this.regionFromEnv)return this.regionFromEnv;if(!this.regionUrl)throw new Error('Unable to determine AWS region due to missing "options.credential_source.region_url"');const t={url:this.regionUrl,method:"GET",responseType:"text",headers:e};const r=await this.transporter.request(t);return r.data.substr(0,r.data.length-1)}
/**
     * @param headers The headers to be used in the metadata request.
     * @return A promise that resolves with the assigned role to the current
     *   AWS VM. This is needed for calling the security-credentials endpoint.
     */async getAwsRoleName(e){if(!this.securityCredentialsUrl)throw new Error('Unable to determine AWS role name due to missing "options.credential_source.url"');const t={url:this.securityCredentialsUrl,method:"GET",responseType:"text",headers:e};const r=await this.transporter.request(t);return r.data}
/**
     * Retrieves the temporary AWS credentials by calling the security-credentials
     * endpoint as specified in the `credential_source` object.
     * @param roleName The role attached to the current VM.
     * @param headers The headers to be used in the metadata request.
     * @return A promise that resolves with the temporary AWS credentials
     *   needed for creating the GetCallerIdentity signed request.
     */async getAwsSecurityCredentials(e,t){const r=await this.transporter.request({url:`${this.securityCredentialsUrl}/${e}`,responseType:"json",headers:t});return r.data}shouldUseMetadataServer(){return!this.regionFromEnv||!this.securityCredentialsFromEnv}get regionFromEnv(){return e.env.AWS_REGION||e.env.AWS_DEFAULT_REGION||null}get securityCredentialsFromEnv(){return e.env.AWS_ACCESS_KEY_ID&&e.env.AWS_SECRET_ACCESS_KEY?{accessKeyId:e.env.AWS_ACCESS_KEY_ID,secretAccessKey:e.env.AWS_SECRET_ACCESS_KEY,token:e.env.AWS_SESSION_TOKEN}:null}}ne.AwsClient=AwsClient;AwsClient.AWS_EC2_METADATA_IPV4_ADDRESS="169.254.169.254";AwsClient.AWS_EC2_METADATA_IPV6_ADDRESS="fd00:ec2::254";return ne}var oe={},ae=false;function dew$8(){if(ae)return oe;ae=true;Object.defineProperty(oe,"__esModule",{value:true});oe.InvalidSubjectTokenError=oe.InvalidMessageFieldError=oe.InvalidCodeFieldError=oe.InvalidTokenTypeFieldError=oe.InvalidExpirationTimeFieldError=oe.InvalidSuccessFieldError=oe.InvalidVersionFieldError=oe.ExecutableResponseError=oe.ExecutableResponse=void 0;const e="urn:ietf:params:oauth:token-type:saml2";const t="urn:ietf:params:oauth:token-type:id_token";const r="urn:ietf:params:oauth:token-type:jwt";class ExecutableResponse{
/**
     * Instantiates an ExecutableResponse instance using the provided JSON object
     * from the output of the executable.
     * @param responseJson Response from a 3rd party executable, loaded from a
     * run of the executable or a cached output file.
     */
constructor(s){if(!s.version)throw new InvalidVersionFieldError("Executable response must contain a 'version' field.");if(void 0===s.success)throw new InvalidSuccessFieldError("Executable response must contain a 'success' field.");this.version=s.version;this.success=s.success;if(this.success){this.expirationTime=s.expiration_time;this.tokenType=s.token_type;if(this.tokenType!==e&&this.tokenType!==t&&this.tokenType!==r)throw new InvalidTokenTypeFieldError(`Executable response must contain a 'token_type' field when successful and it must be one of ${t}, ${r}, or ${e}.`);if(this.tokenType===e){if(!s.saml_response)throw new InvalidSubjectTokenError(`Executable response must contain a 'saml_response' field when token_type=${e}.`);this.subjectToken=s.saml_response}else{if(!s.id_token)throw new InvalidSubjectTokenError(`Executable response must contain a 'id_token' field when token_type=${t} or ${r}.`);this.subjectToken=s.id_token}}else{if(!s.code)throw new InvalidCodeFieldError("Executable response must contain a 'code' field when unsuccessful.");if(!s.message)throw new InvalidMessageFieldError("Executable response must contain a 'message' field when unsuccessful.");this.errorCode=s.code;this.errorMessage=s.message}}isValid(){return!this.isExpired()&&this.success}isExpired(){return void 0!==this.expirationTime&&this.expirationTime<Math.round(Date.now()/1e3)}}oe.ExecutableResponse=ExecutableResponse;class ExecutableResponseError extends Error{constructor(e){super(e);Object.setPrototypeOf(this,new.target.prototype)}}oe.ExecutableResponseError=ExecutableResponseError;class InvalidVersionFieldError extends ExecutableResponseError{}oe.InvalidVersionFieldError=InvalidVersionFieldError;class InvalidSuccessFieldError extends ExecutableResponseError{}oe.InvalidSuccessFieldError=InvalidSuccessFieldError;class InvalidExpirationTimeFieldError extends ExecutableResponseError{}oe.InvalidExpirationTimeFieldError=InvalidExpirationTimeFieldError;class InvalidTokenTypeFieldError extends ExecutableResponseError{}oe.InvalidTokenTypeFieldError=InvalidTokenTypeFieldError;class InvalidCodeFieldError extends ExecutableResponseError{}oe.InvalidCodeFieldError=InvalidCodeFieldError;class InvalidMessageFieldError extends ExecutableResponseError{}oe.InvalidMessageFieldError=InvalidMessageFieldError;class InvalidSubjectTokenError extends ExecutableResponseError{}oe.InvalidSubjectTokenError=InvalidSubjectTokenError;return oe}var ce="default"in e?e.default:e;var le="default"in t?t.default:t;var ue={},de=false;function dew$7(){if(de)return ue;de=true;var e=p;Object.defineProperty(ue,"__esModule",{value:true});ue.PluggableAuthHandler=void 0;const t=dew$6();const r=dew$8();const s=ce;const n=le;class PluggableAuthHandler{constructor(e){if(!e.command)throw new Error("No command provided.");this.commandComponents=PluggableAuthHandler.parseCommand(e.command);this.timeoutMillis=e.timeoutMillis;if(!this.timeoutMillis)throw new Error("No timeoutMillis provided.");this.outputFile=e.outputFile}
/**
     * Calls user provided executable to get a 3rd party subject token and
     * returns the response.
     * @param envMap a Map of additional Environment Variables required for
     *   the executable.
     * @return A promise that resolves with the executable response.
     */retrieveResponseFromExecutable(n){return new Promise(((i,o)=>{const a=s.spawn(this.commandComponents[0],this.commandComponents.slice(1),{env:{...e.env,...Object.fromEntries(n)}});let c="";a.stdout.on("data",(e=>{c+=e}));a.stderr.on("data",(e=>{c+=e}));const l=setTimeout((()=>{a.removeAllListeners();a.kill();return o(new Error("The executable failed to finish within the timeout specified."))}),this.timeoutMillis);a.on("close",(e=>{clearTimeout(l);if(0!==e)return o(new t.ExecutableError(c,e.toString()));try{const e=JSON.parse(c);const t=new r.ExecutableResponse(e);return i(t)}catch(e){return e instanceof r.ExecutableResponseError?o(e):o(new r.ExecutableResponseError(`The executable returned an invalid response: ${c}`))}}))}))}async retrieveCachedResponse(){if(!this.outputFile||0===this.outputFile.length)return;let e;try{e=await n.promises.realpath(this.outputFile)}catch(e){return}if(!(await n.promises.lstat(e)).isFile())return;const t=await n.promises.readFile(e,{encoding:"utf8"});if(""!==t)try{const e=JSON.parse(t);const s=new r.ExecutableResponse(e);return s.isValid()?new r.ExecutableResponse(e):void 0}catch(e){if(e instanceof r.ExecutableResponseError)throw e;throw new r.ExecutableResponseError(`The output file contained an invalid response: ${t}`)}}static parseCommand(e){const t=e.match(/(?:[^\s"]+|"[^"]*")+/g);if(!t)throw new Error(`Provided command: "${e}" could not be parsed.`);for(let e=0;e<t.length;e++)'"'===t[e][0]&&'"'===t[e].slice(-1)&&(t[e]=t[e].slice(1,-1));return t}}ue.PluggableAuthHandler=PluggableAuthHandler;return ue}var he={},pe=false;function dew$6(){if(pe)return he;pe=true;var e=p;Object.defineProperty(he,"__esModule",{value:true});he.PluggableAuthClient=he.ExecutableError=void 0;const t=dew$c();const r=dew$8();const s=dew$7();class ExecutableError extends Error{constructor(e,t){super(`The executable failed with exit code: ${t} and error message: ${e}.`);this.code=t;Object.setPrototypeOf(this,new.target.prototype)}}he.ExecutableError=ExecutableError;const n=3e4;const i=5e3;const o=12e4;const a="GOOGLE_EXTERNAL_ACCOUNT_ALLOW_EXECUTABLES";const c=1;class PluggableAuthClient extends t.BaseExternalAccountClient{
/**
     * Instantiates a PluggableAuthClient instance using the provided JSON
     * object loaded from an external account credentials file.
     * An error is thrown if the credential is not a valid pluggable auth credential.
     * @param options The external account options object typically loaded from
     *   the external account JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     */
constructor(e,t){super(e,t);if(!e.credential_source.executable)throw new Error('No valid Pluggable Auth "credential_source" provided.');this.command=e.credential_source.executable.command;if(!this.command)throw new Error('No valid Pluggable Auth "credential_source" provided.');if(void 0===e.credential_source.executable.timeout_millis)this.timeoutMillis=n;else{this.timeoutMillis=e.credential_source.executable.timeout_millis;if(this.timeoutMillis<i||this.timeoutMillis>o)throw new Error(`Timeout must be between ${i} and ${o} milliseconds.`)}this.outputFile=e.credential_source.executable.output_file;this.handler=new s.PluggableAuthHandler({command:this.command,timeoutMillis:this.timeoutMillis,outputFile:this.outputFile})}async retrieveSubjectToken(){if("1"!==e.env[a])throw new Error("Pluggable Auth executables need to be explicitly allowed to run by setting the GOOGLE_EXTERNAL_ACCOUNT_ALLOW_EXECUTABLES environment Variable to 1.");let t;this.outputFile&&(t=await this.handler.retrieveCachedResponse());if(!t){const e=new Map;e.set("GOOGLE_EXTERNAL_ACCOUNT_AUDIENCE",this.audience);e.set("GOOGLE_EXTERNAL_ACCOUNT_TOKEN_TYPE",this.subjectTokenType);e.set("GOOGLE_EXTERNAL_ACCOUNT_INTERACTIVE","0");this.outputFile&&e.set("GOOGLE_EXTERNAL_ACCOUNT_OUTPUT_FILE",this.outputFile);const r=this.getServiceAccountEmail();r&&e.set("GOOGLE_EXTERNAL_ACCOUNT_IMPERSONATED_EMAIL",r);t=await this.handler.retrieveResponseFromExecutable(e)}if(t.version>c)throw new Error(`Version of executable is not currently supported, maximum supported version is ${c}.`);if(!t.success)throw new ExecutableError(t.errorMessage,t.errorCode);if(this.outputFile&&!t.expirationTime)throw new r.InvalidExpirationTimeFieldError("The executable response must contain the `expiration_time` field for successful responses when an output_file has been specified in the configuration.");if(t.isExpired())throw new Error("Executable response is expired.");return t.subjectToken}}he.PluggableAuthClient=PluggableAuthClient;return he}var fe={},me=false;function dew$5(){if(me)return fe;me=true;Object.defineProperty(fe,"__esModule",{value:true});fe.ExternalAccountClient=void 0;const e=dew$c();const t=dew$b();const r=dew$9();const s=dew$6();class ExternalAccountClient{constructor(){throw new Error("ExternalAccountClients should be initialized via: ExternalAccountClient.fromJSON(), directly via explicit constructors, eg. new AwsClient(options), new IdentityPoolClient(options), newPluggableAuthClientOptions, or via new GoogleAuth(options).getClient()")}
/**
     * This static method will instantiate the
     * corresponding type of external account credential depending on the
     * underlying credential source.
     * @param options The external account options object typically loaded
     *   from the external account JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     * @return A BaseExternalAccountClient instance or null if the options
     *   provided do not correspond to an external account credential.
     */static fromJSON(n,i){var o,a;return n&&n.type===e.EXTERNAL_ACCOUNT_TYPE?(null===(o=n.credential_source)||void 0===o?void 0:o.environment_id)?new r.AwsClient(n,i):(null===(a=n.credential_source)||void 0===a?void 0:a.executable)?new s.PluggableAuthClient(n,i):new t.IdentityPoolClient(n,i):null}}fe.ExternalAccountClient=ExternalAccountClient;return fe}var ge="default"in d?d.default:d;var Ae="default"in A?A.default:A;var Ee={},ye=false;function dew$4(){if(ye)return Ee;ye=true;Object.defineProperty(Ee,"__esModule",{value:true});Ee.ExternalAccountAuthorizedUserClient=Ee.EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE=void 0;const e=c();const t=dew$e();const r=ge;const s=Ae;const n=dew$c();Ee.EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE="external_account_authorized_user";class ExternalAccountAuthorizedUserHandler extends t.OAuthClientAuthHandler{
/**
     * Initializes an ExternalAccountAuthorizedUserHandler instance.
     * @param url The URL of the token refresh endpoint.
     * @param transporter The transporter to use for the refresh request.
     * @param clientAuthentication The client authentication credentials to use
     *   for the refresh request.
     */
constructor(e,t,r){super(r);this.url=e;this.transporter=t}
/**
     * Requests a new access token from the token_url endpoint using the provided
     *   refresh token.
     * @param refreshToken The refresh token to use to generate a new access token.
     * @param additionalHeaders Optional additional headers to pass along the
     *   request.
     * @return A promise that resolves with the token refresh response containing
     *   the requested access token and its expiration time.
     */async refreshToken(e,s){const n=new URLSearchParams({grant_type:"refresh_token",refresh_token:e});const i={"Content-Type":"application/x-www-form-urlencoded",...s};const o={url:this.url,method:"POST",headers:i,data:n.toString(),responseType:"json"};this.applyClientAuthenticationOptions(o);try{const e=await this.transporter.request(o);const t=e.data;t.res=e;return t}catch(e){if(e instanceof r.GaxiosError&&e.response)throw(0,t.getErrorFromOAuthErrorResponse)(e.response.data,e);throw e}}}class ExternalAccountAuthorizedUserClient extends e.AuthClient{
/**
     * Instantiates an ExternalAccountAuthorizedUserClient instances using the
     * provided JSON object loaded from a credentials files.
     * An error is throws if the credential is not valid.
     * @param options The external account authorized user option object typically
     *   from the external accoutn authorized user JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     */
constructor(e,t){super();this.refreshToken=e.refresh_token;const r={confidentialClientType:"basic",clientId:e.client_id,clientSecret:e.client_secret};this.externalAccountAuthorizedUserHandler=new ExternalAccountAuthorizedUserHandler(e.token_url,this.transporter,r);this.cachedAccessToken=null;this.quotaProjectId=e.quota_project_id;"number"!==typeof(null===t||void 0===t?void 0:t.eagerRefreshThresholdMillis)?this.eagerRefreshThresholdMillis=n.EXPIRATION_TIME_OFFSET:this.eagerRefreshThresholdMillis=t.eagerRefreshThresholdMillis;this.forceRefreshOnFailure=!!(null===t||void 0===t?void 0:t.forceRefreshOnFailure)}async getAccessToken(){this.cachedAccessToken&&!this.isExpired(this.cachedAccessToken)||await this.refreshAccessTokenAsync();return{token:this.cachedAccessToken.access_token,res:this.cachedAccessToken.res}}async getRequestHeaders(){const e=await this.getAccessToken();const t={Authorization:`Bearer ${e.token}`};return this.addSharedMetadataHeaders(t)}request(e,t){if(!t)return this.requestAsync(e);this.requestAsync(e).then((e=>t(null,e)),(e=>t(e,e.response)))}
/**
     * Authenticates the provided HTTP request, processes it and resolves with the
     * returned response.
     * @param opts The HTTP request options.
     * @param retry Whether the current attempt is a retry after a failed attempt.
     * @return A promise that resolves with the successful response.
     */async requestAsync(e,t=false){let r;try{const t=await this.getRequestHeaders();e.headers=e.headers||{};t&&t["x-goog-user-project"]&&(e.headers["x-goog-user-project"]=t["x-goog-user-project"]);t&&t.Authorization&&(e.headers.Authorization=t.Authorization);r=await this.transporter.request(e)}catch(r){const n=r.response;if(n){const r=n.status;const i=n.config.data instanceof s.Readable;const o=401===r||403===r;if(!t&&o&&!i&&this.forceRefreshOnFailure){await this.refreshAccessTokenAsync();return await this.requestAsync(e,true)}}throw r}return r}async refreshAccessTokenAsync(){const e=await this.externalAccountAuthorizedUserHandler.refreshToken(this.refreshToken);this.cachedAccessToken={access_token:e.access_token,expiry_date:(new Date).getTime()+1e3*e.expires_in,res:e.res};void 0!==e.refresh_token&&(this.refreshToken=e.refresh_token);return this.cachedAccessToken}
/**
     * Returns whether the provided credentials are expired or not.
     * If there is no expiry time, assumes the token is not expired or expiring.
     * @param credentials The credentials to check for expiration.
     * @return Whether the credentials are expired or not.
     */isExpired(e){const t=(new Date).getTime();return!!e.expiry_date&&t>=e.expiry_date-this.eagerRefreshThresholdMillis}}Ee.ExternalAccountAuthorizedUserClient=ExternalAccountAuthorizedUserClient;return Ee}var _e="default"in e?e.default:e;var we="default"in t?t.default:t;var Te="default"in r?r.default:r;var Ce="default"in s?s.default:s;var ve="default"in n?n.default:n;var ke={},Oe=false;function dew$3(){if(Oe)return ke;Oe=true;var e=p;Object.defineProperty(ke,"__esModule",{value:true});ke.GoogleAuth=ke.CLOUD_SDK_CLIENT_ID=void 0;const t=_e;const r=we;const s=Te;const n=Ce;const i=ve;const c=o();const l=a();const u=dew$l();const d=dew$k();const h=dew$j();const f=dew$h();const m=dew$g();const g=dew$f();const A=dew$5();const E=dew$c();const y=dew$4();ke.CLOUD_SDK_CLIENT_ID="764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com";const _={NO_PROJECT_ID_FOUND:"Unable to detect a Project Id in the current environment. \nTo learn more about authentication and Google APIs, visit: \nhttps://cloud.google.com/docs/authentication/getting-started"};class GoogleAuth{get isGCE(){return this.checkIsGCE}constructor(e){this.checkIsGCE=void 0;this.jsonContent=null;this.cachedCredential=null;e=e||{};this._cachedProjectId=e.projectId||null;this.cachedCredential=e.authClient||null;this.keyFilename=e.keyFilename||e.keyFile;this.scopes=e.scopes;this.jsonContent=e.credentials||null;this.clientOptions=e.clientOptions}setGapicJWTValues(e){e.defaultServicePath=this.defaultServicePath;e.useJWTAccessWithScope=this.useJWTAccessWithScope;e.defaultScopes=this.defaultScopes}getProjectId(e){if(!e)return this.getProjectIdAsync();this.getProjectIdAsync().then((t=>e(null,t)),e)}
/**
     * A temporary method for internal `getProjectId` usages where `null` is
     * acceptable. In a future major release, `getProjectId` should return `null`
     * (as the `Promise<string | null>` base signature describes) and this private
     * method should be removed.
     *
     * @returns Promise that resolves with project id (or `null`)
     */async getProjectIdOptional(){try{return await this.getProjectId()}catch(e){if(e instanceof Error&&e.message===_.NO_PROJECT_ID_FOUND)return null;throw e}}
/*
     * A private method for finding and caching a projectId.
     *
     * Supports environments in order of precedence:
     * - GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variable
     * - GOOGLE_APPLICATION_CREDENTIALS JSON file
     * - Cloud SDK: `gcloud config config-helper --format json`
     * - GCE project ID from metadata server
     *
     * @returns projectId
     */async findAndCacheProjectId(){let e=null;e||(e=await this.getProductionProjectId());e||(e=await this.getFileProjectId());e||(e=await this.getDefaultServiceProjectId());e||(e=await this.getGCEProjectId());e||(e=await this.getExternalAccountClientProjectId());if(e){this._cachedProjectId=e;return e}throw new Error(_.NO_PROJECT_ID_FOUND)}async getProjectIdAsync(){if(this._cachedProjectId)return this._cachedProjectId;this._findProjectIdPromise||(this._findProjectIdPromise=this.findAndCacheProjectId());return this._findProjectIdPromise}
/**
     * @returns Any scopes (user-specified or default scopes specified by the
     *   client library) that need to be set on the current Auth client.
     */getAnyScopes(){return this.scopes||this.defaultScopes}getApplicationDefault(e={},t){let r;"function"===typeof e?t=e:r=e;if(!t)return this.getApplicationDefaultAsync(r);this.getApplicationDefaultAsync(r).then((e=>t(null,e.credential,e.projectId)),t)}async getApplicationDefaultAsync(t={}){if(this.cachedCredential)return await this.prepareAndCacheADC(this.cachedCredential);const r=e.env.GOOGLE_CLOUD_QUOTA_PROJECT;let s;s=await this._tryGetApplicationCredentialsFromEnvironmentVariable(t);if(s){s instanceof f.JWT?s.scopes=this.scopes:s instanceof E.BaseExternalAccountClient&&(s.scopes=this.getAnyScopes());return await this.prepareAndCacheADC(s,r)}s=await this._tryGetApplicationCredentialsFromWellKnownFile(t);if(s){s instanceof f.JWT?s.scopes=this.scopes:s instanceof E.BaseExternalAccountClient&&(s.scopes=this.getAnyScopes());return await this.prepareAndCacheADC(s,r)}let n;try{n=await this._checkIsGCE()}catch(e){e instanceof Error&&(e.message=`Unexpected error determining execution environment: ${e.message}`);throw e}if(!n)throw new Error("Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.");t.scopes=this.getAnyScopes();return await this.prepareAndCacheADC(new u.Compute(t),r)}async prepareAndCacheADC(e,t){const r=await this.getProjectIdOptional();t&&(e.quotaProjectId=t);this.cachedCredential=e;return{credential:e,projectId:r}}
/**
     * Determines whether the auth layer is running on Google Compute Engine.
     * Checks for GCP Residency, then fallback to checking if metadata server
     * is available.
     *
     * @returns A promise that resolves with the boolean.
     * @api private
     */async _checkIsGCE(){void 0===this.checkIsGCE&&(this.checkIsGCE=s.getGCPResidency()||await s.isAvailable());return this.checkIsGCE}
/**
     * Attempts to load default credentials from the environment variable path..
     * @returns Promise that resolves with the OAuth2Client or null.
     * @api private
     */async _tryGetApplicationCredentialsFromEnvironmentVariable(t){const r=e.env.GOOGLE_APPLICATION_CREDENTIALS||e.env.google_application_credentials;if(!r||0===r.length)return null;try{return this._getApplicationCredentialsFromFilePath(r,t)}catch(e){e instanceof Error&&(e.message=`Unable to read the credential file specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable: ${e.message}`);throw e}}async _tryGetApplicationCredentialsFromWellKnownFile(t){let s=null;if(this._isWindows())s=e.env.APPDATA;else{const t=e.env.HOME;t&&(s=i.join(t,".config"))}if(s){s=i.join(s,"gcloud","application_default_credentials.json");r.existsSync(s)||(s=null)}if(!s)return null;const n=await this._getApplicationCredentialsFromFilePath(s,t);return n}
/**
     * Attempts to load default credentials from a file at the given path..
     * @param filePath The path to the file to read.
     * @returns Promise that resolves with the OAuth2Client
     * @api private
     */async _getApplicationCredentialsFromFilePath(e,t={}){if(!e||0===e.length)throw new Error("The file path is invalid.");try{e=r.realpathSync(e);if(!r.lstatSync(e).isFile())throw new Error}catch(t){t instanceof Error&&(t.message=`The file at ${e} does not exist, or it is not a file. ${t.message}`);throw t}const s=r.createReadStream(e);return this.fromStream(s,t)}
/**
     * Create a credentials instance using a given impersonated input options.
     * @param json The impersonated input object.
     * @returns JWT or UserRefresh Client with data
     */fromImpersonatedJSON(e){var t,r,s,n;if(!e)throw new Error("Must pass in a JSON object containing an  impersonated refresh token");if(e.type!==g.IMPERSONATED_ACCOUNT_TYPE)throw new Error(`The incoming JSON object does not have the "${g.IMPERSONATED_ACCOUNT_TYPE}" type`);if(!e.source_credentials)throw new Error("The incoming JSON object does not contain a source_credentials field");if(!e.service_account_impersonation_url)throw new Error("The incoming JSON object does not contain a service_account_impersonation_url field");const i=new m.UserRefreshClient(e.source_credentials.client_id,e.source_credentials.client_secret,e.source_credentials.refresh_token);const o=null===(r=null===(t=/(?<target>[^/]+):generateAccessToken$/.exec(e.service_account_impersonation_url))||void 0===t?void 0:t.groups)||void 0===r?void 0:r.target;if(!o)throw new RangeError(`Cannot extract target principal from ${e.service_account_impersonation_url}`);const a=null!==(s=this.getAnyScopes())&&void 0!==s?s:[];const c=new g.Impersonated({delegates:null!==(n=e.delegates)&&void 0!==n?n:[],sourceClient:i,targetPrincipal:o,targetScopes:Array.isArray(a)?a:[a]});return c}
/**
     * Create a credentials instance using the given input options.
     * @param json The input object.
     * @param options The JWT or UserRefresh options for the client
     * @returns JWT or UserRefresh Client with data
     */fromJSON(e,t={}){let r;t=t||{};if(e.type===m.USER_REFRESH_ACCOUNT_TYPE){r=new m.UserRefreshClient(t);r.fromJSON(e)}else if(e.type===g.IMPERSONATED_ACCOUNT_TYPE)r=this.fromImpersonatedJSON(e);else if(e.type===E.EXTERNAL_ACCOUNT_TYPE){r=A.ExternalAccountClient.fromJSON(e,t);r.scopes=this.getAnyScopes()}else if(e.type===y.EXTERNAL_ACCOUNT_AUTHORIZED_USER_TYPE)r=new y.ExternalAccountAuthorizedUserClient(e,t);else{t.scopes=this.scopes;r=new f.JWT(t);this.setGapicJWTValues(r);r.fromJSON(e)}return r}
/**
     * Return a JWT or UserRefreshClient from JavaScript object, caching both the
     * object used to instantiate and the client.
     * @param json The input object.
     * @param options The JWT or UserRefresh options for the client
     * @returns JWT or UserRefresh Client with data
     */_cacheClientFromJSON(e,t){const r=this.fromJSON(e,t);this.jsonContent=e;this.cachedCredential=r;return r}fromStream(e,t={},r){let s={};"function"===typeof t?r=t:s=t;if(!r)return this.fromStreamAsync(e,s);this.fromStreamAsync(e,s).then((e=>r(null,e)),r)}fromStreamAsync(e,t){return new Promise(((r,s)=>{if(!e)throw new Error("Must pass in a stream containing the Google auth settings.");let n="";e.setEncoding("utf8").on("error",s).on("data",(e=>n+=e)).on("end",(()=>{try{try{const e=JSON.parse(n);const s=this._cacheClientFromJSON(e,t);return r(s)}catch(e){if(!this.keyFilename)throw e;const t=new f.JWT({...this.clientOptions,keyFile:this.keyFilename});this.cachedCredential=t;this.setGapicJWTValues(t);return r(t)}}catch(e){return s(e)}}))}))}
/**
     * Create a credentials instance using the given API key string.
     * @param apiKey The API key string
     * @param options An optional options object.
     * @returns A JWT loaded from the key
     */fromAPIKey(e,t){t=t||{};const r=new f.JWT(t);r.fromAPIKey(e);return r}_isWindows(){const e=n.platform();return!!(e&&e.length>=3&&"win"===e.substring(0,3).toLowerCase())}async getDefaultServiceProjectId(){return new Promise((e=>{(0,t.exec)("gcloud config config-helper --format json",((t,r)=>{if(!t&&r)try{const t=JSON.parse(r).configuration.properties.core.project;e(t);return}catch(e){}e(null)}))}))}getProductionProjectId(){return e.env.GCLOUD_PROJECT||e.env.GOOGLE_CLOUD_PROJECT||e.env.gcloud_project||e.env.google_cloud_project}async getFileProjectId(){if(this.cachedCredential)return this.cachedCredential.projectId;if(this.keyFilename){const e=await this.getClient();if(e&&e.projectId)return e.projectId}const e=await this._tryGetApplicationCredentialsFromEnvironmentVariable();return e?e.projectId:null}async getExternalAccountClientProjectId(){if(!this.jsonContent||this.jsonContent.type!==E.EXTERNAL_ACCOUNT_TYPE)return null;const e=await this.getClient();return await e.getProjectId()}async getGCEProjectId(){try{const e=await s.project("project-id");return e}catch(e){return null}}getCredentials(e){if(!e)return this.getCredentialsAsync();this.getCredentialsAsync().then((t=>e(null,t)),e)}async getCredentialsAsync(){const e=await this.getClient();if(e instanceof E.BaseExternalAccountClient){const t=e.getServiceAccountEmail();if(t)return{client_email:t}}if(this.jsonContent){const e={client_email:this.jsonContent.client_email,private_key:this.jsonContent.private_key};return e}const t=await this._checkIsGCE();if(!t)throw new Error("Unknown error.");const r=await s.instance({property:"service-accounts/",params:{recursive:"true"}});if(!r||!r.default||!r.default.email)throw new Error("Failure from metadata server.");return{client_email:r.default.email}}async getClient(){if(!this.cachedCredential)if(this.jsonContent)this._cacheClientFromJSON(this.jsonContent,this.clientOptions);else if(this.keyFilename){const e=i.resolve(this.keyFilename);const t=r.createReadStream(e);await this.fromStreamAsync(t,this.clientOptions)}else await this.getApplicationDefaultAsync(this.clientOptions);return this.cachedCredential}
/**
     * Creates a client which will fetch an ID token for authorization.
     * @param targetAudience the audience for the fetched ID token.
     * @returns IdTokenClient for making HTTP calls authenticated with ID tokens.
     */async getIdTokenClient(e){const t=await this.getClient();if(!("fetchIdToken"in t))throw new Error("Cannot fetch ID token in this environment, use GCE or set the GOOGLE_APPLICATION_CREDENTIALS environment variable to a service account credentials JSON file.");return new d.IdTokenClient({targetAudience:e,idTokenProvider:t})}async getAccessToken(){const e=await this.getClient();return(await e.getAccessToken()).token}async getRequestHeaders(e){const t=await this.getClient();return t.getRequestHeaders(e)}
/**
     * Obtain credentials for a request, then attach the appropriate headers to
     * the request options.
     * @param opts Axios or Request options on which to attach the headers
     */async authorizeRequest(e){e=e||{};const t=e.url||e.uri;const r=await this.getClient();const s=await r.getRequestHeaders(t);e.headers=Object.assign(e.headers||{},s);return e}
/**
     * Automatically obtain application default credentials, and make an
     * HTTP request using the given options.
     * @param opts Axios request options for the HTTP request.
     */
async request(e){const t=await this.getClient();return t.request(e)}getEnv(){return(0,h.getEnv)()}
/**
     * Sign the given data with the current private key, or go out
     * to the IAM API to sign it.
     * @param data The data to be signed.
     */async sign(e){const t=await this.getClient();const r=(0,c.createCrypto)();if(t instanceof f.JWT&&t.key){const s=await r.sign(t.key,e);return s}const s=await this.getCredentials();if(!s.client_email)throw new Error("Cannot sign data without `client_email`.");return this.signBlob(r,s.client_email,e)}async signBlob(e,t,r){const s=`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${t}:signBlob`;const n=await this.request({method:"POST",url:s,data:{payload:e.encodeBase64StringUtf8(r)}});return n.data.signedBlob}}ke.GoogleAuth=GoogleAuth;GoogleAuth.DefaultTransporter=l.DefaultTransporter;return ke}var be={},Se=false;function dew$2(){if(Se)return be;Se=true;Object.defineProperty(be,"__esModule",{value:true});be.IAMAuth=void 0;class IAMAuth{
/**
     * IAM credentials.
     *
     * @param selector the iam authority selector
     * @param token the token
     * @constructor
     */
constructor(e,t){this.selector=e;this.token=t;this.selector=e;this.token=t}getRequestHeaders(){return{"x-goog-iam-authority-selector":this.selector,"x-goog-iam-authorization-token":this.token}}}be.IAMAuth=IAMAuth;return be}var Ie="default"in A?A.default:A;var je={},Pe=false;function dew$1(){if(Pe)return je;Pe=true;Object.defineProperty(je,"__esModule",{value:true});je.DownscopedClient=je.EXPIRATION_TIME_OFFSET=je.MAX_ACCESS_BOUNDARY_RULES_COUNT=void 0;const e=Ie;const t=c();const r=dew$d();const s="urn:ietf:params:oauth:grant-type:token-exchange";const n="urn:ietf:params:oauth:token-type:access_token";const i="urn:ietf:params:oauth:token-type:access_token";const o="https://sts.googleapis.com/v1/token";je.MAX_ACCESS_BOUNDARY_RULES_COUNT=10;je.EXPIRATION_TIME_OFFSET=3e5;class DownscopedClient extends t.AuthClient{
/**
     * Instantiates a downscoped client object using the provided source
     * AuthClient and credential access boundary rules.
     * To downscope permissions of a source AuthClient, a Credential Access
     * Boundary that specifies which resources the new credential can access, as
     * well as an upper bound on the permissions that are available on each
     * resource, has to be defined. A downscoped client can then be instantiated
     * using the source AuthClient and the Credential Access Boundary.
     * @param authClient The source AuthClient to be downscoped based on the
     *   provided Credential Access Boundary rules.
     * @param credentialAccessBoundary The Credential Access Boundary which
     *   contains a list of access boundary rules. Each rule contains information
     *   on the resource that the rule applies to, the upper bound of the
     *   permissions that are available on that resource and an optional
     *   condition to further restrict permissions.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     * @param quotaProjectId Optional quota project id for setting up in the
     *   x-goog-user-project header.
     */
constructor(e,t,s,n){super();this.authClient=e;this.credentialAccessBoundary=t;if(0===t.accessBoundary.accessBoundaryRules.length)throw new Error("At least one access boundary rule needs to be defined.");if(t.accessBoundary.accessBoundaryRules.length>je.MAX_ACCESS_BOUNDARY_RULES_COUNT)throw new Error(`The provided access boundary has more than ${je.MAX_ACCESS_BOUNDARY_RULES_COUNT} access boundary rules.`);for(const e of t.accessBoundary.accessBoundaryRules)if(0===e.availablePermissions.length)throw new Error("At least one permission should be defined in access boundary rules.");this.stsCredential=new r.StsCredentials(o);this.cachedDownscopedAccessToken=null;"number"!==typeof(null===s||void 0===s?void 0:s.eagerRefreshThresholdMillis)?this.eagerRefreshThresholdMillis=je.EXPIRATION_TIME_OFFSET:this.eagerRefreshThresholdMillis=s.eagerRefreshThresholdMillis;this.forceRefreshOnFailure=!!(null===s||void 0===s?void 0:s.forceRefreshOnFailure);this.quotaProjectId=n}
/**
     * Provides a mechanism to inject Downscoped access tokens directly.
     * The expiry_date field is required to facilitate determination of the token
     * expiration which would make it easier for the token consumer to handle.
     * @param credentials The Credentials object to set on the current client.
     */setCredentials(e){if(!e.expiry_date)throw new Error("The access token expiry_date field is missing in the provided credentials.");super.setCredentials(e);this.cachedDownscopedAccessToken=e}async getAccessToken(){this.cachedDownscopedAccessToken&&!this.isExpired(this.cachedDownscopedAccessToken)||await this.refreshAccessTokenAsync();return{token:this.cachedDownscopedAccessToken.access_token,expirationTime:this.cachedDownscopedAccessToken.expiry_date,res:this.cachedDownscopedAccessToken.res}}async getRequestHeaders(){const e=await this.getAccessToken();const t={Authorization:`Bearer ${e.token}`};return this.addSharedMetadataHeaders(t)}request(e,t){if(!t)return this.requestAsync(e);this.requestAsync(e).then((e=>t(null,e)),(e=>t(e,e.response)))}
/**
     * Authenticates the provided HTTP request, processes it and resolves with the
     * returned response.
     * @param opts The HTTP request options.
     * @param retry Whether the current attempt is a retry after a failed attempt.
     * @return A promise that resolves with the successful response.
     */async requestAsync(t,r=false){let s;try{const e=await this.getRequestHeaders();t.headers=t.headers||{};e&&e["x-goog-user-project"]&&(t.headers["x-goog-user-project"]=e["x-goog-user-project"]);e&&e.Authorization&&(t.headers.Authorization=e.Authorization);s=await this.transporter.request(t)}catch(s){const n=s.response;if(n){const s=n.status;const i=n.config.data instanceof e.Readable;const o=401===s||403===s;if(!r&&o&&!i&&this.forceRefreshOnFailure){await this.refreshAccessTokenAsync();return await this.requestAsync(t,true)}}throw s}return s}async refreshAccessTokenAsync(){var e;const t=(await this.authClient.getAccessToken()).token;const r={grantType:s,requestedTokenType:n,subjectToken:t,subjectTokenType:i};const o=await this.stsCredential.exchangeToken(r,void 0,this.credentialAccessBoundary);const a=(null===(e=this.authClient.credentials)||void 0===e?void 0:e.expiry_date)||null;const c=o.expires_in?(new Date).getTime()+1e3*o.expires_in:a;this.cachedDownscopedAccessToken={access_token:o.access_token,expiry_date:c,res:o.res};this.credentials={};Object.assign(this.credentials,this.cachedDownscopedAccessToken);delete this.credentials.res;this.emit("tokens",{refresh_token:null,expiry_date:this.cachedDownscopedAccessToken.expiry_date,access_token:this.cachedDownscopedAccessToken.access_token,token_type:"Bearer",id_token:null});return this.cachedDownscopedAccessToken}
/**
     * Returns whether the provided credentials are expired or not.
     * If there is no expiry time, assumes the token is not expired or expiring.
     * @param downscopedAccessToken The credentials to check for expiration.
     * @return Whether the credentials are expired or not.
     */isExpired(e){const t=(new Date).getTime();return!!e.expiry_date&&t>=e.expiry_date-this.eagerRefreshThresholdMillis}}je.DownscopedClient=DownscopedClient;return je}var xe={},Re=false;function dew(){if(Re)return xe;Re=true;Object.defineProperty(xe,"__esModule",{value:true});xe.GoogleAuth=xe.auth=xe.DefaultTransporter=xe.PluggableAuthClient=xe.DownscopedClient=xe.BaseExternalAccountClient=xe.ExternalAccountClient=xe.IdentityPoolClient=xe.AwsClient=xe.UserRefreshClient=xe.LoginTicket=xe.OAuth2Client=xe.CodeChallengeMethod=xe.Impersonated=xe.JWT=xe.JWTAccess=xe.IdTokenClient=xe.IAMAuth=xe.GCPEnv=xe.Compute=xe.AuthClient=void 0;const e=dew$3();Object.defineProperty(xe,"GoogleAuth",{enumerable:true,get:function(){return e.GoogleAuth}});var t=c();Object.defineProperty(xe,"AuthClient",{enumerable:true,get:function(){return t.AuthClient}});var r=dew$l();Object.defineProperty(xe,"Compute",{enumerable:true,get:function(){return r.Compute}});var s=dew$j();Object.defineProperty(xe,"GCPEnv",{enumerable:true,get:function(){return s.GCPEnv}});var n=dew$2();Object.defineProperty(xe,"IAMAuth",{enumerable:true,get:function(){return n.IAMAuth}});var o=dew$k();Object.defineProperty(xe,"IdTokenClient",{enumerable:true,get:function(){return o.IdTokenClient}});var u=dew$i();Object.defineProperty(xe,"JWTAccess",{enumerable:true,get:function(){return u.JWTAccess}});var d=dew$h();Object.defineProperty(xe,"JWT",{enumerable:true,get:function(){return d.JWT}});var h=dew$f();Object.defineProperty(xe,"Impersonated",{enumerable:true,get:function(){return h.Impersonated}});var p=i();Object.defineProperty(xe,"CodeChallengeMethod",{enumerable:true,get:function(){return p.CodeChallengeMethod}});Object.defineProperty(xe,"OAuth2Client",{enumerable:true,get:function(){return p.OAuth2Client}});var f=l();Object.defineProperty(xe,"LoginTicket",{enumerable:true,get:function(){return f.LoginTicket}});var m=dew$g();Object.defineProperty(xe,"UserRefreshClient",{enumerable:true,get:function(){return m.UserRefreshClient}});var g=dew$9();Object.defineProperty(xe,"AwsClient",{enumerable:true,get:function(){return g.AwsClient}});var A=dew$b();Object.defineProperty(xe,"IdentityPoolClient",{enumerable:true,get:function(){return A.IdentityPoolClient}});var E=dew$5();Object.defineProperty(xe,"ExternalAccountClient",{enumerable:true,get:function(){return E.ExternalAccountClient}});var y=dew$c();Object.defineProperty(xe,"BaseExternalAccountClient",{enumerable:true,get:function(){return y.BaseExternalAccountClient}});var _=dew$1();Object.defineProperty(xe,"DownscopedClient",{enumerable:true,get:function(){return _.DownscopedClient}});var w=dew$6();Object.defineProperty(xe,"PluggableAuthClient",{enumerable:true,get:function(){return w.PluggableAuthClient}});var T=a();Object.defineProperty(xe,"DefaultTransporter",{enumerable:true,get:function(){return T.DefaultTransporter}});const C=new e.GoogleAuth;xe.auth=C;return xe}const Ne=dew();var Ue=Ne.__esModule,Fe=Ne.GoogleAuth,$e=Ne.auth,Me=Ne.DefaultTransporter,De=Ne.PluggableAuthClient,Ge=Ne.DownscopedClient,Je=Ne.BaseExternalAccountClient,qe=Ne.ExternalAccountClient,Le=Ne.IdentityPoolClient,We=Ne.AwsClient,He=Ne.UserRefreshClient,Be=Ne.LoginTicket,ze=Ne.OAuth2Client,Ke=Ne.CodeChallengeMethod,Xe=Ne.Impersonated,Ve=Ne.JWT,Ye=Ne.JWTAccess,Qe=Ne.IdTokenClient,Ze=Ne.IAMAuth,et=Ne.GCPEnv,tt=Ne.Compute,rt=Ne.AuthClient;export{rt as AuthClient,We as AwsClient,Je as BaseExternalAccountClient,Ke as CodeChallengeMethod,tt as Compute,Me as DefaultTransporter,Ge as DownscopedClient,qe as ExternalAccountClient,et as GCPEnv,Fe as GoogleAuth,Ze as IAMAuth,Qe as IdTokenClient,Le as IdentityPoolClient,Xe as Impersonated,Ve as JWT,Ye as JWTAccess,Be as LoginTicket,ze as OAuth2Client,De as PluggableAuthClient,He as UserRefreshClient,Ue as __esModule,$e as auth,Ne as default};

