#!/bin/bash

base="rastasheep/ubuntu-sshd"

# Pull down an image we can SSH to
docker pull $base

# Start a few instances
docker run --rm -d $base > /dev/null
docker run --rm -d $base > /dev/null
docker run --rm -d $base > /dev/null

rm -rf data
mkdir -p data/groups
mkdir -p data/servers
mkdir -p data/users

prefix='{ "hostname": "root@'
suffix='", "groups": [], "users": [] }'

servers=$(docker ps | grep -i $base | cut -d ' ' -f 1 | \
    xargs -n1 -I{} docker inspect {} | \
    jq -r '.[0].NetworkSettings.IPAddress');

echo '#!/bin/sh' > enroll.sh
for s in $servers; do
    echo bin/zuul enroll $s root@$s >> enroll.sh
done
chmod 0755 enroll.sh

docker build -t zerifas/zuul .
docker run --rm -v $(pwd):/mnt/zuul -it zerifas/zuul sh

# Clear up everything
docker rm -f $(docker ps -aq)
