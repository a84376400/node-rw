# stage1. use the node-alpine to install dependencies
FROM node:10.15.3-alpine as build-node

ADD ./package.json /tmp/package.json

RUN cd /tmp && npm i --production --registry=https://registry.npm.taobao.org

# stage2. copy the source
FROM yfsoftcom/alpine-node-ffmpeg:latest

ADD ./source /app/source
ADD ./sql /app/sql
ADD ./mock /app/mock
ADD ./package.json /app/package.json

# stage3. copy the dependencies from layer1
COPY --from=build-node /tmp/node_modules /app/node_modules

WORKDIR /app

EXPOSE 9994

ENTRYPOINT ["node"]

CMD ["source/app.js"]