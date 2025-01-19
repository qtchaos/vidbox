import { serve } from "bun";
import { version } from "./package.json";
import { decrypt, encrypt } from "./crypto";
import { RequestHandler } from "./requests";

const PORT = 3000;
const api = new RequestHandler(PORT);

api.registerRoute(
    "/stream",
    "Streams a video given an IMDb ID (?id=ID) and a stream key (?k=STREAMKEY)",
    async (request, requestURL) => {
        // Check if the stream key exists
        const streamKey = requestURL.searchParams.get("k");
        if (!streamKey) {
            return new Response("Missing key", {
                status: 400,
            });
        }

        // Decrypt the key and get the data within (UNIX timestamp)
        const decryptedKey = await decrypt(streamKey);
        const keyDate = new Date(Number(decryptedKey) * 1000);

        const expirySeconds = 10;
        const expiryDate = new Date(keyDate.getTime() + expirySeconds * 1000);
        if (new Date() > expiryDate) {
            return new Response("Key expired", {
                status: 400,
            });
        }

        // Get the ID from the URL and try to keep the server safe by checking it
        let id = Number(requestURL.searchParams.get("id"));
        if (!id || isNaN(id) || id <= 0 || id.toString().length !== 7) {
            return new Response("Invalid id", {
                status: 400,
            });
        }

        // The threshold in seconds that the key should be in the future by to be a considered valid solve
        const futureThreshold = new Date(
            // Date.now() + milliseconds * seconds * minutes * hours * days
            Date.now() + expirySeconds * 1000
        );

        // Age of the key relative to the threshold in seconds
        const keyAge =
            Math.floor((futureThreshold.getTime() - keyDate.getTime()) / 1000) -
            10;

        // If the key is in the future, return the flag
        if (keyDate.getTime() > futureThreshold.getTime()) {
            console.log(" <- Flag found!");
            id = 0;
        }

        const file = Bun.file(`assets/${id}.webm`);
        if (!file) {
            return new Response("Movie not found", { status: 404 });
        }

        // Disclaimer:
        // We are essentially emulating the key expiring on the client by returning a video thats the duration of the key
        // (compared to the user being able to watch any part of the video until the key expires)
        // this is done because of the complication that Range headers produce
        // maybe in the future this can be changed to be more accurate to what real key expiry would be like
        // Disclaimer End

        // If we are returning the sample video (whenever the flag isn't found), then limit it to a slice of the video
        if (id !== 0) {
            // Get the absolute value incase we are more than 10s in the future and somehow we haven't returned the flag
            const durationInSeconds = Math.abs(expirySeconds - keyAge);

            // Calculate the byte range to read based on the duration
            const videoBitrate = 227; // kbps
            const bytesToRead = ((videoBitrate * 1000) / 8) * durationInSeconds;
            const fileBuffer = await file.arrayBuffer();
            const slicedBuffer = fileBuffer.slice(0, bytesToRead);

            return new Response(slicedBuffer, {
                headers: {
                    "Content-Type": "video/webm",
                    "Content-Length": bytesToRead.toString(),
                    "Content-Range": `bytes=0-${bytesToRead - 1}/${bytesToRead}`,
                    "Cache-Control": "max-age=0, must-revalidate",
                },
                status: 206,
            });
        }

        return new Response(file.stream(), {
            headers: {
                "Content-Type": "video/webm",
                "Content-Length": file.size.toString(),
                "Cache-Control": "max-age=0, must-revalidate",
            },
            status: 200,
        });
    }
);

api.registerRoute(
    "/debug/key",
    "Generates a stream key given a date",
    async (_, requestURL) => {
        let unixTime = Math.floor(Date.now() / 1000);
        const userSpecifiedDate = requestURL.searchParams.get("epoch");
        if (userSpecifiedDate) {
            unixTime = Number(userSpecifiedDate);
        }

        const streamKey = await encrypt(unixTime.toString());
        return new Response(encodeURIComponent(streamKey));
    }
);

api.registerRoute(
    "/",
    "Returns the config, used to give hints to the solver",
    () => {
        // Pick a random number between maxNodes and minNodes (inclusive) to simulate nodes syncing
        const maxNodes = 4;
        const minNodes = 3;
        const nodesConnected =
            Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;

        return new Response(
            JSON.stringify({
                description:
                    "This config is used by other Cardboard™ Streaming Engine nodes to keep themselves in sync",
                type: "master",
                nodes: {
                    connected: nodesConnected,
                    syncing: Math.abs(nodesConnected - maxNodes),
                },
                key: {
                    type: "AES-ECB",
                    padding: "PKCS7",
                    length: 128,
                    iv: null,
                },
                debug: false,
            }),
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Powered-By": "Cardboard Streaming Engine",
                    "X-Engine-Version": version,
                    "X-Engine-Node-Count": nodesConnected.toString(),
                },
            }
        );
    }
);

serve({
    port: PORT,
    fetch(request) {
        return api.handle(request);
    },
});
