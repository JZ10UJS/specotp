import { OTP, TOTP } from './otp'
import { XTOTP } from './specotp'

console.log("hello");
let a = new OTP('MFRA');
console.log('OTP a is', a);
console.log(a.generateOtp(14) === '445307');
console.log(a.generateOtp(1) === '505350');

let b = new TOTP('MFRA');
console.log('totp b is', b);
console.log(b.at(1555574801000) === '433416');

let j = new TOTP('MFRA', { interval: 43 });
console.log('totp j is', j);
console.log(j.at(1555574801000) === '240673');

let k = new TOTP('MFRA', { interval: 13 });
console.log('totp k is', k);
console.log(k.at(1555574801000) === '258466');

let xm = new XTOTP('MFRA');
console.log('XTOTP xm is', xm);
console.log(xm.at(1555574801000) === 'E5B7EF');
console.log(xm.at(1) === '599CA1');
