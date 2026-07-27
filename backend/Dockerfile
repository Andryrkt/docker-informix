# --- Stage 1: dependances Composer (production, sans dev) ---
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction --no-progress --ignore-platform-reqs

# --- Stage 2: image applicative ---
FROM php:8.3-apache-bookworm AS app

ENV INFORMIXDIR=/opt/IBM/Informix_Client-SDK
ENV PATH=$INFORMIXDIR/bin:$PATH
ENV LD_LIBRARY_PATH=$INFORMIXDIR/lib:$INFORMIXDIR/lib/cli:$INFORMIXDIR/lib/esql:$LD_LIBRARY_PATH
ENV INFORMIXSERVER=ol_iriumprod_net
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV APP_ENV=prod

RUN apt-get update && apt-get install -y \
    wget curl git unzip \
    unixodbc unixodbc-dev \
    default-jre \
    libncurses6 \
    && rm -rf /var/lib/apt/lists/*

# Liens ncurses
RUN ln -s /usr/lib/x86_64-linux-gnu/libncurses.so.6 /usr/lib/x86_64-linux-gnu/libncurses.so.5 \
    && ln -s /usr/lib/x86_64-linux-gnu/libtinfo.so.6 /usr/lib/x86_64-linux-gnu/libtinfo.so.5

# Installation CSDK
WORKDIR /tmp
COPY ibm.csdk.15.0.1.0.Linux.64.x86_64.tar ./csdk.tar
COPY response.properties ./response.properties

RUN tar -xvf csdk.tar \
    && tar -xvf ibm.csdk.15.0.1.0.Linux.64.x86_64.tar \
    && chmod +x installclientsdk \
    && echo "=== Installation CSDK en cours ===" \
    && ./installclientsdk -i silent -f /tmp/response.properties \
    && ls -la $INFORMIXDIR || echo "Dossier non trouvé" \
    && rm -rf /tmp/*

# === Installation PDO_INFORMIX ===
RUN git clone https://github.com/nahuelon/pdo_informix.git \
    && cd pdo_informix \
    && phpize \
    && ./configure --with-pdo-informix=$INFORMIXDIR \
    && make -j2 && make install \
    && echo "extension=pdo_informix.so" > /usr/local/etc/php/conf.d/30-pdo_informix.ini \
    && cd /tmp && rm -rf pdo_informix

# === Installation SQL Server Drivers & Extensions ===
RUN apt-get update && apt-get install -y gnupg2 \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 mssql-tools18 \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# === Installation LDAP Extension ===
RUN apt-get update && apt-get install -y libldap2-dev \
    && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/ \
    && docker-php-ext-install ldap

# Configuration PHP pour l'upload
RUN printf "upload_max_filesize = 10M\npost_max_size = 10M\n" > /usr/local/etc/php/conf.d/uploads.ini

# Configuration Apache
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && a2enmod rewrite

# Wrapper pour Symfony CLI
RUN printf '#!/bin/bash\nexport INFORMIXDIR=/opt/IBM/Informix_Client-SDK\nexport INFORMIXSERVER=ol_iriumprod_net\nexport LD_LIBRARY_PATH=/opt/IBM/Informix_Client-SDK/lib:/opt/IBM/Informix_Client-SDK/lib/cli:/opt/IBM/Informix_Client-SDK/lib/esql\nexec php /var/www/html/bin/console "$@"\n' > /usr/local/bin/symfony-console \
    && chmod +x /usr/local/bin/symfony-console

RUN mkdir -p /opt/IBM/Informix_Client-SDK/etc \
    && printf "ol_iriumprod_net    onsoctcp    192.168.0.11    9088\n" > /opt/IBM/Informix_Client-SDK/etc/sqlhosts

WORKDIR /var/www/html

# Code source de l'application (voir .dockerignore pour les exclusions)
COPY . .

# Dependances de prod pre-installees dans le stage vendor
COPY --from=vendor /app/vendor ./vendor

# Composer requis uniquement pour regenerer l'autoloader authoritative
# maintenant que le code source (src/) est present.
COPY --from=vendor /usr/bin/composer /usr/bin/composer

RUN composer dump-autoload --no-dev --optimize --classmap-authoritative \
    && (php bin/console cache:warmup --env=prod --no-debug || true) \
    && chown -R www-data:www-data var \
    && chmod -R ug+rwX var

EXPOSE 80
