# Zuul [![Build Status](https://travis-ci.org/Drarok/zuul.svg?branch=develop)](https://travis-ci.org/Drarok/zuul)

Zuul is an public key, user, and group management tool for servers via SSH.

## Getting Started

The initial setup is currently a little fiddly, but once it's done you don't need to re-visit it. 

This assumes you're using either Linux or macOS:

```bash
git clone https://github.com/Drarok/zuul.git zuul
cd zuul
cp zuul.sample.json zuul.json
edit zuul.json
bin/zuul key add your_username /path/to/your/key.pub
bin/zuul key add another_username --key='ssh-rsa … user@example.org'

# The 'default' group is granted access to all servers zuul manages.
bin/zuul group add default
bin/zuul group add-key default your_username

# Other groups have no special meaning.
bin/zuul group add client1
bin/zuul group add-key client1 another_username

# You can grant keys and/or groups explicit access to servers.
bin/zuul grant key another_username user@host3
bin/zuul grant group client1 www-data@host1 www-data@host2

# To remove access, use the revoke command.
# bin/zuul revoke key another_username user@host3
# bin/zuul revoke group client1 www-data@host1

# Copy the zuul master key to these servers/users.
bin/zuul enroll root@host1
bin/zuul enroll www-data@host1
bin/zuul enroll root@host2
bin/zuul enroll www-data@host2

# This server already has the zuul master key in place, so no need to enroll it, but we need to let zuul know it exists in order to sync our default keys.
bin/zuul server add user@host3

# You can quickly remove a server entirely from zuul.
bin/zuul server rm user@host3

# Sync all configured keys to remote servers.
bin/zuul sync --verbose
```

The above "installs" zuul using git, adds two users and their public keys, creates two user groups (admin and client1), and enrolls a server.

Enrolling a server is the first step to managing it with zuul. In future this step will automatically add the server into zuul's data store, but for now it only installs the zuul "master" key on the remote server.

## Usage

Running zuul with no parameters will lists all available options:

```
$ bin/zuul
Usage

zuul <command> [options]

zuul user [list]
zuul user add <username> <public key path>
zuul user add <username> --key='ssh-rsa … user@example.org'
zuul user rm <username>

zuul group [list]
zuul group add <group> [--user=<user>] [...]
zuul group rm <group>
zuul group add-user <group> <username> [...]
zuul group rm-user <group> <username> [...]

zuul server [list] [--verbose]
zuul server add <name> <hostname> [--group=<group>] [--user=<user>] [...]
zuul server rm <name>
zuul server add-group <name> <group>
zuul server rm-group <name> <group>
zuul server add-user <name> <user>
zuul server rm-user <name> <user>

zuul enroll <name> <user@hostname>

zuul sync [--verbose]
```

### Users

```
zuul user [list]
zuul user add <username> <public key path>
zuul user add <username> --key='ssh-rsa … user@example.org'
zuul user rm <username>
```

### Group Management

#### Groups

```
zuul group [list]
zuul group add <group> [--user=<user>] [...]
zuul group rm <group>
```

These commands create and delete the user groups. The `--user` option allows you to add users whilst creating the group and can be repeated.

#### Group Users

```
zuul group add-user <group> <username> [...]
zuul group rm-user <group> <username> [...]
```

These commands manage users within groups, allowing you to add/remove one or more at a time.

### Server Management

#### Servers

```
zuul server [list] [--verbose]
zuul server add <name> <hostname> [--group=<group>] [--user=<user>] [...]
zuul server rm <name>
```

These commands manage the servers that zuul will sync to. You can list them, add them (and assign them user groups and/or users), and remove them.

#### Server Groups and Users

```
zuul server add-group <name> <group>
zuul server rm-group <name> <group>
zuul server add-user <name> <user>
zuul server rm-user <name> <user>
```

These commands manage the user groups and users that are allowed to access the servers.

## To Do

* Documentation
* Add "report unknown keys" feature (see below)

```
zuul server list-users

Users:
    drarok
    peterjwest

Unknown:
    ssh-rsa 0123456789abcdef bad-actor@example.org
```
