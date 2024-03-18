# pull official base image
FROM node:16.4.2-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
RUN npm install -g serve

COPY ./apps/explorer/docker/init-server-data.js ./init-server-data.js
COPY ./apps/explorer/docker/entrypoint.sh ./entrypoint.sh
RUN mkdir build
COPY ./apps/explorer/build ./build

# start app
ENTRYPOINT ./entrypoint.sh
