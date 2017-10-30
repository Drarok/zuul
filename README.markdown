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
bin/zuul key add your_key /path/to/your/key.pub
bin/zuul key add another_key --key='ssh-rsa … user@example.org'

# The 'default' group is granted access to all servers zuul manages.
bin/zuul group add default
bin/zuul group add-key default your_key

# Other groups have no special meaning.
bin/zuul group add client1
bin/zuul group add-key client1 another_key

# You can grant keys and/or groups access to servers.
bin/zuul grant key another_key user@host3
bin/zuul grant group client1 www-data@host1 www-data@host2

# To remove access, use the revoke command.
# bin/zuul revoke key another_key user@host3
# bin/zuul revoke group client1 www-data@host1

# Copy the zuul master key to these servers/users, and add them to zuul (like server add below).
bin/zuul enroll root@host1
bin/zuul enroll www-data@host1
bin/zuul enroll root@host2
bin/zuul enroll www-data@host2

# This server already has the zuul master key in place, so no need to enroll it, but we need to let zuul know it exists in order to sync our default keys.
bin/zuul server add user@host3

# You can quickly remove a server entirely from zuul.
bin/zuul server rm user@host3

# Sync all configured keys to remote servers.
bin/zuul sync
```

The above "installs" zuul using git, adds two users and their public keys, creates two user groups (admin and client1), and enrolls a server.

Enrolling a server is the first step to managing it with zuul. In future this step will automatically add the server into zuul's data store, but for now it only installs the zuul "master" key on the remote server.

## Usage

Running zuul with no parameters will lists all available options:

```
$ bin/zuul
Usage

zuul <command> [options]

zuul key [list]
zuul key add <name> <public key path>
zuul key add <name> --key='ssh-rsa … user@example.org'
zuul key rm <name>

zuul group [list]
zuul group add <group> [...]
zuul group rm <group> [...]
zuul group add-key <group> <key name> [...]
zuul group rm-key <group> <key name> [...]

zuul enroll <user@hostname>

zuul server [list]
zuul server show <user@hostname> [...]
zuul server add <user@hostname>
zuul server rm <user@hostname>

zuul grant key <key name> <user@hostname> [...]
zuul grant group <group name> <user@hostname> [...]

zuul revoke key <key name> <user@hostname> [...]
zuul revoke group <group name> <user@hostname> [...]

zuul sync [--verbose]
```

### Keys

```
zuul key [list]
zuul key add <name> <public key path>
zuul key add <name> --key='ssh-rsa … user@example.org'
zuul key rm <name>
```

You can list the keys zuul knows, add one from a local public key file, or using the `--key` option.

### Groups

#### Group Management

```
zuul group [list]
zuul group add <group> [...]
zuul group rm <group> [...]
```

List, add, remove groups. The add/remove commands accept one or more groups.

#### Group Users

```
zuul group add-key <group> <key name> [...]
zuul group rm-key <group> <key name> [...]
```

These commands manage keys within groups, allowing you to add/remove one or more at a time.

### Servers

#### Enroll

```
zuul enroll <user@hostname>
```

This command will ask for the password before logging into the server and adding the zuul master key, and saving the server to its roster.

#### Server Management

```
zuul server [list]
zuul server show <user@hostname> [...]
zuul server add <user@hostname>
zuul server rm <user@hostname>
```

List, view, add, and remove servers from the zuul roster.

### Access Control

```
zuul grant key <key name> <user@hostname> [...]
zuul grant group <group name> <user@hostname> [...]
zuul revoke key <key name> <user@hostname> [...]
zuul revoke group <group name> <user@hostname> [...]
```

Grant access to (or revoke access from) keys and/or groups for servers in the roster.

### Sync

```
zuul sync [--verbose]
```

Connect to each server in the roster, and update the keys to match zuul's list of permitted keys.

## To Do

* Documentation
* Add "report unknown keys" feature (see below)
* Use natural sorting where applicable

```
zuul server list-users

Users:
    drarok
    peterjwest

Unknown:
    ssh-rsa 0123456789abcdef bad-actor@example.org
```
