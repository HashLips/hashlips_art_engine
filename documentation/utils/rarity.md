# Rarity

![](<../.gitbook/assets/image (2).png>)

Calculate the count and percentage of each trait and value that _was_ generated, and output `build/_rarity.csv` And, rank the tokens generated in rarity-order; output to `build/_ranking.csv`

Running the rarity script will print out a the data to the terminal as well as gener

#### Prerequisites:

- Art must be generated
- `_metadata.json` must be in `./build/json/`

### Usage

```
yarn rarity
```

#### if using npm

```
npm run rarity
```

### Using the CSV file

Open or import the .csv file into your preferred spreadsheet application (e.g., excel, google sheets) to view
