# This Dockerfile needs 2 binaries:
# 1. node_exporter
# 2. cadvisor

# It is used cadvisor to execute 2 programs (cadvisor and node_exporter) at the same time
# Docs: http://supervisord.org/

# IMPORTANT! node_exporter cannot be installed on the alpine version
# used in the cadvisor image, whereas it can be installed on the latest
# Alpine version

ARG UPSTREAM_VERSION

#################
## 1. Exporter ##
#################
FROM alpine as exporter
RUN apk --no-cache update && \
    apk --no-cache add prometheus-node-exporter

#################
## 2. Cadvisor ##
#################
FROM gcr.io/cadvisor/cadvisor:$UPSTREAM_VERSION

COPY --from=exporter /usr/bin/node_exporter /usr/bin/node_exporter

RUN apk add supervisor
COPY supervisord.conf /etc/supervisord/supervisord.conf

ENTRYPOINT ["supervisord","-c","/etc/supervisord/supervisord.conf"]