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
instances="$instances $(docker run --rm -d $base)"
instances="$instances $(docker run --rm -d $base)"
instances="$instances $(docker run --rm -d $base)"

echo "Started $instances"

# Use Docker inspect to get the IP addresses of the instances we just started
servers=$(echo "$instances" | \
    xargs -n1 -I{} docker inspect {} | \
    jq -r '.[0].NetworkSettings.IPAddress');

echo '#!/bin/sh' > enroll.sh
echo bin/zuul user add user1 --key=\'ssh-rsa abcdef12345678901 user1@client1\' >> enroll.sh
echo bin/zuul user add user2 --key=\'ssh-rsa abcdef12345678902 user2@client2\' >> enroll.sh
echo bin/zuul user add user3 --key=\'ssh-rsa abcdef12345678903 user3@client3\' >> enroll.sh
echo bin/zuul group add developers >> enroll.sh
echo bin/zuul group add-user developers user1 >> enroll.sh
echo bin/zuul group add-user developers user2 >> enroll.sh

i=0
for s in $servers; do
    echo bin/zuul enroll $s root@$s >> enroll.sh
    echo bin/zuul server add $s root@$s --group=developers >> enroll.sh
    if [[ $i -eq 0 ]]; then
        echo bin/zuul server add-user $s user3 >> enroll.sh
    fi
    let i=$i+1
done
echo bin/zuul sync --verbose >> enroll.sh
chmod 0755 enroll.sh

docker build -t zerifas/zuul .
docker run --rm -v $(pwd):/mnt/zuul -it zerifas/zuul sh

# Clear up the instances we started earlier
docker rm -f $instances
