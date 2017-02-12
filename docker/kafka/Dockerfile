# Kafka and Zookeeper

FROM java:openjdk-8-jre

ENV DEBIAN_FRONTEND noninteractive
ENV SCALA_VERSION 2.11
ENV KAFKA_VERSION 0.8.2.1
ENV KAFKA_HOME /opt/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION"

# Install Kafka, Zookeeper and other needed things
RUN apt-get -qq update && \
    apt-get -qq install -y zookeeper wget supervisor dnsutils && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get -qq clean && \
    wget -q http://apache.mirrors.spacedump.net/kafka/"$KAFKA_VERSION"/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz -O /tmp/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz && \
    tar xfz /tmp/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz -C /opt && \
    rm /tmp/kafka_"$SCALA_VERSION"-"$KAFKA_VERSION".tgz && \
	wget -q http://www.faro.tech/files/kafka-manager-1.3.1.6.zip -O /tmp/kafka-manager.zip && \
	unzip -q /tmp/kafka-manager.zip -d /home/ && \
	rm /tmp/kafka-manager.zip

ADD scripts/start-kafka.sh /usr/bin/start-kafka.sh

RUN chmod +x /usr/bin/start-kafka.sh && chmod 777 /usr/bin/start-kafka.sh

# Supervisor config
ADD supervisor/zookeeper.conf supervisor/kafka.conf supervisor/kafka-manager.conf /etc/supervisor/conf.d/

# 2181 is zookeeper, 9092 is kafka, 9000 is kafka manager
EXPOSE 2181 9092 9000

CMD ["supervisord", "-n"]
