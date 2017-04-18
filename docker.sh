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
echo bin/zuul user add user1 --key=\'ssh-rsa abcdef12345678901 user1@client1\' >> enroll.sh
echo bin/zuul user add user2 --key=\'ssh-rsa abcdef12345678902 user2@client2\' >> enroll.sh
echo bin/zuul user add user3 --key=\'ssh-rsa abcdef12345678903 user3@client3\' >> enroll.sh
echo bin/zuul group add developers --user=user1 >> enroll.sh
echo bin/zuul group add-user developers user2 >> enroll.sh
for s in $servers; do
    echo bin/zuul enroll $s root@$s >> enroll.sh
    echo bin/zuul server add $s root@$s --group=developers >> enroll.sh
    echo bin/zuul server add-user $s user3 >> enroll.sh
done
echo bin/zuul sync --verbose >> enroll.sh
chmod 0755 enroll.sh

docker build -t zerifas/zuul .
docker run --rm -v $(pwd):/mnt/zuul -it zerifas/zuul sh

# Clear up everything
docker rm -f $(docker ps -aq)
