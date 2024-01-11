#! /bin/bash

# Script to bump and publish all packages defined in the BUMP_LIST.
#
# 2 modes are available: CI and CLI.
#   CI: run with the CI=true flag to automatically bump to the GITHUB_TAG
#       version (automatically set in git).
#       To use this mode, create a release from Github release UI, and the 
#       pipeline will automatically run.
#       Note: this mode will add signed provenance to the NPM packages.
#       Example to run in CI mode:
#         `CI=true GITHUB_TAG=1.1.0-beta DRY_RUN=true ./tools/bump_and_publish_sdks.sh`
#   CLI: Run from a local laptop, for admin only. Interactive Shell allowing
#        to choose the version bumping strategy.
#        Example to run in CLI mode:
#         `DRY_RUN=true ./tools/bump_and_publish_sdks.sh`


# set -e to exit on error
# set -u to exit on undefined variable
# set -o pipefail to exit on pipe fails
set -euo pipefail

# Add NPM --dry-run flag if DRY_RUN is set to trie
if [ "$DRY_RUN" = "true" ]; then
  DRY_RUN_FLAG="--dry-run"
else
  DRY_RUN_FLAG=""
fi

#############
# Functions #
#############
function bump_and_publish () {
  if [ "$#" -ne 1 ]; then
    echo "Illegal number of parameters for bump_and_publish"
    exit 1
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
  cd dist/packages/$path_after_packages

  # If runs from GHA pipeline, we add provenance to the package.
  # https://docs.npmjs.com/generating-provenance-statements
  if [ "$CI" = "true" ]; then
    npm publish $DRY_RUN_FLAG --provenance --access public --tag $RELEASE_TAG 
  else
    npm publish $DRY_RUN_FLAG --access public --tag $RELEASE_TAG
  fi
}

########
# Main #
########
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

# check if it is running in CI
# (variable automatically set to true in github)
if [ "${CI:-}" = "true" ]; then
  echo "[i] Running in CI mode"

  if [ -z "$GITHUB_TAG" ]; then
    echo "GITHUB_TAG is not set. It needs to be set when run with the CI flag."
  else
    echo "[i] GITHUB_TAG is set to $GITHUB_TAG"
  fi

  NEW_VERSION=$GITHUB_TAG

  # if the tag contains beta, we publish to the beta tag on NPM
  if [[ $GITHUB_TAG == *"beta"* ]]; then
    RELEASE_TAG="beta"
  else
    # otherwise we use latest
    RELEASE_TAG="latest"
  fi
# otherwise, we run in interactive CLI mode
else
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
fi

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
echo "[✔️] Shiny! Everything at $NEW_VERSION"
