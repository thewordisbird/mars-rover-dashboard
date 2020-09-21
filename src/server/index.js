require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

const getRoverCams = (rover) => {
    /**
     * @description Function to get the availible cameras for a rover.
     * @param rover (str): Name of the roverl.
    */
    const roverCameras = {
        curiosity: [
            {
                name: 'Front Hazard Avoidance Camera',
                abbr: 'FHAZ'
            },
            {
                name: 'Rear Hazard Avoidance Camera',
                abbr: 'RHAZ'
            },
            {
                name: 'Mast Camera',
                abbr: 'MAST'
            },
            {
                name: 'Chemistry and Camera Complex',
                abbr: 'CHEMCAM'
            },
            {
                name: 'Mars Hand Lens Imager',
                abbr: 'MAHLI'
            },
            {
                name: 'Mars Decent Imager',
                abbr: 'MARDI'
            },
            {
                name: 'Navigation Camera',
                abbr: 'NAVCAM'
            }
        ],
        opportunity: [
            {
                name: 'Front Hazard Avoidance Camera',
                abbr: 'FHAZ'
            },
            {
                name: 'Rear Hazard Avoidance Camera',
                abbr: 'RHAZ'
            },
            {
                name: 'Navigation Camera',
                abbr: 'NAVCAM'
            },
            {
                name: 'Panoramic Camera',
                abbr: 'PANCAM'
            },
            {
                name: 'Miniature Thermal Emission Spectrometer (Mini-TES)',
                abbr: 'MINITES'
            }
        ],
        spirit: [
            {
                name: 'Front Hazard Avoidance Camera',
                abbr: 'FHAZ'
            },
            {
                name: 'Rear Hazard Avoidance Camera',
                abbr: 'RHAZ'
            },
            {
                name: 'Navigation Camera',
                abbr: 'NAVCAM'
            },
            {
                name: 'Panoramic Camera',
                abbr: 'PANCAM'
            },
            {
                name: 'Miniature Thermal Emission Spectrometer (Mini-TES)',
                abbr: 'MINITES'
            }
        ]
    };
    return roverCameras[rover.toLowerCase()];
};


// API calls
app.post('/manifest', async (req, res) => {
    /**
     * @description API call to NASA's Mars Rover Photo's API to get rover manifest data.
     * @param roverName (str): Name of the rover passed in the url.
     */
    const roverDataKeys = ['name', 'landing_date', 'launch_date', 'status', 'max_sol', 'max_date', 'total_photos'];
    try {
        const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.body.rover_name}?api_key=${process.env.API_KEY}`)
            .then (res => res.json());

        const rover = Object.keys(manifest.photo_manifest).reduce( (objArray, key) => {
            if (roverDataKeys.includes(key)) {
                objArray[key] = manifest.photo_manifest[key];
            }
            return objArray;
        }, {});

        // Add rover cameras to manifest
        Object.assign(rover, {'cameras': getRoverCams(rover.name)});
        res.send({ rover });
    } catch (err) {
        console.log('error: ', err);
        res.status(400).json( { 'error': `Unable to retrieve manifest data for ${req.body.rover_name}`});
    }
});


app.post('/photos', async (req, res) => {
    /**
     * @description API call to NASA's Mars Rover Photo's API to get photos for specified rover.
     * @param roverName (str): Name of the rover passed in the url.
    */
    try {
        if (req.body.camera != 'all') {
            const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover_name}/photos?sol=${req.body.sol}&page=${req.body.page}&camera=${req.body.camera}&api_key=${process.env.API_KEY}`)
                .then (res => res.json());
            res.send(photos.photos);
        } else {
            const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover_name}/photos?sol=${req.body.sol}&page=${req.body.page}&api_key=${process.env.API_KEY}`)
                .then (res => res.json());
            res.send(photos.photos);
        }
    } catch (err) {
        console.log('error: ', err);
        res.status(400).json( { 'error': `Unable to retrieve photo data for ${req.params.roverName}`});
    }
});

app.listen(port, () => console.log(`Huston listening on port ${port}!`));