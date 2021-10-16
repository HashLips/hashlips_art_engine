import json
import os

DIRECTORY = 'build/json'
MYDIR = ("build/updated_json")

def dir_setup():
    
    CHECK_FOLDER = os.path.isdir(MYDIR)

    # If folder doesn't exist, then create it.
    if not CHECK_FOLDER:
        os.makedirs(MYDIR)
        print("created folder : ", MYDIR)

    else:
        print(MYDIR, "folder already exists.") 
    
def update_files():    
    for filename in os.listdir(DIRECTORY):
        
        if filename == "_metadata.json":
            continue
        
        with open(f"{DIRECTORY}/{filename}") as f:
            data = json.load(f)
            
        data["date"] = str(data["date"])
        data["name"] = "Alien " + data["name"]
        data["edition"] = str(data["edition"])

        attributes = data["attributes"]
        
        for trait in attributes:
            key = trait["trait_type"]
            if key.endswith("W"):
                key = key.rstrip(key[-1])  
            value = trait["value"]
            data[key] = value
            
        data.pop('attributes', None)
            
        with open(f"build/updated_json/{filename}", 'w') as f:
            json.dump(data, f, indent=2)
        
    print("Finished Updating JSON")

def update_metafile():
    metafile = "_metadata.json"

    with open(f"{DIRECTORY}/{metafile}") as f:
        meta = json.load(f)
        
        new_meta = []
        
        for data in meta:

            data["date"] = str(data["date"])
            data["name"] = "Alien " + data["name"]
            data["edition"] = str(data["edition"])

            attributes = data["attributes"]

            for trait in attributes:
                key = trait["trait_type"]
                if key.endswith("W"):
                    key = key.rstrip(key[-1])  
                value = trait["value"]
                data[key] = value
                
            data.pop('attributes', None)
            new_meta.append(data)
            
            
    with open(f"new{metafile}", 'w') as f:
        json.dump(new_meta, f, indent=2)
        
    print(metafile)
    
if __name__ == "__main__":
    dir_setup()
    #update_files()
    #update_metafile()