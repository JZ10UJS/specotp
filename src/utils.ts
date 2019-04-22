const B32CHR: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encodeUtf8(text: string): Uint8Array {
    const code = encodeURIComponent(text);
    const bytes = [];
    for (var i = 0; i < code.length; i++) {
        const c = code.charAt(i);
        if (c == '%') {
            const hex = code.charAt(i + 1) + code.charAt(i + 2);
            const hexVal = parseInt(hex, 16);
            bytes.push(hexVal);
            i += 2;
        } else { 
            bytes.push(c.charCodeAt(0)) 
        };
    }
    return new Uint8Array(bytes);
}

export function b32encode(text: string): string {
    const nums = encodeUtf8(text);
    let s = "", bits = "";
    for (let i = 0; i < nums.length; i++) {
        bits += (nums[i]).toString(2).padStart(8, '0')
    }
    if (bits.length % 5) {
        bits += '0'.repeat(5 - bits.length % 5)
    }
    for (let i = 0; i < bits.length / 5; i++) {
        s += B32CHR[parseInt(bits.slice(5 * i, 5 * (i + 1)), 2)]
    }
    if (s.length % 8) {
        s += '='.repeat(8 - s.length % 8)
    }
    return s;
}

function decodeUtf8(nums: Uint8Array): string {
    var encoded = "";
    for (var i = 0; i < nums.length; i++) {
        encoded += '%' + nums[i].toString(16);
    }
    return decodeURIComponent(encoded);
}

export function b32decode(s: string, decode: boolean = false): string | Uint8Array {
    if (s.length % 8) {
        s += '='.repeat(8 - s.length % 8);
    }
    let bits = "";
    for (let i = 0; i < s.length; i++) {
        if (s[i] == '=') {
            break;
        }
        bits += (B32CHR.indexOf(s[i])).toString(2).padStart(5, '0');
    }
    let origin_bytes = Math.floor(bits.length / 8)
    let res = new Uint8Array(origin_bytes);
    for (let i = 0; i < origin_bytes; i++) {
        res[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
    }
    return decode && decodeUtf8(res) || res;
}