#!/bin/bash
export NX_PUBLIC_PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo NX_PUBLIC_PACKAGE_VERSION=$NX_PUBLIC_PACKAGE_VERSION > ../../../.env.local