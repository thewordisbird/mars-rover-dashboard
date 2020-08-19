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

// your API calls
/**
 * @description API call to NASA's Mars Rover Photo's API to get rover manifest data.
 * @param roverName (str): Name of the rover passed in the url.
 */
app.post('/manifest', async (req, res) => {
    const roverDataKeys = ["name", "landing_date", "launch_date", "status", "total_photos"]
    console.log(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.body.rover_name}?api_key=${process.env.API_KEY}`)
    try {
        const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.body.rover_name}?api_key=${process.env.API_KEY}`)
            .then (res => res.json())
        // TODO: make this a call back reducer function that returns a JSON object to be returned
        const roverData = Object.keys(manifest.photo_manifest).reduce( (objArray, key) => {
            console.log(objArray, key)
            if (roverDataKeys.includes(key)) {
                console.log(`Adding ${key} to ${objArray}`)
                objArray[key] = manifest.photo_manifest[key]
            }
            return objArray
        }, {})
        console.log(roverData)
        res.send({ roverData })
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

    console.log(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover_name}/photos?sol=${req.body.sol}&page=${req.body.page}&api_key=${process.env.API_KEY}`)
    try {
        const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.body.rover_name}/photos?sol=${req.body.sol}&page=${req.body.page}&api_key=${process.env.API_KEY}`)
            .then (res => res.json())
        res.send({ photos })
    } catch (err) {
        console.log('error: ', err)
        res.status(400).json( { "error": `Unable to retrieve photo data for ${req.params.roverName}`})
    }
})

// Can add camera options date picker, etc
//https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&page=2&api_key=DEMO_KEY

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?date=2020-08-01&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))