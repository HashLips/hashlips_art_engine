/* set_rarities.js
   set rarities specified in src/config.js to image files 
*/

const { publicDecrypt } = require("crypto");
const fs = require("fs");
const basePath = process.cwd();

const {
    layerConfigurations,
    src_none_file,
    rarityDelimiter,
} = require(`${basePath}/src/config.js`);

// add a new file with a rarity figure
const add_new_file_with_rarity = (file_name, rarity) => {
    let head = file_name.slice(0,-4).split(rarityDelimiter).shift()
    let tail = file_name.slice(-4)
    fs.copyFileSync(src_none_file, head + rarityDelimiter + rarity + tail)
}

// add rarity figure to an existing file
const add_rarity_to_exiting_file = (file_name, rarity) => {
    let head = file_name.slice(0,-4).split(rarityDelimiter).shift()
    let tail = file_name.slice(-4)
    fs.renameSync(file_name, head + rarityDelimiter + rarity + tail)
}

main = () => {
    const layersDir = `${basePath}/layers/`;
    let layer_Objs = layerConfigurations.map((layerconfig) => {
        return layerconfig.layersOrder})

    // normalise the rarity figures from config.js to layers_rarities
    let layers_rarities = layer_Objs[0].map(obj => 
        obj.options
        ? { name: obj.name,
            subGroup: obj.options.subGroup? obj.options.subGroup : false,
            noneToReveal: obj.options.noneToReveal? obj.options.noneToReveal : [], 
            rarities: obj.options.rarities? obj.options.rarities : [100, []],
            noResetRarities: obj.options.noResetRarities? true : false}
        : { name: obj.name, 
            subGroup: false,
            noneToReveal: [], 
            rarities: [100, []],
            noResetRarities: false}
    )
    
    // filter out the layers where its noResetRarities is true
    layers_rarities = layers_rarities.filter(layer=>layer.noResetRarities===false)
 
    try {
        layers_rarities.forEach(layer => {
            console.log('Layer: %s', layer.name)

            // layer.rarities must be an array
            if (!Array.isArray(layer.rarities)) {
                throw new Error('rarities must be an array')
            } 
            
            // define a function to update rarities to corresponding trait files
            const update_traits_with_rarities = (traits, rarities, dirPath) => {
                let traits_rarities = []        // [[trait_file_name, rarity]]
                if (rarities[1].length === 0) {
                    // when rarities for traits are not set as [], distribue them evenly
                    rarity_weight = (rarities[0]/traits.length).toFixed(2)
                    traits_rarities = traits.map(trait => [trait, rarity_weight])
                }
                else {
                    if (rarities[1].length === traits.length) {
                        traits_rarities = traits.map((trt, i) => [trt, rarities[1][i]])
                    }
                    else {
                        err_msg = 'Number of rarities (' + rarities[1].length + ')'
                                + ' do not match traits (' + traits.length + ')'
                        throw new Error(err_msg)
                    }
                }
        
                // if total trait rarities rarities[0] <100, addin None.png with rarity
                let none_trait = dirPath + '/None.png'
                if (rarities[0] < 100){
                    add_new_file_with_rarity(none_trait, 100 - rarities[0])
                }          
                // add rarities to trait files
                traits_rarities.forEach(rarity => {
                    add_rarity_to_exiting_file(dirPath + rarity[0], rarity[1])
                })
            }
            
            // take a layer's rarities and options to validate and normalise the rarities
            // and then call update_traits_with_rarities() to update rarities    
            const update_rarities = (rarities, dirPath, noneToReveal=[]) => {
                // define a function for rarities format check, throw an error if incorrect
                const rarities_format_check = (rarities, msg) => {
                    // ttotal trait-rarities number (rarities[0]) must be in (0,100]
                    if (typeof(rarities[0]) !== 'number' | rarities[0] > 100 | rarities[0] <= 0) {
                        throw new Error('%s: total trait-rarities number (rarities[0]) must be in (0,100]', msg)
                    }
                    
                    // trait-rarities rarities[1] must be an array, each rarity must be a non-negative number
                    if (!Array.isArray(rarities[1])) {
                        throw new Error('%s: trait-rarities rarities[1] must be an array', msg)         
                    }
                    else { 
                        if (rarities[1].length > 0 
                            & rarities[1].every(rarity => (typeof(rarity)!=='number') & rarity < 0)) {
                                throw new Error('%s: every trait rarity must be a non-negative number!', msg)
                        }
                    }
                }

                // remove exiting None*.png files in dirPath in order to let only 'real' trait files exist
                let existing_none_png_files = fs.readdirSync(dirPath)
                    .filter(item => /None/g.test(item))
                    .filter(item => /\bpng/g.test(item))
                existing_none_png_files.forEach(none_file => {
                    fs.rmSync(dirPath + '/' + none_file)    
                })

                if (noneToReveal.length === 0) {    // No noneToReveal
                    rarities_format_check(rarities, layer.name)
                    let traits = fs.readdirSync(dirPath)
                        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
                    update_traits_with_rarities(traits, rarities, dirPath)
                }
                else {  // at least one file is set in the noneToReveal
                    if (layer.rarities.length === 0) { // No rarities set for the layer
                        rarities = [[100, []], [40, []]]
                    }
                    else { // rarities set in the format [number, [...], [...]] 
                           // [0]: [total rarities number for Non-nonToReveal
                           // [1]: rarities for noneToReveal, [2]: for the rest
                        if (layer.rarities.length === 3) {
                            rarities = [[100, layer.rarities[1]], [layer.rarities[0], layer.rarities[2]]]
                        }
                        else {
                            throw new Error('%s: rarities format must be either [] or [number, [], [])', layer.name)
                        }   
                    }

                    rarities_format_check(rarities[0], layer.name + '[noneToReveal]')
                    rarities_format_check(rarities[1], layer.name + '[Non-noneToReveal]')

                    // put the trait files in traits = [[], []]: 
                    // traits[0]: noneToReveal trait files, traits[1]: Non-noneToReveal trait files
                    let traits = [[], []]
                    let allFiles = fs.readdirSync(dirPath)
                        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
                    
                    let pureNoneToReveail = noneToReveal.map(item=>item.split('.').shift())
                    allFiles.forEach (fl => {
                        if (pureNoneToReveail.includes(fl.split(rarityDelimiter).shift().split('.').shift())) {
                          traits[0].push(fl)
                        }
                        else {
                            traits[1].push(fl)
                        }
                    })

                    // update traits files with rarities
                    seq = [0, 1]
                    seq.forEach(i => {update_traits_with_rarities(traits[i], rarities[i], dirPath)})
                }
        
            }
            
            if (layer.subGroup) {  // if subfolders exist, update_rarities for each folder
                let subDirs = fs.readdirSync(layersDir + layer.name)
                        .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
                if (layer.rarities.length === 0) { // if rarities == []
                    subDirs.forEach(subDir => {
                        console.log("        - " + subDir)
                        update_rarities([0,[]], layersDir + layer.name + '/' + subDir + '/')
                    })
                }
                else{  
                    if (layer.rarities.length === 1) { // if rarities == [[]], all subfolders are set with same rarities
                        subDirs.forEach(subDir => {
                            update_rarities(layer.rarities[0], layersDir + layer.name + '/' + subDir + '/')
                        })
                    }
                    else { 
                        if (subDirs.length !== layer.rarities.length) {
                            throw new Error("%s: Number of sub folders (%d) do not match rarities (%)",
                                            layer.name, subDirs.length, layer.rarities.length)
                        }
                        for (let i=0; i<subDirs.length; i++) { 
                            console.log("        - " + subDirs[i])
                            update_rarities(layer.rarities[i], layersDir + layer.name + '/' + subDirs[i] + '/')
                        }
                    }
                }
            }
            else {
                if (layer.noneToReveal.length > 0) {  // if at least one trait exists in noneToReveal
                    update_rarities(layer.rarities, layersDir + layer.name + '/', layer.noneToReveal)
                }
                else {
                    update_rarities(layer.rarities, layersDir + layer.name + '/')
                }
            }
        });    
    } catch (e) {
        console.log('Script terminates: ', e.message)
    }
}

main()
