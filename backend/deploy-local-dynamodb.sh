#!/bin/bash
cd dynamodb_local_latest || exit
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
