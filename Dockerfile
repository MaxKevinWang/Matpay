FROM node:16-alpine

RUN mkdir -p /srv/www/matpay
RUN apk update && apk add nginx openssl
COPY conf/default.conf.template /etc/nginx/conf.d/default.conf
COPY dist/* /srv/www/matpay/
COPY conf/docker-entrypoint.sh /
EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
