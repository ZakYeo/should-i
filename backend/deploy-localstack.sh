#!/bin/bash

source venv/bin/activate
export DEBUG=1
export LOCALSTACK_API_GATEWAY_BASE_PATH_MAPPING=1
localstack start
