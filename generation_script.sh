ALL_ASSETS_PATH="input/nft_parts"
SIEVED_OUT_ASSETS_PATH="input/(temp)sieved_out_assets"
RARITY_PRESETS_CSV_PATH="input/rarity_presets.csv"
NAME_MAPPING_PATH="input/name_mapping.csv"
LAYERS_FILES_PATH="layers/"

EDITION=8880
WIDTH=$((2769/10))
HEIGHT=$((3000/10))

export ALL_ASSETS_PATH
export LAYERS_FILES_PATH
export RARITY_PRESETS_CSV_PATH
export NAME_MAPPING_PATH
export SIEVED_OUT_ASSETS_PATH
export EDITION
export WIDTH
export HEIGHT

# Renaming files, moving them to layers folder
python scripting/1_parse_csv_and_allocate_assets_to_layers.py