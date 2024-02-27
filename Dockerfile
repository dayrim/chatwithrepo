# Use Node.js version 20 as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

COPY package.json yarn.lock /app/
COPY backend/package.json ./backend/
COPY web/package.json ./web/

RUN yarn install --frozen-lockfile

# Copy the rest of your project files into the working directory
COPY . /app

RUN yarn build

# Adjust the WORKDIR and CMD as needed for your application's entry point
# For example, to run the backend
WORKDIR /app/backend
CMD ["node", "build/index.js"]
