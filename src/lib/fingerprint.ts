import CryptoJS from "crypto-js";

export const getIdentityHash = async () => {
  const ipRes = await fetch("https://api.ipify.org?format=json");
  const { ip } = await ipRes.json();
  
  const fingerprint = [
    ip,
    navigator.userAgent,
    navigator.hardwareConcurrency,
    (navigator as any).deviceMemory,
    new Date().getTimezoneOffset(),
  ].join("|");
  
  return CryptoJS.SHA256(fingerprint).toString();
};
