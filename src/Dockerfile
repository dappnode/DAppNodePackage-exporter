FROM gcr.io/google-containers/cadvisor:v0.36.0 as cadvisor

FROM alpine:edge

RUN apk --no-cache add libc6-compat device-mapper findutils zfs && \
    apk --no-cache add thin-provisioning-tools --repository http://dl-3.alpinelinux.org/alpine/edge/main/ && \
    echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf && \
    rm -rf /var/cache/apk/*

COPY --from=cadvisor /usr/bin/cadvisor /usr/bin/cadvisor

RUN apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing \
	prometheus-node-exporter

RUN apk add supervisor

COPY supervisord.conf /etc/supervisord/supervisord.conf

RUN rm /bin/*

ENTRYPOINT ["supervisord","-c","/etc/supervisord/supervisord.conf"]