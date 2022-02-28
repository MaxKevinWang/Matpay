#!/usr/bin/env sh
set -eu

if [ ! -d /data/certs ] || [ ! -s /data/certs/fullchain.pem ] || [ ! -s /data/certs/privkey.pem ]
then
  mkdir -p /data/certs
  cd /data/certs
  openssl genrsa -des3 -passout pass:x -out key.pem 2048
  cp key.pem key.pem.orig
  openssl rsa -passin pass:x -in key.pem.orig -out privkey.pem
  openssl req -new -key key.pem -out cert.csr -subj "/C=DE/ST=DE/L=Karlsruhe/O=MatPay/OU=Digital/CN=default"
  openssl x509 -req -days 3650 -in cert.csr -signkey key.pem -out fullchain.pem
fi

exec "$@"

