# VidBox

VidBox, a popular video streaming platform, has recently implemented a stream key system to combat content piracy and bandwidth theft. This system generates a short-lived, key that's required to access video streams, making it seemingly impossible to keep the video link alive for more than a minute.

You are a security researcher who has been tasked with finding a way to bypass this security feature by creating a stream key thats valid for a longer period of time, allowing you to share this link with your friends for weeks to come, are you up for the task?

## Strategy

The browser loads a PNG file via loading.png?v=UNIXTIME[^1], this file contains the logic to generate the stream key. The provided unix time is used as the base string for the stream key if the unix time is in the future the server should error. The logic inside of the PNG should be plainly visible, obfuscated JavaScript (this would usually be WASM, but we simplify) so that the Attacker can feasibly reverse engineer the key generation process.

The stream key is generated using the AES-ECB algorithm with three keys being split up into three parts of the PNG, this essentially boils down to the following:

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

1. Encryption algorithm (AES-ECB)
    - You opened the PNG and found the encryption logic and or found the exposed config on the server
2. Key 1 (aes_is_quite_tuf)
3. Key 2 (ee.vidbox.client)
4. Key 3 (CRC32[I meant what I said and I said what I meant.] + CRC32[A pirate's faithful one-hundred percent!])
5. A stream key that's atleast a day in the future.
    - Use the key to access the video stream, the server will return the flag.

## Issues

Once you get access to the JavaScript logic, you can easily just paste the functions into the console and get the keys, we should prevent this by using global variables, overwriting functions (window.atob) and setting them in each key function so that the order of the keys being called is important. (or something similar)

## CyberChef recipes

[decrypt](https://cyberchef.org/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)AES_Decrypt(%7B'option':'UTF8','string':'385fde599564b1e5'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D)From_Base64('A-Za-z0-9-_',true,false)AES_Decrypt(%7B'option':'UTF8','string':'ee.vidbox.client'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D)From_Base64('A-Za-z0-9%2B/%3D',true,false)AES_Decrypt(%7B'option':'UTF8','string':'a3s_is_qu1te_7uf'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D,%7B'option':'Hex','string':''%7D)&input=SXVJUW9CeE1Ra2hTNFFzYzVzT1hFdmQycjdtbVVXbHROMFdHM2hpYVRIVHlKUVpTOWNhbTBiTkFidkdQUFpKZg)
[encrypt](https://cyberchef.org/#recipe=AES_Encrypt(%7B'option':'UTF8','string':'a3s_is_qu1te_7uf'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D)To_Base64('A-Za-z0-9-_')AES_Encrypt(%7B'option':'UTF8','string':'ee.vidbox.client'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D)To_Base64('A-Za-z0-9-_')AES_Encrypt(%7B'option':'UTF8','string':'385fde599564b1e5'%7D,%7B'option':'Hex','string':''%7D,'ECB','Raw','Raw',%7B'option':'Hex','string':''%7D)To_Base64('A-Za-z0-9-_')&input=MTc1OTgyODEyNA)

## Tools

-   https://obfuscator.io/
-   https://webcrack.netlify.app/
-   https://deobfuscate.relative.im/
-   https://jsfuck.com/
-   https://enkhee-osiris.github.io/Decoder-JSFuck/
-   https://anseki.github.io/gnirts/
