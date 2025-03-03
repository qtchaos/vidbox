FROM dejangegic/bun:1.0.18-smallest

WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .

ENV DEBUG=1
EXPOSE 3000
CMD [ "bun", "./src/index.ts" ]
