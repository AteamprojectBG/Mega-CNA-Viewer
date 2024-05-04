#!/bin/bash

mkdir -p observable/node_modules
docker-compose build
docker-compose -f docker-compose.yml up
