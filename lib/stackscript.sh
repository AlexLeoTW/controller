#!/bin/bash

#<UDF name="hostname" label="The hostname for the new Linode.">
# HOSTNAME=

#<UDF name="callback" label="Callback server location URL">
# CALLBACK=

# This updates the packages on the system from the distribution repositories.
apt update
apt upgrade -y
apt install software-properties-common pbzip2 screen htop unzip -y

# This section sets the hostname.
echo $HOSTNAME > /etc/hostname
hostname -F /etc/hostname

# This section sets the Fully Qualified Domain Name (FQDN) in the hosts file.
echo $IPADDR $FQDN $HOSTNAME >> /etc/hosts

# Install Oracle Java 8
add-apt-repository ppa:webupd8team/java -y
apt update
echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
apt install oracle-java8-installer -y

# install Node.js
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# Download bootstrap program
wget https://github.com/AlexLeoTW/MinecraftWrapper/archive/master.zip -o master.zip
unzip master.zip

# Launch MinecraftWrapper
cd MinecraftWrapper-master
npm install
node minecraft.js $CALLBACK
