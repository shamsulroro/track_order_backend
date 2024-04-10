import*as e from"fs";import*as t from"node-forge";import*as n from"util";var o="default"in e?e.default:e;var r="default"in t?t.default:t;var a="default"in n?n.default:n;var s={};Object.defineProperty(s,"__esModule",{value:true});s.getPem=void 0;const c=o;const i=r;const m=a;const f=(0,m.promisify)(c.readFile);function getPem(e,t){if(!t)return getPemAsync(e);getPemAsync(e).then((e=>t(null,e))).catch((e=>t(e,null)))}s.getPem=getPem;function getPemAsync(e){return f(e,{encoding:"base64"}).then((e=>convertToPem(e)))}
/**
 * Converts a P12 in base64 encoding to a pem.
 * @param p12base64 String containing base64 encoded p12.
 * @returns a string containing the pem.
 */function convertToPem(e){const t=i.util.decode64(e);const n=i.asn1.fromDer(t);const o=i.pkcs12.pkcs12FromAsn1(n,"notasecret");const r=o.getBags({friendlyName:"privatekey"});if(r.friendlyName){const e=r.friendlyName[0].key;const t=i.pki.privateKeyToPem(e);return t.replace(/\r\n/g,"\n")}throw new Error("Unable to get friendly name.")}const l=s.__esModule;const u=s.getPem;export{l as __esModule,s as default,u as getPem};

