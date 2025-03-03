FROM dejangegic/bun:1.0.18-smallest

WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .

EXPOSE 80
CMD [ "bun", "run", "preview" ]