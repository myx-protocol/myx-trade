FROM nginx

COPY packages/playground/dist  /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf