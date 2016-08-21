#!/bin/bash
## Expects
## 1: Git repository
## 2: Branch name
## 2: Service name
## 3: Zookeeper host
npm install /home/app/services/$1/
node /home/app/shared/prepare.js $1 $2
forever --workingDir  /home/app/services/$1/ /home/app/services/$1/app.js
