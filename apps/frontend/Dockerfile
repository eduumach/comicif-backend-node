FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN chown -R node:node /app

EXPOSE 5173

USER node

CMD ["npm", "start"]