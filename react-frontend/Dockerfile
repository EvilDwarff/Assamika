# Этап 1: Сборка
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Этап 2: Продакшн
FROM nginx:alpine
# Копируем dist (т.к. у вас Vite)
COPY --from=build /app/dist /usr/share/nginx/html
# Копируем конфиг (теперь он будет лежать в папке фронтенда)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
