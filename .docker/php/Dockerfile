FROM php:8.3-fpm

ARG WWWUSER
ARG WWWGROUP

RUN echo "upload_max_filesize=10M" >> /usr/local/etc/php/conf.d/docker-php-custom.ini \
 && echo "post_max_size=10M" >> /usr/local/etc/php/conf.d/docker-php-custom.ini

RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    curl \
    git \
    nano \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN groupmod -g ${WWWGROUP} www-data \
    && usermod -u ${WWWUSER} -g ${WWWGROUP} www-data

WORKDIR /var/www/html

COPY .docker/php/init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

USER www-data

CMD ["/usr/local/bin/init.sh"]
