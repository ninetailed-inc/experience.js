#! /bin/bash

set -euo pipefail

function bump_and_publish () {
  if [ "$#" -ne 1 ]; then
    echo "Illegal number of parameters for bump_and_publish"
  fi
  path_after_packages=$1
  nx_project_name=$(echo $1 | sed -E 's/\//-/g')

  echo "Bumping and publishing: $1"

  cd $PROJECT_ROOT
  cd packages/$path_after_packages
  # replace package.json version with NEW_VERSION
  cat package.json | jq ".version = \"$NEW_VERSION\"" > new_package.json
  mv new_package.json package.json

  # build from root of repo
  cd $PROJECT_ROOT
  yarn nx build $nx_project_name
  # publish once built
  cd dist/Packages/$path_after_packages
  npm publish --access public --tag $RELEASE_TAG
}

# TODO: make sure we're at project root
if [ -d .git ]; then
  # okay!
  :
else
  echo "Run this from the project root please!"
  exit 1
fi
PROJECT_ROOT=$(pwd)

if ! command -v jq &> /dev/null
then
    echo "jq could not be found"
    echo "Install it with 'brew install jq' please!"
    exit 1
fi

CURRENT_VERSION=$(cat packages/sdks/javascript/package.json | jq -r '.["version"]')
echo ">> Current version: $CURRENT_VERSION"
echo "What do you want to do?"
echo "(0) ==.==.==.beta+1 (default)"
echo "(1) ==.==.+1.beta0"
echo "(2) ==.==.+1"
echo "(3) ==.+1.0.beta0"
echo "(4) ==.+1.0"
read choice
if [ "$choice" = "" ]; then
  BUMP_FLAGS="prerelease --preid=beta"
  RELEASE_TAG=beta
elif  [ "$choice" = "0" ]; then
  BUMP_FLAGS="prerelease --preid=beta"
  RELEASE_TAG=beta
elif  [ "$choice" = "1" ]; then
  BUMP_FLAGS="prepatch --preid=beta"
  RELEASE_TAG=beta
elif  [ "$choice" = "2" ]; then
  BUMP_FLAGS="patch"
  RELEASE_TAG=latest
elif  [ "$choice" = "3" ]; then
  BUMP_FLAGS="preminor --preid=beta"
  RELEASE_TAG=beta
elif  [ "$choice" = "4" ]; then
  BUMP_FLAGS="minor"
  RELEASE_TAG=latest
fi

# bump up one package to get new version string
cd packages/sdks/shared
npm version $BUMP_FLAGS > /dev/null
NEW_VERSION=$(cat package.json | jq -r '.["version"]')
# we will revisit javascript and treat it the same

echo ">> Bumping to $NEW_VERSION and publishing..."
sleep 1
echo -ne "Here "
sleep 1
echo -ne "we "
sleep 1
echo -ne "go!"
sleep 1
printf "\n\n"

BUMP_LIST=(
  # sdks
  sdks/shared
  sdks/javascript
  sdks/react
  sdks/nextjs
  sdks/gatsby
  sdks/nodejs
  sdks/nextjs-esr

  # plugins
  plugins/analytics
  plugins/ssr
  plugins/google-analytics
  plugins/contentsquare
  plugins/preview-bridge
  plugins/preview
  plugins/segment
  plugins/insights
  plugins/privacy
  plugins/google-tagmanager

  # utils
  utils/javascript
  utils/contentful
)
for i in "${BUMP_LIST[@]}"; do
  bump_and_publish $i
done

# arrived here? we good!
echo "Shiny! Everything at $NEW_VERSION"
