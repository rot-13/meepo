# Meepo

### Who's in the office webserver.

#### Setup

- Install `arp-scan` (either `sudo apt-get install arp-scan` in UNIX, or `brew install arp-scan` in OSX).
- Install MongoDB:
  - `brew install mongodb`.
  - `mkdir -p /data/db`.
  - `sudo chmod 0755 /data/db && sudo chown $USER /data/db`.
- 2. Run `npm install`.

#### Run

1. `mongod`.
2. `npm start`.
