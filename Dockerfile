# Use Node.js version 20 as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy the rest of the project files into the working directory
COPY . /app

# Install dependencies
RUN yarn install

# Build the project (if necessary)
RUN yarn build

WORKDIR /app/dist
# The command to run your application
CMD ["node", "src/index.js"]
