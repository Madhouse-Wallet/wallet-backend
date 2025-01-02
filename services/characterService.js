const characterService = require("../modules/user/services/character")
const { femalePrompt, malePrompt, femaleHeadshotPrompt, maleHeadshotPrompt } = require('../utils/promptGenerator');
const { createCharacter } = require("../modules/user/utils/character")
const addMaleHeadShot = async (seed, charcterId, appearanceInfo, count = 0) => {
    try{
        console.log(seed, count)
        if (count < 4) {
            let addonPrompt = ["full body nude", "selfie", "dick pick", "showing biceps"];
            let desc = ["want to see my body", "want my selfie", "looking for surprise", "want to see my love!"]
            let prompt = await maleHeadshotPrompt(appearanceInfo, addonPrompt[count]);
            let url = await createCharacter({
                "inputImage": null,
                "negativePrompt": "((out of frame)), ((extra fingers)), mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), (((tiling))), ((naked)), ((tile)), ((fleshpile)), ((ugly)), (((abstract))), blurry, ((bad anatomy)), ((bad proportions)), ((extra limbs)), cloned face, (((skinny))), glitchy, ((extra breasts)), ((double torso)), ((extra arms)), ((extra hands)), ((mangled fingers)), ((missing breasts)), (missing lips), ((ugly face)), ((fat)), ((extra legs))",
                "prompt": prompt,
                "seed": seed
            })
            console.log("url==>",url)
            let addExtraImg = await characterService.findByIdAndUpdate(charcterId, {
                $push: {
                    extraImage: [{
                        "desc": desc[count],
                        "url": url
                    }],
                }
            });
            // console.log("addExtraImg===>",addExtraImg)
            if(addExtraImg){
                setTimeout(async () => {
                    (await addMaleHeadShot(seed, charcterId, appearanceInfo, count+1));
                }, 3000);
            }
          
        }else{
            return true;
        }
    }catch(e){
        console.log("error==>", e)
        setTimeout(async () => {
            (await addMaleHeadShot(seed, charcterId, appearanceInfo, count+1));
        }, 3000);
    }
  
}




const addFemaleHeadShot = async (seed, charcterId, appearanceInfo, count = 0) => {
    try{
        console.log(seed, count)
        if (count < 4) {
            let addonPrompt = ["full body nude", "selfie", "showing ass nude", "showing boobs naked"];
            let desc = ["want to see my body", "want my selfie", "looking for surprise", "want to see my love!"]
            let prompt = await femaleHeadshotPrompt(appearanceInfo, addonPrompt[count]);
            let url = await createCharacter({
                "inputImage": null,
                "negativePrompt": "((out of frame)), ((extra fingers)), mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), (((tiling))), ((naked)), ((tile)), ((fleshpile)), ((ugly)), (((abstract))), blurry, ((bad anatomy)), ((bad proportions)), ((extra limbs)), cloned face, (((skinny))), glitchy, ((extra breasts)), ((double torso)), ((extra arms)), ((extra hands)), ((mangled fingers)), ((missing breasts)), (missing lips), ((ugly face)), ((fat)), ((extra legs))",
                "prompt": prompt,
                "seed": seed
            })
            console.log("url==>",url)
            let addExtraImg = await characterService.findByIdAndUpdate(charcterId, {
                $push: {
                    extraImage: [{
                        "desc": desc[count],
                        "url": url
                    }],
                }
            });
            // console.log("addExtraImg===>",addExtraImg)
            if(addExtraImg){
                setTimeout(async () => {
                    (await addFemaleHeadShot(seed, charcterId, appearanceInfo, count+1));
                }, 3000);
            }
          
        }else{
            return true;
        }
    }catch(e){
        console.log("error==>", e)
        setTimeout(async () => {
            (await addFemaleHeadShot(seed, charcterId, appearanceInfo, count+1));
        }, 3000);
    }
  
}

// addMaleHeadShot("1715321302", "663db9dbc3200b02248ef4de",  {
//     Ethnicity: 'Afro-American',
//     Age: 'Mid-age',
//     'Hair color': 'White',
//     'Hair style': 'Long Hair',
//     'Body type': 'Fit',
//     Clothes: 'Football',
//     Face: 'Furious',
//     'Hobbies &amp; Interests': 'Sports'
//   })

    
module.exports = {
    addMaleHeadShot, addFemaleHeadShot
}



