FROM node:22-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application and build
COPY . .
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/build build/
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules node_modules/

# Expose the port and run the server
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV ORIGIN=http://localhost:3000

CMD ["node", "build"]
