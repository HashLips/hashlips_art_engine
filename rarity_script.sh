RARITY_DATA_JSON_PATH="build/rarityData.json"
RARITY_DATA_CSV_PATH="output/rarity_data.csv"
RARITY_SCORE_MAPPING_JSON_PATH="build/rarity_score_mapping.json"
GENERATED_IMAGE_PATH="build/images/"
FULL_METADATA_JSON_PATH="build/json/0metadata.json"
#
#EDITION=20
#WIDTH=$((2769/10))
#HEIGHT=$((3000/10))
#
export RARITY_DATA_JSON_PATH
export RARITY_DATA_CSV_PATH
export RARITY_SCORE_MAPPING_JSON_PATH
export GENERATED_IMAGE_PATH
export FULL_METADATA_JSON_PATH
#export EDITION
#export WIDTH
#export HEIGHT

# Create rarityData.json
node utils/rarityData.js

# Takes rarity data from rarityData.json and creates a score_mapping.json
python scripting/3_aggregate_rarity.py

# Regenerate _metadata to include NFT Score
node utils/regenerateMetadata.js

# Add NFT score to image name
python scripting/4_rename_by_rarity.py
