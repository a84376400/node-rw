#! /bin/sh

docker build -t 114.220.74.133:5000/raiwav-server:latest .
if [ $? != 0 ]; then
  echo 'Build Docker Image Error!'
  exit 0
fi

docker push 114.220.74.133:5000/raiwav-server:latest