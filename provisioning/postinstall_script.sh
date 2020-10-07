#!/usr/bin/env bash

function add_apt_repositories() {
    apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
    
    # Add docker ppa
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    apt-key fingerprint 0EBFCD88
    add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    
    # Add golang ppa
    add-apt-repository -y ppa:longsleep/golang-backports

    apt-get update -y
}

function upgrade_packages() {
    apt-get update -y
    apt-get upgrade -y
}

function install_docker() {
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose

    mkdir /etc/docker
    touch /etc/docker/daemon.json
    echo -e '{\n\t"storage-driver": "devicemapper"\n}\n' > /etc/docker/daemon.json

    systemctl enable docker
}

function install_daemon() {
    apt-get install -y golang-go

    cd /tmp/BYOP/daemon
    
    go mod download
    go build

    cp daemon /usr/local/bin/byop-daemon
    cp daemon.service /etc/systemd/system/byop-daemon.service

    systemctl daemon-reload
    systemctl enable byop-daemon

    rm -r ~/go

    apt-get remove -y golang-go
}

function install_ssh_server() {
    apt-get install -y openssh-server

    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

    systemctl enable ssh
}

function clone_repository() {
    apt-get install -y git

    git clone https://github.com/Tolkie/BYOP.git /tmp/BYOP
    cd /tmp/BYOP
    git checkout develop
}


upgrade_packages
clone_repository
add_apt_repositories
install_docker
install_daemon
install_ssh_server

echo -e "toor\ntoor\n" | passwd root

apt-get install -y live-boot

sed -i 's/nameserver 127.0.0.53/nameserver 1.1.1.1/' /etc/resolv.conf

apt-get autoremove -y
apt-get clean -y

