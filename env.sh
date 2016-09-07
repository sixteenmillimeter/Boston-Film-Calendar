#!/bin/bash

export ADMIN_PW="password"
echo "ADMIN_PW is: "
echo $ADMIN_PW
export DATABASE_URL="postgres://bostonfilmherokudev:devpassword@127.0.0.1:5432/bostonfilmdev"
echo "DATABASE_URL is: "
echo $DATABASE_URL