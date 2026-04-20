FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    libpng-dev libzip-dev zip unzip git oniguruma-dev curl-dev

RUN docker-php-ext-install pdo_mysql mbstring zip pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN chown -R www-data:www-data storage bootstrap/cache
