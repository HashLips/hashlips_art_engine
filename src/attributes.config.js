// the value of the attribute can be a range of values or a random number. 
// To use a range, use the format: range: ["value1", "value2", "value3"]
// To use a random value, use the format: minValue: 10, maxValue: 100
const config =  {
    // add this randomly generated traits to the attributes
    customAttributes: [
        // Uncomment to add a random trait to the attributes
        // {
        //     //the name of the attribute
        //     trait_type: "Height",
        //     //a range of values for the attribute
        //     minValue: 140,
        //     maxValue: 200,
        // },
        // {
        //     //the name of the attribute
        //     trait_type: "Weight",
        //     //a range of values for the attribute
        //     minValue: 50,
        //     maxValue: 100,
        // },
        // {
        //     //the name of the attribute
        //     trait_type: "Music Genre",
        //     //a range of values for the attribute
        //     range: ["Pop", "Punk", "Rock", "Metal", "Disco", "Jazz", "Classical", "Hip Hop", "Reggae", "Blues", "Soul", "Electronic"],
        // },
        // {
        //     trait_type: "Another attribute name",
        //     minValue: 140,
        //     maxValue: 200,
        // },
    ],
}

module.exports = config