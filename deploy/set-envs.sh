#!/bin/bash
source secret.keys

echo cf set-env TWIT_CONSUMER_KEY        ${consumer_key}
echo cf set-env TWIT_CONSUMER_SECRET     ${consumer_secret}
echo cf set-env TWIT_ACCESS_TOKEN        ${access_token}
echo cf set-env TWIT_ACCESS_TOKEN_SECRET ${access_token_secret}
