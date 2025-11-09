FROM node:18

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Serve the built React app with a basic server
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
