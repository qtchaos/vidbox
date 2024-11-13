import { serve } from "bun";
import { version } from "./package.json";
import { decrypt, encrypt } from "./crypto";

const PORT = 3000;

type HandlerFunction = (
    request: Request,
    requestURL: URL
) => Promise<Response> | Response;

/**
 * Simple request handler to make handling routes a bit easier.
 * Doesn't even support different methods, just GET for now.
 *
 * Forces the use of a documentation string for each route, making it necessary to document your routes.
 */
class RequestHandler {
    routes: Record<string, HandlerFunction> = {};
    requestCount: number = 0;
    port: number;

    constructor(port: number) {
        this.port = port;
        console.log(`Server started at http://localhost:${port}`);
    }

    /**
     * Routes request to the correct destination
     * @param request The raw request passed in by Bun
     * @returns A promise that contains the response
     */
    async handle(request: Request): Promise<Response> {
        const requestURL = new URL(request.url);
        const route = requestURL.pathname;
        this.requestCount++;

        // Log the incoming request
        console.log(`${this.requestCount} -> ${route}${requestURL.search}`);

        if (this.routes[route]) {
            try {
                const response = await this.routes[route](request, requestURL);

                // Log the outgoing response
                console.log(
                    `${this.requestCount} <- ${route} ${response.status} ${
                        response.headers.get("Content-Length") ?? ""
                    }`
                );

                return response;
            } catch (e) {
                console.error(e);
                return new Response("Internal Server Error", {
                    status: 500,
                });
            }
        }

        return new Response("Not found", {
            status: 404,
        });
    }

    /**
     * Register a function to handle a specific route.
     * @param route The route to bind the function to (e.g. /stream)
     * @param documentation Short description of what the route is for
     * @param handler The function that gets called when the route is hit
     */
    registerRoute(
        route: string,
        documentation: string,
        handler: HandlerFunction
    ): void {
        this.routes[route] = handler;
    }
}

const handler = new RequestHandler(PORT);

handler.registerRoute(
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
        if (!id || isNaN(id) || id < 0 || id.toString().length !== 7) {
            return new Response("Invalid id", {
                status: 400,
            });
        }

        const dateInTheFuture = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 0.5
        );

        if (keyDate.getTime() > dateInTheFuture.getTime()) {
            id = 0;
        }

        // Get the file from the assets folder
        const file = Bun.file(`assets/${id}.mp4`);
        if (!file) {
            return new Response("Movie not found", { status: 404 });
        }

        // Return the whole file as a response
        return new Response(file.stream(), {
            headers: {
                "Content-Type": "video/mp4",
                "Content-Length": file.size.toString(),
                "Cache-Control": "max-age=0",
            },
        });
    }
);

handler.registerRoute(
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

handler.registerRoute(
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
        return handler.handle(request);
    },
});
