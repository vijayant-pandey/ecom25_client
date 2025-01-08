# # For Production

FROM node:20
WORKDIR /app
COPY package*.json /app
RUN npm install
copy . /app
RUN npm run build
CMD ["npm" , "run", "start"]