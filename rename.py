import os

# specify the directory containing the files
directory = "./layers/"

# loop through all the files and subdirectories in the directory
for root, dirs, files in os.walk(directory):
    for filename in files:
        # create the new filename by replacing "-" with " "
        new_filename = filename.replace("-", " ")
        print(filename)
        
        # rename the file with the new filename
        os.rename(os.path.join(root, filename), os.path.join(root, new_filename))
