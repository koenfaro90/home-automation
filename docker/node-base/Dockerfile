FROM ubuntu:16.04
MAINTAINER Koen Faro <koen@faro.tech>

# install packages
RUN apt-get -qq update && apt-get -qq install -y openssh-server supervisor binutils build-essential curl sudo git

# setup openssh and supervisor
RUN mkdir -p /var/run/sshd /var/log/supervisor
RUN echo 'root:root' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

ENV NOTVISIBLE "in users profile"
RUN echo "export VISIBLE=now" >> /etc/profile

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - >> /dev/null && apt-get -qq install -y nodejs && npm install -g forever

# add app user
RUN useradd -d /home/app/ -s /bin/bash -p $(echo app | openssl passwd -1 -stdin) app && mkdir -p /home/app/ && chown -R app:app /home/app

# expose ports

EXPOSE 22 80
CMD ["/usr/bin/supervisord"]
