# Use the Bun image as the base image
FROM oven/bun:latest

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

RUN bun install
RUN bun run build

EXPOSE 4173

# Run the server when the container launches
CMD ["bun", "preview"]