import os
import shutil
import re

# Set source folder
srcpath = "nft_parts"
srcfiles = os.listdir(srcpath)
srcfiles = sorted(srcfiles)

# Set destination folder
destpath = "../layers/"

# Create destination folder
if not os.path.exists(destpath):
	os.makedirs(destpath)

# sub folder names
subFolders = {"clan": 0, "accessory": 1, "hat": 2, "mask": 3, "arms": 4, "skirt": 5, "base": 6, "weapon": 7, "hair": 8,
			  "graphic": 9, "bg": 10}


def move(filename, dirpath):
	shutil.move(os.path.join(srcpath, filename), dirpath)


# Takes in cat_name and cat_number to return subfolder name
def create_subfolder_name(cat_name, cat_number):
	return str(cat_number) + "_" + cat_name


# Takes in a a file name, and add count to the filename
# hat.png --> hat#1.png
def add_rarity(name, count):
	split = re.split(r"\.", name)

	return split[0] + "#" + str(count) + "." + split[1]


# Takes in file name and returns cat_name, cat_number and clean_fname
def parse(file):
	split = re.split(r"(_\d+s_\d+_)", file)

	found = re.split(r"_", split[2])

	clean_name_rarity = add_rarity(split[2], 1)

	return (found[0], subFolders[found[0]], clean_name_rarity)


# Create sub-folders in destination folder
for cat_name, _ in subFolders.items():
	if not os.path.exists(os.path.join(destpath, cat_name)):
		os.makedirs(os.path.join(destpath, cat_name))

# Move files
for filename in srcfiles:
	print(filename)
	cat_name, cat_number, clean_fname = parse(filename)

	move(filename, os.path.join(destpath, cat_name, clean_fname))
