# Use official Node image
FROM node:20

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install
# Install Playwright browsers
RUN npx playwright install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
