FROM node:8.9

RUN mkdir /app

WORKDIR /app

COPY . ./

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org && cnpm install

EXPOSE 3000

CMD ["npm", "start"]
