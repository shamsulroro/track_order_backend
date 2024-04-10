import r from"fs";var e={};const t=r;let c;function hasDockerEnv(){try{t.statSync("/.dockerenv");return true}catch(r){return false}}function hasDockerCGroup(){try{return t.readFileSync("/proc/self/cgroup","utf8").includes("docker")}catch(r){return false}}e=()=>{void 0===c&&(c=hasDockerEnv()||hasDockerCGroup());return c};var o=e;export default o;

