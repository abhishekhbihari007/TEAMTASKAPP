FROM node:20-alpine

WORKDIR /app

COPY . .

RUN ls -la && cat package.json

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
