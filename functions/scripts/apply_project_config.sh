#!/bin/bash -e

# Copy the relevant config file to src/config.ts before deploying to Firebase

cd "$(dirname "$0")/../src"

if [ -n "$FIREBASE_PROJECT" ]; then
  project_config_file="config.$FIREBASE_PROJECT.ts"
else
  project_id=$(firebase projects:list | awk '/current/{sub(/ .current.*/, ""); sub(/.* │ /, ""); print}' | perl -pe 's/\e\[?.*?[\@-~]//g')
  project_config_file=$(grep -E -l "\"$project_id\"|'$project_id'" config.*.ts)
fi

if [ ! -f "$project_config_file" ]; then
  echo "The file '$project_config_file' is required but does not exist. Create it by copying from 'config.example.ts'."
  exit 1
fi

echo ""
echo "$(tput bold)=== Using config file '$project_config_file' with following content:$(tput sgr0)"
echo ""
head "$project_config_file"
echo "..."
echo ""
if [ "$SKIP_CONFIRMATION" != "Y" ]; then
  read -r -p "Press Enter to proceed, Ctrl+C to cancel. "
fi

cp "$project_config_file" "config.ts"
