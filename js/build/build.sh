#!/bin/bash
rm -r ../release/coweb-latest
./requirejs-*/build/build.sh coweb.build.js
VERSION=`grep VERSION ../lib/coweb/main.js`
VERSION=${VERSION#*\'}
VERSION=${VERSION%\'*}
rm -r ../release/coweb-${VERSION}
mv ../release/coweb-latest ../release/coweb-${VERSION}
cp ../../NOTICES ../release/coweb-${VERSION}
cp ../../LICENSE ../release/coweb-${VERSION}
rm -r ../release/coweb-src-${VERSION}
mkdir ../release/coweb-src-${VERSION}
cp -r ../lib/* ../release/coweb-src-${VERSION}
cp ../../NOTICES ../release/coweb-src-${VERSION}
cp ../../LICENSE ../release/coweb-src-${VERSION}
