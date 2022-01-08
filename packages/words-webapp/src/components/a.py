import os
for root, dirs, files in os.walk(".", topdown=False):
    for name in files:
        os.rename(os.path.join(root, name), os.path.join(root, name).replace("Noun","Word"))

    #for name in dirs:
     #   os.rename(os.path.join(root, name), os.path.join(root, name).replace("Noun","Word"))
