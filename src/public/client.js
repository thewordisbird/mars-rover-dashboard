//const { get } = require("immutable")

//import { default as fetch } from ".././node-fetch"

let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    rover: "Curiosity",
    sol: null,
    photos: [],
    page: 1
}

// Set root div. This is where all dynamic content goes
const root = document.getElementById('root')

// Update the state of the app
const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

// Render a state. This inject html into the root div
const render = async (root, state) => {
    root.innerHTML = App(state)
    // let { apod } = state
    // ImageOfTheDay(apod)
    // console.log(`Application State: ${state.apod}`)
}


// Component Aggregator. 
// Builds the html to be set in the root div. 
// Called by render
const App = (state) => {
    let { rovers, apod, rover } = state
    console.log(`Rovers: ${rovers}, apod: ${Object.keys(apod)}`)
    RoverPhotos(rover)
    return `
        <header></header>
        <main>

            <section>${RoverPhotos(rover)}</section>`+

            // <section>${ImageOfTheDay(apod)}</section>
            // <section>${RoverInformation(rover)}</section>
            
            // <section>${RoverPhotoHistory(rover)}</section>
        `</main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    console.log('looping ...')
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS
// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    console.log('ImageOfTheDay', apod)
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate() ) {
        console.log('requesting apod', Date.now())
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

// const RoverJumbo = (rover) => {
//     // Check for information in the store.
//     getRoverInformation(store)
    
//     return `
    
//     `
// }

const RoverPhotos = (rover) => {
    console.log('RoverPhotos', rover)
    // Check for photos in store
    if (store.photos.length == 0) {
        getRoverPhotos(store)
    }
    
    // reduce photos to formatted html string
    console.log(store)
    const htmlPhotoString = store.photos.photos.photos.reduce((htmlString, currentPhoto) => {
        htmlString += `
        <div class="col mb-4">
            <div class="card h-100">
                <img src="${currentPhoto.img_src}" class="card-img-top" alt="...">
                <div class="card-body">
                <ul>
                    <li>Camera: ${currentPhoto.camera.full_name}</li>
                    <li>Sol: ${currentPhoto.sol}</li>
                    <li>Earth Date: ${currentPhoto.earth_date}
                </ul>
                </div>
            </div>
        </div>`
        return htmlString
    }, "")
   
    return `
    <div class="album">
        <div class="container">
            <div class="row row-cols-1 row-cols-md-3">
            ${htmlPhotoString}                
            </div>
        </div>
    </div>
    `
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    let data = fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => {
            console.log('getImageOfTheDay: ', apod)
            updateStore(store, { apod })
        })

    return data
}

// const getRoverInformation = (state) => {
//     let { rover } = state

//     let data = fetch(`http://localhost:3000/manifest`)
//         .then(res => res.json())
//         .then(rover => {
//             console.log('getImageOfTheDay: ', rover)
//             updateStore(store, { rover })
//         })

//     return data
// }

const getRoverPhotos = (state) => {
    let { rover } = state

    let data = fetch(`http://localhost:3000/photos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"rover_name": "curiosity", "sol": 1000, "page": 1 })
        })
        .then( res => res.json())
        .then( photos => {
            //console.log( {photos} )
            console.log(`photos in store BEFORE update: ${store.photos}`)
            updateStore( store, { photos })
            console.log(`photos in store AFTER update: ${store.photos}`)
            //updateStore( store, { photos })
        })
    return data
}
