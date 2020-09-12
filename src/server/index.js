require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

const getRoverCams = (rover) => {
    const roverCameras = {
        "curiosity": [
            {
                "name": "Front Hazard Avoidance Camera",
                "abbr": "FHAZ"
            },
            {
                "name": "Rear Hazard Avoidance Camera",
                "abbr": "RHAZ"
            },
            {
                "name": "Mast Camera",
                "abbr": "MAST"
            },
            {
                "name": "Chemistry and Camera Complex",
                "abbr": "CHEMCAM"
            },
            {
                "name": "Mars Hand Lens Imager",
                "abbr": "MAHLI"
            },
            {
                "name": "Mars Decent Imager",
                "abbr": "MARDI"
            },
            {
                "name": "Navigation Camera",
                "abbr": "NAVCAM"
            }
        ],
        "opportunity": [
            {
                "name": "Front Hazard Avoidance Camera",
                "abbr": "FHAZ"
            },
            {
                "name": "Rear Hazard Avoidance Camera",
                "abbr": "RHAZ"
            },
            {
                "name": "Navigation Camera",
                "abbr": "NAVCAM"
            },
            {
                "name": "Panoramic Camera",
                "abbr": "PANCAM"
            },
            {
                "name": "Miniature Thermal Emission Spectrometer (Mini-TES)",
                "abbr": "MINITES"
            }
        ],
        "spirit": [
            {
                "name": "Front Hazard Avoidance Camera",
                "abbr": "FHAZ"
            },
            {
                "name": "Rear Hazard Avoidance Camera",
                "abbr": "RHAZ"
            },
            {
                "name": "Navigation Camera",
                "abbr": "NAVCAM"
            },
            {
                "name": "Panoramic Camera",
                "abbr": "PANCAM"
            },
            {
                "name": "Miniature Thermal Emission Spectrometer (Mini-TES)",
                "abbr": "MINITES"
            }
        ]
    }
    console.log(`cams for ${rover}: ${roverCameras[rover.toLowerCase()]}`)
    return roverCameras[rover.toLowerCase()]

}


// your API calls
/**
 * @description API call to NASA's Mars Rover Photo's API to get rover manifest data.
 * @param roverName (str): Name of the rover passed in the url.
 */
app.post('/manifest', async (req, res) => {
    const roverDataKeys = ["name", "landing_date", "launch_date", "status", "max_sol", "max_date", "total_photos"]
    console.log(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.body.rover_name}?api_key=${process.env.API_KEY}`)
    try {
        const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.body.rover_name}?api_key=${process.env.API_KEY}`)
            .then (res => res.json())
        // TODO: make this a call back reducer function that returns a JSON object to be returned
        const rover = Object.keys(manifest.photo_manifest).reduce( (objArray, key) => {
            // console.log(`evaluating ${key}: ${key} in ${roverDataKeys}: ${roverDataKeys.includes(key)}`)
            if (roverDataKeys.includes(key)) {
                console.log(`Adding ${key} to ${objArray}`)
                objArray[key] = manifest.photo_manifest[key]
            }
            return objArray
        }, {})
        // Add rover cameras to manifest

        Object.assign(rover, {'cameras': getRoverCams(rover.name)})
        res.send({ rover })
    } catch (err) {
        console.log('error: ', err)
        res.status(400).json( { "error": `Unable to retrieve manifest data for ${req.body.rover_name}`})
    }
})

// Rover photos for specified rover
/** 
 * @description API call to NASA's Mars Rover Photo's API to get photos for specified rover.
 * @param roverName (str): Name of the rover passed in the url.
 * TODO: return only photo list. JSON too deep.
*/
app.post('/photos', async (req, res) => {
    console.log(req.body)
    try {
        if (req.body.camera != 'all') {
            const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover_name}/photos?sol=${req.body.sol}&page=${req.body.page}&camera=${req.body.camera}&api_key=${process.env.API_KEY}`)
                .then (res => res.json())
                res.send(photos.photos)
        } else {
            const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover_name}/photos?sol=${req.body.sol}&page=${req.body.page}&api_key=${process.env.API_KEY}`)
                .then (res => res.json())
                res.send(photos.photos)

        }
        
    } catch (err) {
        console.log('error: ', err)
        res.status(400).json( { "error": `Unable to retrieve photo data for ${req.params.roverName}`})
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))