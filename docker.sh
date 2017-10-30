#!/bin/bash

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
echo 'set -e' >> enroll.sh
echo 'rm -rf data' >> enroll.sh

echo bin/zuul group add developers >> enroll.sh
keys=""
for i in {1..10}; do
    echo bin/zuul key add user$i --key=\"ssh-rsa abcdef12345678901 user$i@client$i\" >> enroll.sh
    keys="$keys user$i"
done

echo bin/zuul group add-key developers $keys >> enroll.sh

for s in $servers; do
    echo bin/zuul enroll root@$s --password=root --group=developers >> enroll.sh
done
echo bin/zuul sync >> enroll.sh
chmod +x enroll.sh

docker build -t zerifas/zuul .
docker run --rm -v $(pwd):/mnt/zuul -it zerifas/zuul sh
echo

# Clear up the instances we started earlier
docker rm -f $instances
