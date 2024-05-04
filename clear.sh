#!/bin/bash

docker-compose down
docker image rm mega-cna-viewer_observable
docker volume rm mega-cna-viewer_node_modules
