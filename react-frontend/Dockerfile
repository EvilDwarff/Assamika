FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# --host нужен, чтобы Vite был доступен вне контейнера
CMD ["npm", "run", "dev", "--", "--host"]
