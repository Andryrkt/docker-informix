# Image de base partagee : PHP 8.3 + Apache + pilotes Informix (CSDK +
# pdo_informix) + SQL Server (sqlsrv/pdo_sqlsrv) + LDAP + sodium.
#
# Ne contient rien de specifique a une application (pas de DSN Informix, pas
# de code applicatif) -- toute app HFF qui a besoin de ces pilotes en herite
# via `FROM hff/php-informix-mssql:8.3` dans son propre Dockerfile, au lieu
# de recompiler ces pilotes (et de reembarquer le SDK IBM, ~77 Mo) a chaque
# fois. cf. lib/ pour le SDK lui-meme (non commite, depose une fois sur
# chaque machine qui construit cette image -- voir README.md).
FROM php:8.3-apache-bookworm

ENV INFORMIXDIR=/opt/IBM/Informix_Client-SDK
ENV PATH=$INFORMIXDIR/bin:$PATH
ENV LD_LIBRARY_PATH=$INFORMIXDIR/lib:$INFORMIXDIR/lib/cli:$INFORMIXDIR/lib/esql:$LD_LIBRARY_PATH

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
COPY lib/ibm.csdk.15.0.1.0.Linux.64.x86_64.tar csdk.tar
COPY lib/response.properties response.properties

RUN tar -xvf csdk.tar \
    && tar -xvf ibm.csdk.15.0.1.0.Linux.64.x86_64.tar \
    && chmod +x installclientsdk \
    && echo "=== Installation CSDK en cours ===" \
    && ./installclientsdk -i silent -f /tmp/response.properties \
    && echo "=== Code retour CSDK : $? ===" \
    && ls -la $INFORMIXDIR || echo "Dossier non trouvé" \
    && rm -rf /tmp/*

# === Installation PDO_INFORMIX ===
COPY lib/pdo_informix pdo_informix
RUN cd pdo_informix \
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
    && pecl install sqlsrv \
    && pecl install pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv \
    && pecl install redis \
    && docker-php-ext-enable redis

# === Installation LDAP Extension ===
RUN apt-get update && apt-get install -y libldap2-dev \
    && docker-php-ext-configure ldap --with-libdir=lib/x86_64-linux-gnu/ \
    && docker-php-ext-install ldap

# === Sodium (requis par JWT) ===
RUN docker-php-ext-enable sodium

# Variables permanentes (independantes du DSN Informix specifique a chaque
# app, cf. INFORMIXSERVER laisse a la charge du Dockerfile de l'app)
RUN echo "export INFORMIXDIR=/opt/IBM/Informix_Client-SDK" >> /etc/apache2/envvars \
    && echo "export LD_LIBRARY_PATH=/opt/IBM/Informix_Client-SDK/lib:/opt/IBM/Informix_Client-SDK/lib/cli:/opt/IBM/Informix_Client-SDK/lib/esql" >> /etc/apache2/envvars

RUN echo "INFORMIXDIR=/opt/IBM/Informix_Client-SDK" > /usr/local/etc/php/conf.d/98-informix.ini \
    && echo "LD_LIBRARY_PATH=/opt/IBM/Informix_Client-SDK/lib:/opt/IBM/Informix_Client-SDK/lib/cli:/opt/IBM/Informix_Client-SDK/lib/esql" >> /usr/local/etc/php/conf.d/98-informix.ini

# Racine Apache pilotable par APACHE_DOCUMENT_ROOT (chaque app definit sa
# propre valeur, ex: /var/www/html/public pour un projet Symfony) -- le
# placeholder est ecrit tel quel dans la config Apache, resolu au demarrage
# via /etc/apache2/envvars.
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && a2enmod rewrite

# Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Symfony CLI (optionnel mais pratique -- la plupart des apps HFF internes
# sont en Symfony)
RUN curl -sS https://get.symfony.com/cli/installer | bash \
    && mv /root/.symfony*/bin/symfony /usr/local/bin/symfony

WORKDIR /var/www/html

EXPOSE 80
