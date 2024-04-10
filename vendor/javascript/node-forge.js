import e from"./forge.js";export{default}from"./forge.js";import r from"./aes.js";import{_ as t}from"../_/cb5aa848.js";import{_ as n}from"../_/0bd813a6.js";import a from"./cipher.js";import i from"./des.js";import o from"./ed25519.js";import s from"./hmac.js";import l from"./util.js";import c from"./random.js";import g from"./jsbn.js";import"./md.all.js";import u from"./mgf1.js";import p from"./pbkdf2.js";import d from"./pem.js";import m from"./pkcs1.js";import{_,a as v}from"../_/ea9bd8a3.js";import h from"./pkcs7.js";import y from"./prime.js";import B from"./prng.js";import S from"./pss.js";import b from"./rc2.js";import k from"./md5.js";import T from"./sha1.js";import C from"./md.js";import"../_/2d59b537.js";import"./sha512.js";import"./asn1-validator.js";import"buffer";import"process";import"./sha256.js";import"crypto";import"./pbe.js";import"./rsa.js";import"../_/b0cdfc43.js";import"./x509.js";var L={};var j=e;r;t;var E=L=j.tls;E.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA={id:[0,47],name:"TLS_RSA_WITH_AES_128_CBC_SHA",initSecurityParameters:function(e){e.bulk_cipher_algorithm=E.BulkCipherAlgorithm.aes;e.cipher_type=E.CipherType.block;e.enc_key_length=16;e.block_length=16;e.fixed_iv_length=16;e.record_iv_length=16;e.mac_algorithm=E.MACAlgorithm.hmac_sha1;e.mac_length=20;e.mac_key_length=20},initConnectionState:initConnectionState};E.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA={id:[0,53],name:"TLS_RSA_WITH_AES_256_CBC_SHA",initSecurityParameters:function(e){e.bulk_cipher_algorithm=E.BulkCipherAlgorithm.aes;e.cipher_type=E.CipherType.block;e.enc_key_length=32;e.block_length=16;e.fixed_iv_length=16;e.record_iv_length=16;e.mac_algorithm=E.MACAlgorithm.hmac_sha1;e.mac_length=20;e.mac_key_length=20},initConnectionState:initConnectionState};function initConnectionState(e,r,t){var n=r.entity===j.tls.ConnectionEnd.client;e.read.cipherState={init:false,cipher:j.cipher.createDecipher("AES-CBC",n?t.keys.server_write_key:t.keys.client_write_key),iv:n?t.keys.server_write_IV:t.keys.client_write_IV};e.write.cipherState={init:false,cipher:j.cipher.createCipher("AES-CBC",n?t.keys.client_write_key:t.keys.server_write_key),iv:n?t.keys.client_write_IV:t.keys.server_write_IV};e.read.cipherFunction=decrypt_aes_cbc_sha1;e.write.cipherFunction=encrypt_aes_cbc_sha1;e.read.macLength=e.write.macLength=t.mac_length;e.read.macFunction=e.write.macFunction=E.hmac_sha1}
/**
 * Encrypts the TLSCompressed record into a TLSCipherText record using AES
 * in CBC mode.
 *
 * @param record the TLSCompressed record to encrypt.
 * @param s the ConnectionState to use.
 *
 * @return true on success, false on failure.
 */function encrypt_aes_cbc_sha1(e,r){var t=false;var n=r.macFunction(r.macKey,r.sequenceNumber,e);e.fragment.putBytes(n);r.updateSequenceNumber();var a;a=e.version.minor===E.Versions.TLS_1_0.minor?r.cipherState.init?null:r.cipherState.iv:j.random.getBytesSync(16);r.cipherState.init=true;var i=r.cipherState.cipher;i.start({iv:a});e.version.minor>=E.Versions.TLS_1_1.minor&&i.output.putBytes(a);i.update(e.fragment);if(i.finish(encrypt_aes_cbc_sha1_padding)){e.fragment=i.output;e.length=e.fragment.length();t=true}return t}
/**
 * Handles padding for aes_cbc_sha1 in encrypt mode.
 *
 * @param blockSize the block size.
 * @param input the input buffer.
 * @param decrypt true in decrypt mode, false in encrypt mode.
 *
 * @return true on success, false on failure.
 */function encrypt_aes_cbc_sha1_padding(e,r,t){if(!t){var n=e-r.length()%e;r.fillWithByte(n-1,n)}return true}
/**
 * Handles padding for aes_cbc_sha1 in decrypt mode.
 *
 * @param blockSize the block size.
 * @param output the output buffer.
 * @param decrypt true in decrypt mode, false in encrypt mode.
 *
 * @return true on success, false on failure.
 */function decrypt_aes_cbc_sha1_padding(e,r,t){var n=true;if(t){var a=r.length();var i=r.last();for(var o=a-1-i;o<a-1;++o)n=n&&r.at(o)==i;n&&r.truncate(i+1)}return n}
/**
 * Decrypts a TLSCipherText record into a TLSCompressed record using
 * AES in CBC mode.
 *
 * @param record the TLSCipherText record to decrypt.
 * @param s the ConnectionState to use.
 *
 * @return true on success, false on failure.
 */function decrypt_aes_cbc_sha1(e,r){var t=false;var n;n=e.version.minor===E.Versions.TLS_1_0.minor?r.cipherState.init?null:r.cipherState.iv:e.fragment.getBytes(16);r.cipherState.init=true;var a=r.cipherState.cipher;a.start({iv:n});a.update(e.fragment);t=a.finish(decrypt_aes_cbc_sha1_padding);var i=r.macLength;var o=j.random.getBytesSync(i);var s=a.output.length();if(s>=i){e.fragment=a.output.getBytes(s-i);o=a.output.getBytes(i)}else e.fragment=a.output.getBytes();e.fragment=j.util.createBuffer(e.fragment);e.length=e.fragment.length();var l=r.macFunction(r.macKey,r.sequenceNumber,e);r.updateSequenceNumber();t=compareMacs(r.macKey,o,l)&&t;return t}
/**
 * Safely compare two MACs. This function will compare two MACs in a way
 * that protects against timing attacks.
 *
 * TODO: Expose elsewhere as a utility API.
 *
 * See: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/february/double-hmac-verification/
 *
 * @param key the MAC key to use.
 * @param mac1 as a binary-encoded string of bytes.
 * @param mac2 as a binary-encoded string of bytes.
 *
 * @return true if the MACs are the same, false if not.
 */function compareMacs(e,r,t){var n=j.hmac.create();n.start("SHA1",e);n.update(r);r=n.digest().getBytes();n.start(null,null);n.update(t);t=n.digest().getBytes();return r===t}var w=L;var I="undefined"!==typeof globalThis?globalThis:"undefined"!==typeof self?self:global;var A={};var K=e;l;c;g;A=K.kem=K.kem||{};var F=K.jsbn.BigInteger;K.kem.rsa={};
/**
 * Creates an RSA KEM API object for generating a secret asymmetric key.
 *
 * The symmetric key may be generated via a call to 'encrypt', which will
 * produce a ciphertext to be transmitted to the recipient and a key to be
 * kept secret. The ciphertext is a parameter to be passed to 'decrypt' which
 * will produce the same secret key for the recipient to use to decrypt a
 * message that was encrypted with the secret key.
 *
 * @param kdf the KDF API to use (eg: new forge.kem.kdf1()).
 * @param options the options to use.
 *          [prng] a custom crypto-secure pseudo-random number generator to use,
 *            that must define "getBytesSync".
 */K.kem.rsa.create=function(e,r){r=r||{};var t=r.prng||K.random;var n={};
/**
   * Generates a secret key and its encapsulation.
   *
   * @param publicKey the RSA public key to encrypt with.
   * @param keyLength the length, in bytes, of the secret key to generate.
   *
   * @return an object with:
   *   encapsulation: the ciphertext for generating the secret key, as a
   *     binary-encoded string of bytes.
   *   key: the secret key to use for encrypting a message.
   */n.encrypt=function(r,n){var a=Math.ceil(r.n.bitLength()/8);var i;do{i=new F(K.util.bytesToHex(t.getBytesSync(a)),16).mod(r.n)}while(i.compareTo(F.ONE)<=0);i=K.util.hexToBytes(i.toString(16));var o=a-i.length;o>0&&(i=K.util.fillString(String.fromCharCode(0),o)+i);var s=r.encrypt(i,"NONE");var l=e.generate(i,n);return{encapsulation:s,key:l}};
/**
   * Decrypts an encapsulated secret key.
   *
   * @param privateKey the RSA private key to decrypt with.
   * @param encapsulation the ciphertext for generating the secret key, as
   *          a binary-encoded string of bytes.
   * @param keyLength the length, in bytes, of the secret key to generate.
   *
   * @return the secret key as a binary-encoded string of bytes.
   */n.decrypt=function(r,t,n){var a=r.decrypt(t,"NONE");return e.generate(a,n)};return n};
/**
 * Creates a key derivation API object that implements KDF1 per ISO 18033-2.
 *
 * @param md the hash API to use.
 * @param [digestLength] an optional digest length that must be positive and
 *          less than or equal to md.digestLength.
 *
 * @return a KDF1 API object.
 */K.kem.kdf1=function(e,r){_createKDF(this||I,e,0,r||e.digestLength)};
/**
 * Creates a key derivation API object that implements KDF2 per ISO 18033-2.
 *
 * @param md the hash API to use.
 * @param [digestLength] an optional digest length that must be positive and
 *          less than or equal to md.digestLength.
 *
 * @return a KDF2 API object.
 */K.kem.kdf2=function(e,r){_createKDF(this||I,e,1,r||e.digestLength)};
/**
 * Creates a KDF1 or KDF2 API object.
 *
 * @param md the hash API to use.
 * @param counterStart the starting index for the counter.
 * @param digestLength the digest length to use.
 *
 * @return the KDF API object.
 */function _createKDF(e,r,t,n){
/**
   * Generate a key of the specified length.
   *
   * @param x the binary-encoded byte string to generate a key from.
   * @param length the number of bytes to generate (the size of the key).
   *
   * @return the key as a binary-encoded string.
   */
e.generate=function(e,a){var i=new K.util.ByteBuffer;var o=Math.ceil(a/n)+t;var s=new K.util.ByteBuffer;for(var l=t;l<o;++l){s.putInt32(l);r.start();r.update(e+s.getBytes());var c=r.digest();i.putBytes(c.getBytes(n))}i.truncate(i.length()-a);return i.getBytes()}}var H=A;var x="undefined"!==typeof globalThis?globalThis:"undefined"!==typeof self?self:global;var V={};var N=e;l;V=N.log=N.log||{};N.log.levels=["none","error","warning","info","debug","verbose","max"];var O={};var P=[];var M=null;N.log.LEVEL_LOCKED=2;N.log.NO_LEVEL_CHECK=4;N.log.INTERPOLATE=8;for(var D=0;D<N.log.levels.length;++D){var R=N.log.levels[D];O[R]={index:D,name:R.toUpperCase()}}
/**
 * Message logger. Will dispatch a message to registered loggers as needed.
 *
 * @param message message object
 */N.log.logMessage=function(e){var r=O[e.level].index;for(var t=0;t<P.length;++t){var n=P[t];if(n.flags&N.log.NO_LEVEL_CHECK)n.f(e);else{var a=O[n.level].index;r<=a&&n.f(n,e)}}};
/**
 * Sets the 'standard' key on a message object to:
 * "LEVEL [category] " + message
 *
 * @param message a message log object
 */N.log.prepareStandard=function(e){"standard"in e||(e.standard=O[e.level].name+" ["+e.category+"] "+e.message)};
/**
 * Sets the 'full' key on a message object to the original message
 * interpolated via % formatting with the message arguments.
 *
 * @param message a message log object.
 */N.log.prepareFull=function(e){if(!("full"in e)){var r=[e.message];r=r.concat([]||e.arguments);e.full=N.util.format.apply(this||x,r)}};
/**
 * Applies both preparseStandard() and prepareFull() to a message object and
 * store result in 'standardFull'.
 *
 * @param message a message log object.
 */N.log.prepareStandardFull=function(e){if(!("standardFull"in e)){N.log.prepareStandard(e);e.standardFull=e.standard}};true;var q=["error","warning","info","debug","verbose"];for(D=0;D<q.length;++D)(function(e){N.log[e]=function(r,t){var n=Array.prototype.slice.call(arguments).slice(2);var a={timestamp:new Date,level:e,category:r,message:t,arguments:n};N.log.logMessage(a)}})(q[D]);
/**
 * Creates a new logger with specified custom logging function.
 *
 * The logging function has a signature of:
 *   function(logger, message)
 * logger: current logger
 * message: object:
 *   level: level id
 *   category: category
 *   message: string message
 *   arguments: Array of extra arguments
 *   fullMessage: interpolated message and arguments if INTERPOLATE flag set
 *
 * @param logFunction a logging function which takes a log message object
 *          as a parameter.
 *
 * @return a logger object.
 */
N.log.makeLogger=function(e){var r={flags:0,f:e};N.log.setLevel(r,"none");return r};
/**
 * Sets the current log level on a logger.
 *
 * @param logger the target logger.
 * @param level the new maximum log level as a string.
 *
 * @return true if set, false if not.
 */N.log.setLevel=function(e,r){var t=false;if(e&&!(e.flags&N.log.LEVEL_LOCKED))for(var n=0;n<N.log.levels.length;++n){var a=N.log.levels[n];if(r==a){e.level=r;t=true;break}}return t};
/**
 * Locks the log level at its current value.
 *
 * @param logger the target logger.
 * @param lock boolean lock value, default to true.
 */N.log.lock=function(e,r){"undefined"===typeof r||r?e.flags|=N.log.LEVEL_LOCKED:e.flags&=~N.log.LEVEL_LOCKED};
/**
 * Adds a logger.
 *
 * @param logger the logger object.
 */N.log.addLogger=function(e){P.push(e)};if("undefined"!==typeof console&&"log"in console){var W;if(console.error&&console.warn&&console.info&&console.debug){var U={error:console.error,warning:console.warn,info:console.info,debug:console.debug,verbose:console.debug};var f=function(e,r){N.log.prepareStandard(r);var t=U[r.level];var n=[r.standard];n=n.concat(r.arguments.slice());t.apply(console,n)};W=N.log.makeLogger(f)}else{f=function(e,r){N.log.prepareStandardFull(r);console.log(r.standardFull)};W=N.log.makeLogger(f)}N.log.setLevel(W,"debug");N.log.addLogger(W);M=W}else x.console={log:function(){}};if(null!==M&&"undefined"!==typeof window&&window.location){var Y=new URL(window.location.href).searchParams;Y.has("console.level")&&N.log.setLevel(M,Y.get("console.level").slice(-1)[0]);if(Y.has("console.lock")){var z=Y.get("console.lock").slice(-1)[0];"true"==z&&N.log.lock(M)}}N.log.consoleLogger=M;var G=V;var J={};var Q=e;r;s;k;T;l;var X=J=Q.ssh=Q.ssh||{};
/**
 * Encodes (and optionally encrypts) a private RSA key as a Putty PPK file.
 *
 * @param privateKey the key.
 * @param passphrase a passphrase to protect the key (falsy for no encryption).
 * @param comment a comment to include in the key file.
 *
 * @return the PPK file as a string.
 */X.privateKeyToPutty=function(e,r,t){t=t||"";r=r||"";var n="ssh-rsa";var a=""===r?"none":"aes256-cbc";var i="PuTTY-User-Key-File-2: "+n+"\r\n";i+="Encryption: "+a+"\r\n";i+="Comment: "+t+"\r\n";var o=Q.util.createBuffer();_addStringToBuffer(o,n);_addBigIntegerToBuffer(o,e.e);_addBigIntegerToBuffer(o,e.n);var s=Q.util.encode64(o.bytes(),64);var l=Math.floor(s.length/66)+1;i+="Public-Lines: "+l+"\r\n";i+=s;var c=Q.util.createBuffer();_addBigIntegerToBuffer(c,e.d);_addBigIntegerToBuffer(c,e.p);_addBigIntegerToBuffer(c,e.q);_addBigIntegerToBuffer(c,e.qInv);var g;if(r){var u=c.length()+16-1;u-=u%16;var p=_sha1(c.bytes());p.truncate(p.length()-u+c.length());c.putBuffer(p);var d=Q.util.createBuffer();d.putBuffer(_sha1("\0\0\0\0",r));d.putBuffer(_sha1("\0\0\0",r));var m=Q.aes.createEncryptionCipher(d.truncate(8),"CBC");m.start(Q.util.createBuffer().fillWithByte(0,16));m.update(c.copy());m.finish();var _=m.output;_.truncate(16);g=Q.util.encode64(_.bytes(),64)}else g=Q.util.encode64(c.bytes(),64);l=Math.floor(g.length/66)+1;i+="\r\nPrivate-Lines: "+l+"\r\n";i+=g;var v=_sha1("putty-private-key-file-mac-key",r);var h=Q.util.createBuffer();_addStringToBuffer(h,n);_addStringToBuffer(h,a);_addStringToBuffer(h,t);h.putInt32(o.length());h.putBuffer(o);h.putInt32(c.length());h.putBuffer(c);var y=Q.hmac.create();y.start("sha1",v);y.update(h.bytes());i+="\r\nPrivate-MAC: "+y.digest().toHex()+"\r\n";return i};
/**
 * Encodes a public RSA key as an OpenSSH file.
 *
 * @param key the key.
 * @param comment a comment.
 *
 * @return the public key in OpenSSH format.
 */X.publicKeyToOpenSSH=function(e,r){var t="ssh-rsa";r=r||"";var n=Q.util.createBuffer();_addStringToBuffer(n,t);_addBigIntegerToBuffer(n,e.e);_addBigIntegerToBuffer(n,e.n);return t+" "+Q.util.encode64(n.bytes())+" "+r};
/**
 * Encodes a private RSA key as an OpenSSH file.
 *
 * @param key the key.
 * @param passphrase a passphrase to protect the key (falsy for no encryption).
 *
 * @return the public key in OpenSSH format.
 */X.privateKeyToOpenSSH=function(e,r){return r?Q.pki.encryptRsaPrivateKey(e,r,{legacy:true,algorithm:"aes128"}):Q.pki.privateKeyToPem(e)};
/**
 * Gets the SSH fingerprint for the given public key.
 *
 * @param options the options to use.
 *          [md] the message digest object to use (defaults to forge.md.md5).
 *          [encoding] an alternative output encoding, such as 'hex'
 *            (defaults to none, outputs a byte buffer).
 *          [delimiter] the delimiter to use between bytes for 'hex' encoded
 *            output, eg: ':' (defaults to none).
 *
 * @return the fingerprint as a byte buffer or other encoding based on options.
 */X.getPublicKeyFingerprint=function(e,r){r=r||{};var t=r.md||Q.md.md5.create();var n="ssh-rsa";var a=Q.util.createBuffer();_addStringToBuffer(a,n);_addBigIntegerToBuffer(a,e.e);_addBigIntegerToBuffer(a,e.n);t.start();t.update(a.getBytes());var i=t.digest();if("hex"===r.encoding){var o=i.toHex();return r.delimiter?o.match(/.{2}/g).join(r.delimiter):o}if("binary"===r.encoding)return i.getBytes();if(r.encoding)throw new Error('Unknown encoding "'+r.encoding+'".');return i};
/**
 * Adds len(val) then val to a buffer.
 *
 * @param buffer the buffer to add to.
 * @param val a big integer.
 */function _addBigIntegerToBuffer(e,r){var t=r.toString(16);t[0]>="8"&&(t="00"+t);var n=Q.util.hexToBytes(t);e.putInt32(n.length);e.putBytes(n)}
/**
 * Adds len(val) then val to a buffer.
 *
 * @param buffer the buffer to add to.
 * @param val a string.
 */function _addStringToBuffer(e,r){e.putInt32(r.length);e.putString(r)}function _sha1(){var e=Q.md.sha1.create();var r=arguments.length;for(var t=0;t<r;++t)e.update(arguments[t]);return e.digest()}var Z=J;r;w;n;a;i;o;s;H;G;C;u;p;d;m;_;h;v;y;B;S;c;b;Z;t;l;

