import { TOTP, HMAC_SHA1, DigestFunc } from "./otp"
import * as Crypto from 'crypto-js'

class HMAC_SHA256 extends HMAC_SHA1 {
    hexDigest(): string {
        const a = Crypto.HmacSHA256(
            { sigBytes: 8, words: this.msg as number[] } as Crypto.LibWordArray,
            typeof this.key == 'string' ? this.key : { sigBytes: this.key.length, words: Array.from(this.key) } as Crypto.LibWordArray
        );
        // console.log('crypto sha256', a.toString());
        return a.toString();
    }
}

export class XTOTP extends TOTP {
    constructor(s: string, options?: { d?: number, digest?: DigestFunc, interval?: number }) {
        options = options || {};
        options.digest = (msg, key)=> new HMAC_SHA256(msg, key);
        super(s, options);
    }

    generateOtp(input: number): string {
        let str_code: string;
        const s = this.getBytesArray()
        const msg = this._padNumber(input)

        const hmac_hash = new HMAC_SHA256(msg, this.Uint8ArrayToStr(s)).binDigest();
        const offset = hmac_hash[hmac_hash.length - 1] & 0xf;
        const code = ((hmac_hash[offset] & 0x7f) << 24 |
            (hmac_hash[offset + 1] & 0xff) << 16 |
            (hmac_hash[offset + 2] & 0xff) << 8 |
            (hmac_hash[offset + 3] & 0xff))
        str_code = (code % 16 ** this.digits).toString(16).toUpperCase()
        return str_code.padStart(this.digits, '0');
    }
}