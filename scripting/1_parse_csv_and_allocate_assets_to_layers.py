import os
import shutil
import re
import csv
import pprint

# ===================================== Config ================================================

# Set paths
all_assets_path = os.environ["ALL_ASSETS_PATH"]
layers_files_path = os.environ["LAYERS_FILES_PATH"]
rarity_presets_csv_path = os.environ["RARITY_PRESETS_CSV_PATH"]
name_mapping_path = os.environ["NAME_MAPPING_PATH"]
sieved_out_assets_path = os.environ["SIEVED_OUT_ASSETS_PATH"]

print(all_assets_path)
print(layers_files_path)
print(rarity_presets_csv_path)

# Create temporary folder, (temp)sieved_out_assets, to store sieved out assets
if os.path.exists(sieved_out_assets_path):
    shutil.rmtree(sieved_out_assets_path)
os.makedirs(sieved_out_assets_path)

# Remove layers folder and create new
if os.path.exists(layers_files_path):
    shutil.rmtree(layers_files_path)
os.makedirs(layers_files_path)

# sub folder names
subFolders = {"clan": 0, "accessory": 1, "hat": 2, "mask": 3, "arms": 4, "skirt": 5, "base": 6, "weapon": 7, "hair": 8,
              "graphic": 9, "bg": 10}

# ========================= Obtain chance data from rarity_presets.csv  =========================
print("\n============ Obtaining chance data from rarity_presets.csv  ============")
name_chance_mapping = {}

with open(rarity_presets_csv_path) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    next(csv_reader, None)  # skip the headers

    part = 0
    name = 1
    colour = 2
    unique_count = 3
    colour_count = 4
    chance = 5
    preset_rarity = 6
    remarks = 7

    line_count = 0
    for row in csv_reader:
        if row[0] == 'X':
            continue
        else:
            name_chance_mapping[row[name].strip()] = row[chance]
            line_count += 1

print(f"Obtained {line_count} data")

# ========================= Sieve (copy out) ONLY assets present in rarity_preset.csv =========================
print("\n============ Sieving assets ============")
print("Before:")
print("all_assets_path length: ", len(os.listdir(all_assets_path)))
print("sieved_out_assets_path length: ", len(os.listdir(sieved_out_assets_path)))

# Iterate through all_asset_files
all_asset_files = os.listdir(all_assets_path)
all_asset_files = sorted(all_asset_files)

# Validity check
sieved_set = set()

for file in all_asset_files:
    file_without_png = os.path.splitext(file)[0]

    # If current asset is in the mapping
    if file_without_png in name_chance_mapping.keys():
        sieved_set.add(file_without_png)
        # Copy over to temporary folder
        shutil.copyfile(os.path.join(all_assets_path, file), os.path.join(sieved_out_assets_path, file))

print("After: ")
print("all_assets_path length:", len(os.listdir(all_assets_path)))
print("sieved_out_assets_path length: ", len(os.listdir(sieved_out_assets_path)))

# =========================== old asset name to new asset name =====================================

# store old_name to new_name into a mapping
oldname_newname_mapping = {}
with open(name_mapping_path) as name_mapping_csv:
    reader = csv.reader(name_mapping_csv, delimiter=',')
    next(reader, None)  # skip the headers

    for row in reader:
        oldname_newname_mapping[row[0]] = row[1]


# ========================= Helper functions =======================================

# Takes in oldname, return category and newname(with chance included)
def changeName_addChance(oldnamepng):
    oldname = os.path.splitext(oldnamepng)[0]

    # E.g: oldname.png ----> newname#chance.png
    newnamepng = oldname + "#" + str(name_chance_mapping[oldname]) + ".png"
    # oldname_newname_mapping[oldname] + "#" + str(name_chance_mapping[oldname]) + ".png"

    # get category from name
    category = re.split(r"_", newnamepng)[0].strip()

    return category, newnamepng


# ========================= Main script  =======================================

# Create sub-folders in destination folder
for cat_name, _ in subFolders.items():
    if not os.path.exists(os.path.join(layers_files_path, cat_name)):
        os.makedirs(os.path.join(layers_files_path, cat_name))

# Iterate through sieved_out_assets
print("\n============ Moving assets ============")
moved_assets = 0
sieved_out_assets = os.listdir(sieved_out_assets_path)
sieved_out_assets = sorted(sieved_out_assets)
for trait in sieved_out_assets:
    # Copy trait name
    trait_copy = trait

    # Parse name
    category, newnamepng = changeName_addChance(trait_copy)

    # Move to layers_files_path
    shutil.move(os.path.join(sieved_out_assets_path, trait), os.path.join(layers_files_path, category, newnamepng))
    moved_assets += 1
print(f"Moved {moved_assets} assets")

# Remove temporary folder
shutil.rmtree(sieved_out_assets_path)

# ========================= Validity check  ==================================

A = set(name_chance_mapping.keys())
B = sieved_set

print("\n============ Validity check ============")
print(f"Target number of assets: {len(A)} (From CSV)")
print(f"Actual number of assets: {len(B)}")

print(f"Present in CSV but not in actual: {A.difference(B)}")
print(f"Present in actual, but not in CSV: {B.difference(A)}")