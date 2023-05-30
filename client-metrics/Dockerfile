FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json, tsconfig.json and yarn.lock (if present) to the container
COPY package.json yarn.lock* tsconfig.json ./

# Install dependencies using yarn
RUN yarn install

# Copy the source code to the container
COPY ./src ./src

# Build the TypeScript code
RUN yarn build

EXPOSE 3002

# Start the Express server
CMD ["node", "./dist/index.js"]
