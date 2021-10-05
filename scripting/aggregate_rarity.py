from tabulate import tabulate
import pandas as pd
import json




X = []

df = pd.DataFrame(X, columns=['A', 'B', 'C'])

# Opening JSON file
with open('../build/json/_metadata.json') as f:
    all_metadata = json.load(f)

    for metadata in all_metadata:

        print(metadata)












'''
====================={ notes }============================


Part | Part_name | count | input_rarity | actual_rarity









====================={ tools }============================

Print json:
print(json.dumps(i, indent=4, sort_keys=True))


















'''





