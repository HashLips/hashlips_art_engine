# Rarity

Rarity values are wimply weights within the layer. Leaving a file without a rarity indicator will result in a weight of 1 for that file.

To control a rough percentage of when a layer will contain an item you need to first create an empty layer and name it something like None_100.png. 100 will then become your maximum weight for items in that layer. The layers will be looped through alphabetically and the first element passed the weight threshold for the layer will be selected.

Setting the weight of None to over 100 will have the effect of making the entire layer more rare. For example, if you only want 20% of the collection to have any of the items from that layer, you could set the weight to 2000 and the items weight to no higher than 100.

*NOTE this is psuedo math... will add actual equation later