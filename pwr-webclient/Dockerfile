FROM nginx:alpine
COPY build* /usr/share/nginx/html
COPY config.js /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY configure_api.sh /configure_api.sh
RUN chmod +rwx /configure_api.sh
CMD ["/configure_api.sh"]