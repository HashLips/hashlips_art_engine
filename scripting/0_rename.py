import os
import shutil
import re
import csv
import pprint

# Set source folder
asset_files_path = "imported_files/nft_parts"
asset_files = os.listdir(asset_files_path)
asset_files = sorted(asset_files)

print(asset_files)

# Set destination folder
destpath = "layers/"


def parse_folder_obtain_names_nft_parts(name):
    split = re.split(r"(_\d+s_\d+_)", name)

    print(split)
    _ = re.split(r"_", split[2])

    # split[2][:-4].strip() is the clean_fname
    return split[2].strip()



for trait_name in asset_files:
    cleaned_name = parse_folder_obtain_names_nft_parts(trait_name)

    os.rename(os.path.join(asset_files_path, trait_name), os.path.join(asset_files_path, cleaned_name))

