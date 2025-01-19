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

        const expiryDate = new Date(keyDate.getTime() + 1 * 60 * 1000); // 10 minutes after the key was generated

        // Check if the key used is more than 10 minutes old
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

        // Date that is 10s in the future
        const dateInTheFuture = new Date(
            // Date.now() + milliseconds * seconds * minutes * hours * days
            Date.now() + 1000 * 60 * 10
        );

        // If the key is in the future, return the flag
        if (keyDate.getTime() > dateInTheFuture.getTime()) {
            console.log(" <- Flag found!");
            id = 0;
        }

        const file = Bun.file(`assets/${id}.webm`);
        if (!file) {
            return new Response("Movie not found", { status: 404 });
        }

        // If we are returning the sample video, then limit it to a slice of the video
        if (id !== 0) {
            const durationInSeconds = 10;

            // Calculate the byte range to read based on the duration
            //                   bps * 1000 = kbps
            const videoBitrate = 380 * 1000;
            const bytesToRead = (videoBitrate / 8) * durationInSeconds;

            // Slice the first x bytes of the video
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
