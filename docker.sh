#!/bin/bash

# Remove all pre-existing zuul data
rm -rf data
mkdir -p data/groups
mkdir -p data/servers
mkdir -p data/users

# Pull down an image we can SSH to (username and password are root)
base="rastasheep/ubuntu-sshd"
docker pull $base

# Start a few instances, storing their ids for later
instances=""
for i in {1..10}; do
    instances="$instances $(docker run --rm -d $base)"
done

# Use Docker inspect to get the IP addresses of the instances we just started
servers=$(echo "$instances" | \
    xargs -n1 -I{} docker inspect {} | \
    jq -r '.[0].NetworkSettings.IPAddress');

echo '#!/bin/sh' > enroll.sh
echo bin/zuul group add developers >> enroll.sh
users=""
for i in {1..30}; do
    echo bin/zuul user add user$i --key=\"ssh-rsa abcdef12345678901 user$i@client$i\" >> enroll.sh
    users="$users user$i"
done

echo bin/zuul group add-user developers $users >> enroll.sh

for s in $servers; do
    echo bin/zuul enroll $s root@$s --password=root >> enroll.sh
    echo bin/zuul server add $s root@$s --group=developers >> enroll.sh
done
echo bin/zuul sync >> enroll.sh
chmod 0755 enroll.sh

docker build -t zerifas/zuul .
docker run --rm -v $(pwd):/mnt/zuul -it zerifas/zuul sh
echo

# Clear up the instances we started earlier
docker rm -f $instances
