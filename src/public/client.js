// const immutable = window.immutable
//const { default: fetch } = require("node-fetch")

//import { default as fetch } from ".././node-fetch"


let store = {
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    rover: {
        name: "Curiosity",
        cameras: ['FHAZ',  'RHAZ', 'MAST', 'CHEMCAM', 'MAHLI', 'MARDI', 'NAVCAM'],	
        photos: {
            photos: [],
            page: 1
        },
        page: 1
    }
}

const immutableStore = Immutable.Map({
    "rovers": Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    "rover": Immutable.Map({
        "name": "",
        "cameras": Immutable.List([]),
        "photos": Immutable.Map({
            "photos": Immutable.List([]),
            "page": 1
        })
    })

})

// Set root div. This is where all dynamic content goes
const root = document.getElementById('root')

// Update the state of the app
const updateStore = (store, newState) => {
    console.log('5. In updateStore')
    console.log(store, newState)
    store = Object.assign(store, newState)
    //render(root, store)
}

const updateImmutableStore = (state, updateState, nestedPath=null) => {
    if (nestedPath) {
        immutableStore = state.updateIn(nestedPath, )
    }
}

// Render a state. This inject html into the root div
const render = async (root, state) => {
    root.innerHTML = await App(state)
}


// Component Aggregator. 
// Builds the html to be set in the root div. 
// Called by render
const App = async (state) => {
    let { rovers, rover } = state

    return `
    <header></header>
    <main>
        <section>${NavBar(rovers)}</section>
        <section>${await RoverJumbo(rover.name)}</section>
        <section>${CameraFilter(rover.cameras)}</section>`
        // <section>${await RoverPhotos(rover)}</section>
    +`</main>
    <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS
const NavBar = (rovers) => {
    const htmlNavItemString = rovers.reduce((htmlString, currentRover) => {
        htmlString += `
        <li class="nav-item">
            <a class="nav-link" href="#">${currentRover}<span class="sr-only">(current)</span></a>
        </li>
        `
        return htmlString

    }, "")
   
    return `
    <nav class="navbar navbar-dark bg-dark">
    <a class="navbar-brand" href="#">Mars Rovers</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        ${htmlNavItemString}
      </ul>
    </div>
    </nav>`
}


const RoverJumbo = async (roverName) => {
   await fetchAndUpdate('/manifest', {"rover_name": roverName})
    
   // Return html string with query updated store data
   return `
    <div class="jumbotron text-center">
        <div class="container">
            <h1>${store.rover.name}</h1>
            <p>Launched: ${store.rover.launch_date} | Landed: ${store.rover.landing_date} | Status: ${store.rover.status} | Total Photos: ${store.rover.total_photos}</p>                   
        </div>         
    </div>    
    `  
   }


const CameraFilter = (roverCameras) => {    
  
    const htmlCameraString = roverCameras.reduce((htmlString, currentCamera) => {
        htmlString += `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="defaultCheck1">
            <label class="form-check-label" for="defaultCheck1">
                ${currentCamera}
            </label>
        </div>
        `
        return htmlString

    }, "")
   
    return `
    <nav class="navbar navbar-dark bg-dark">
        <button id="btnGroupDrop1" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Cameras
        </button>
        <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
        ${htmlCameraString}
        </div>   
    </nav>`
}

// const RoverPhotos = async (rover) => {
//     const body = {"rover_name": rover.name, "sol": rover.max_sol, "page": rover.page }
//     await fetchAndUpdate('/photos', body)
    
//     console.log(store)
//     // reduce photos to formatted html string
//     // console.log(store)
//     const htmlPhotoString = store.rover.photos.photos.photos.reduce((htmlString, currentPhoto) => {
//         let imgHeight = 
        
//         htmlString += `
//         <div class="col mb-3">
//             <div class="card h-100">
//                 <div class="card-img-frame">
//                     <img src="${currentPhoto.img_src}" class="card-img-top" alt="...">
//                 </div>
        
                
//                 <div class="card-body">
//                     <ul>
//                         <li>Camera: ${currentPhoto.camera.full_name}</li>
//                         <li>Sol: ${currentPhoto.sol}</li>
//                         <li>Earth Date: ${currentPhoto.earth_date}
//                     </ul>
//                 </div>
//             </div>
//         </div>`
//         console.log(htmlString)
//         return htmlString
//     }, "")
   
//     return `
//     <div class="album">
//         <div class="container">
//             <div class="row row-cols-1 row-cols-md-4">
//             ${htmlPhotoString}                
//             </div>
//         </div>
//     </div>
//     `
// }

// ------------------------------------------------------  API CALLS

const fetchAndUpdate = async (url, body) => {
    let response = await fetch(`http://localhost:3000${url}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        const content = await response.json()
        console.log(`API Content: ${content}`)
        updateStore( store, content )
    }
}

// const getRoverInformation = async (state) => {
//     console.log('3. In getRoverInformation for: ')
//     let { rover } = state
    
//     let response = await fetch(`http://localhost:3000/manifest`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({"rover_name": rover.name})
//         });
//     if (!response.ok) {
//         throw new Error(`HTTP error! status; ${response.status}`);
//     } else {
//         let respJson = await response.json()
//         console.log(`4. Returning ${respJson} from getRoverInformation`)
//         return respJson
//     }
// }

// const getRoverPhotos = (state) => {
//     let { rover, page } = state

//     let data = fetch(`http://localhost:3000/photos`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({"rover_name": rover, "sol": 1000, "page": page })
//         })
//         .then( res => res.json())
//         .then( photos => {
//             updateStore( store, { photos })
//         })
//     return data
// }
