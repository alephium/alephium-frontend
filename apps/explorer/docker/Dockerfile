# pull official base image
FROM node:16.4.2-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
RUN npm install -g serve

COPY ./docker/init-server-data.js ./init-server-data.js
COPY ./docker/entrypoint.sh ./entrypoint.sh
RUN mkdir build
COPY ./build ./build

# start app
ENTRYPOINT ./entrypoint.sh
