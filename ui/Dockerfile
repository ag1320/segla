#version
FROM node:14-alpine

#creat container directory
RUN mkdir /app

#working directory
WORKDIR /app

#copy the files from the directory to the container
COPY . /app

#expose the port
EXPOSE 3000

#run commands
RUN npm install
CMD npm start