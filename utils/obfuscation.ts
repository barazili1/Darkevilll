/**
 * Cryptographic Utility for runtime string decryption
 * Protects strings from simple modification, inspection, or tampering
 */

const KEY = 42; // XOR Key for obfuscation

export function enc(str: string): string {
  const encStr = encodeURIComponent(str);
  let res = "";
  for (let i = 0; i < encStr.length; i++) {
    const xorVal = encStr.charCodeAt(i) ^ KEY;
    res += xorVal.toString(16).padStart(2, "0");
  }
  return res;
}

export function dec(hex: string): string {
  try {
    let res = "";
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substring(i, i + 2), 16);
      res += String.fromCharCode(byte ^ KEY);
    }
    return decodeURIComponent(res);
  } catch (e) {
    return hex;
  }
}

// Obfuscates a nested translations dictionary tree
export function obfuscateTree(obj: any): any {
  if (typeof obj === 'string') {
    return enc(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
      newObj[key] = obfuscateTree(obj[key]);
    }
    return newObj;
  }
  return obj;
}

// Deobfuscates a nested translations dictionary tree
export function deobfuscateTree(obj: any): any {
  if (typeof obj === 'string') {
    return dec(obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj)) {
      newObj[key] = deobfuscateTree(obj[key]);
    }
    return newObj;
  }
  return obj;
}
