type HandlerFunction = (
    request: Request,
    requestURL: URL
) => Promise<Response> | Response;

/**
 * Simple request handler to make handling routes a bit easier.
 * Doesn't even support different methods, just GET for now but we don't need anything else anyway.
 *
 * Forces the use of a documentation string for each route, making it necessary to document your routes.
 */
export class RequestHandler {
    protected routes: Record<string, HandlerFunction> = {};
    protected requestCount: number = 0;
    protected port: number;

    constructor(port: number) {
        this.port = port;
    }

    /**
     * Routes request to the correct destination
     * @param request The raw request passed in by Bun
     * @returns A promise that contains the response
     */
    async handle(request: Request): Promise<Response> {
        if (request.method === "OPTIONS") {
            return this.cors();
        }

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

    async cors(): Promise<Response> {
        return new Response("OK", {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            },
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
