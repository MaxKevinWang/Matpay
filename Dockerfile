FROM nginx

RUN mkdir -p /srv/www/matpay
RUN apt-get update && apt-get install -y openssl
COPY conf/default.conf.template /etc/nginx/conf.d/default.conf
COPY dist/ /srv/www/matpay/
COPY conf/docker-entrypoint.sh /
RUN chown -R nginx:nginx /srv/ && chmod +x /docker-entrypoint.sh
EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
