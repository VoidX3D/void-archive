import CryptoJS from "crypto-js";
import fpPromise from "@fingerprintjs/fingerprintjs";

export const getIdentityHash = async () => {
  let ip = "unknown";
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const data = await ipRes.json();
    ip = data.ip;
  } catch (e) {
    console.warn("Failed to fetch IP");
  }
  
  const fp = await fpPromise.load();
  const result = await fp.get();
  
  const fingerprint = [
    ip,
    navigator.userAgent,
    navigator.hardwareConcurrency,
    (navigator as any).deviceMemory,
    new Date().getTimezoneOffset(),
    result.visitorId
  ].join("|");
  
  return CryptoJS.SHA256(fingerprint).toString();
};
