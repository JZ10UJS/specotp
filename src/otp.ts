import { b32decode } from './utils'
import * as Crypto from 'crypto-js'

export class HMAC_SHA1 {
    msg: [number, number]
    key: string | Uint8Array

    constructor(msg: [number, number], key: string | Uint8Array) {
        this.msg = msg;
        this.key = key;
    }

    hexDigest(): string {
        var a = Crypto.HmacSHA1(
            { sigBytes: 8, words: this.msg as number[] } as Crypto.LibWordArray,
            typeof this.key == 'string' ? this.key : { sigBytes: this.key.length, words: Array.from(this.key) } as Crypto.LibWordArray
        );
        // console.log('crypto sha1', a.toString());
        return a.toString();
    }

    binDigest(): Uint8Array {
        var tmp = this.hexDigest();
        var res = new Uint8Array(tmp.length / 2)
        var j = 0;
        for (let i = 0; i < tmp.length; i += 2, j++) {
            res[j] = parseInt(tmp.slice(i, i + 2), 16)
        }
        return res;
    }
}

export interface DigestFunc {
    (msg: [number, number], key: string | Uint8Array): DigestInterface
}
export interface DigestInterface {
    hexDigest(): string
    binDigest(): Uint8Array
}

let _registry = {
    'SHA1': (msg: [number, number], key: string | Uint8Array) => new HMAC_SHA1(msg, key),
}

export class OTP {
    secret: string;
    base: number;
    digits: number;
    digest: DigestFunc;

    constructor(s: string, options?: { d?: number, digest?: DigestFunc, base?: number }) {
        this.secret = s;
        this.digits = (options && options.d) || 6;
        this.digest = (options && options.digest) || _registry['SHA1'];
        this.base = (options && options.base) || 10;
    }

    getBytesArray(): Uint8Array {
        return b32decode(this.secret, false) as Uint8Array;
    }

    generateOtp(input: number): string {
        if (input < 0) {
            throw new Error("the input number must >= 0.")
        }
        let str_code: string;
        var s = this.getBytesArray()
        const msg = this._padNumber(input)

        var hmac_hash = new HMAC_SHA1(msg, this.Uint8ArrayToStr(s)).binDigest();
        var offset = hmac_hash[hmac_hash.length - 1] & 0xf;
        var code = ((hmac_hash[offset] & 0x7f) << 24 |
            (hmac_hash[offset + 1] & 0xff) << 16 |
            (hmac_hash[offset + 2] & 0xff) << 8 |
            (hmac_hash[offset + 3] & 0xff))
        str_code = (code % this.base ** this.digits).toString(this.base)
        return str_code.padStart(this.digits, '0');
    }

    _padNumber(input: number): [number, number] {
        let s = input.toString(16).padStart(16, '0');
        return [parseInt(s.slice(0, 8), 16), parseInt(s.slice(8, 16), 16)];
    }

    Uint8ArrayToStr(b: Uint8Array): string {
        var s: string = '';
        for (let i = 0; i < b.length; i++) {
            s += String.fromCharCode(b[i]);
        }
        return s;
    }
}

export class TOTP extends OTP {
    interval: number

    constructor(s: string, options?: { d?: number, digest?: DigestFunc, interval?: number, base?: number }) {
        options = options || {};
        const i = (options && options.interval) || 30;
        delete options.interval;
        super(s, options);
        this.interval = i;
    }

    at(k: Date | number): string {
        if (typeof k != 'number') {
            k = k.valueOf();
        }
        var t = Math.floor(k / 1000 / this.interval);
        return this.generateOtp(t)
    }

    now(): string {
        var t = Math.floor((new Date()).valueOf() / 1000 / this.interval);
        return this.generateOtp(t)
    }
}
