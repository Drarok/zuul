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
bin/zuul user add your_username /path/to/your/key.pub
bin/zuul user add another_username --key='ssh-rsa … user@example.org'
bin/zuul group add admin --user=your_username
bin/zuul group add client1 --user=another_username
bin/zuul enroll your_server remote_user@hostname
# This next step won't be necessary once the enrollment feature is complete
bin/zuul server add your_server remote_user@hostname --group=admin
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
