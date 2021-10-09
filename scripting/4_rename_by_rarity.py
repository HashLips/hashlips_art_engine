import json
import pprint
import os

temp_array = []

FULL_METADATA_JSON_PATH = os.environ["FULL_METADATA_JSON_PATH"]
GENERATED_IMAGE_PATH = os.environ["GENERATED_IMAGE_PATH"]

# Set source folder to rename
srcpath = GENERATED_IMAGE_PATH
srcfiles = os.listdir(srcpath)
print(srcfiles)

# Opening JSON file
with open(FULL_METADATA_JSON_PATH) as f:
    all_metadata_w_NFTSCORE = json.load(f)

    for metadata in all_metadata_w_NFTSCORE:

        # N.png
        oldname = str(metadata['edition']) + '.png'

        # XXX_2.png
        newname = str(metadata['NFT_SCORE']) + "_" + oldname

        # Rename files
        os.rename(os.path.join(srcpath, oldname), os.path.join(srcpath, newname))