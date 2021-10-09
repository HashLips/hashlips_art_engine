# from tabulate import tabulate
import pandas as pd
import json
import os

temp_array = []

# Set paths
RARITY_DATA_JSON_PATH = os.environ["RARITY_DATA_JSON_PATH"]
RARITY_DATA_CSV_PATH = os.environ["RARITY_DATA_CSV_PATH"]
RARITY_SCORE_MAPPING_JSON_PATH = os.environ["RARITY_SCORE_MAPPING_JSON_PATH"]

# Opening JSON file
with open(RARITY_DATA_JSON_PATH) as f:
    all_metadata = json.load(f)

    for layer_name, layer_value in all_metadata.items():
        for trait_name, trait_data in layer_value.items():
            trait_chance = trait_data['chance']
            trait_occurrence = trait_data['occurrence']
            trait_rarity = trait_data['rarity']
            trait_rarity_percentage = trait_data['rarity_percentage']
            rarity_score = trait_data['rarity_score']


            temp_array.append([layer_name, trait_name, trait_chance, trait_occurrence, trait_rarity, trait_rarity_percentage, rarity_score])

            # print(layer_name, trait_name, trait_chance, trait_occurrence, trait_rarity)


full_data = pd.DataFrame(temp_array, columns=['layer_name', 'trait_name', 'trait_chance', 'trait_occurrence', 'trait_rarity', 'trait_rarity_percentage', 'rarity_score'])
# print(tabulate(full_data, headers='keys', tablefmt='psql'))

# Export full_data to csv
full_data.to_csv(RARITY_DATA_CSV_PATH, index=False)


# Score mapping DF to dictionary
score_mapping_dict = dict(zip(full_data.trait_name, full_data.rarity_score))

# Count infinity values
inf_count = 0
for key, val in score_mapping_dict.items():
    if val == 'Infinity':
        score_mapping_dict[key] = '500'
        inf_count += 1
print(f"There are {inf_count} infinity values")

with open(RARITY_SCORE_MAPPING_JSON_PATH, "w") as outfile:
    json.dump(score_mapping_dict, outfile)



'''
====================={ notes }============================


Part | Part_name | count | input_rarity | actual_rarity









====================={ tools }============================

Print json:
print(json.dumps(i, indent=4, sort_keys=True))


















'''
