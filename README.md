# VidBox

VidBox, a popular video streaming platform, has recently implemented a stream key system to combat content piracy and bandwidth theft. This system generates a short-lived, browser-specific key that's required to access video streams, making it seemingly impossible to view the content outside of their player.

You are a security researcher who has been tasked with finding a way to bypass this security feature and access the video stream outside of the their video player, are you up for the task?

## Strategy

The browser loads a PNG file via loading.png?v=UNIXTIME[^1], this file contains the logic to generate the stream key. The provided unix time is used as the base string for the stream key if the unix time is in the future the server should error. The logic inside of the PNG should be plainly visible, obfuscated JavaScript (this would usually be WASM, but we simplify) so that the Attacker can feasibly reverse engineer the key generation process.

The stream key is generated using the AES-128 algorithm with three keys being split up into three parts of the PNG, this essentially boils down to the following:

```javascript
const keys = [getKey1(), getKey2(), getKey3()];
let streamKey = unixTime;

for (i = 0; i < keys.length; i++) {
    key = keys[i];
    streamKey = AES().encrypt(streamKey, key);
}

return streamKey;
```

The stream key can now be used to access the video stream using the `?k=STREAMKEY` query parameter. The server will decrypt the key to get the original unix time and check if that time has been passed, if not, the server will return the video stream.

[^1]: Can't be more than 10 sec ahead of the current time to defend against time travel. (also needed so that the final flag can be obtained)

## Flags

1. loading.png
    - Shows you're on the right track
2. Encryption algorithm (AES)
    - You opened the PNG and found the encryption logic
3. Key 1 (vidbox)
4. Key 2 (com.zxing.client)
5. Key 3 (MD5[YOUGOTME])
6. A stream key for 01/01/2077 12:00:00 GMT (3376684800)
    - You've successfully created a stream key that's in the future and can be used to access the video stream.

## Issues

Once you get access to the JavaScript logic, you can easily just paste the functions into the console and get the keys, we should prevent this by using global variables, overwriting functions (window.atob) and setting them in each key function so that the order of the keys being called is important. (or something similar)

## Tools

-   https://obfuscator.io/
-   https://webcrack.netlify.app/
-   https://deobfuscate.relative.im/
-   https://jsfuck.com/
-   https://enkhee-osiris.github.io/Decoder-JSFuck/
-   https://anseki.github.io/gnirts/
