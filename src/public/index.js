// Set root div. This is where all dynamic content goes
const root = document.getElementById('root')

// Event delegation for dynamic camera filter
root. addEventListener('click', event => {
    if (event.target.className === 'dropdown-item') {
        console.log(event.target.id);
        updateRoverCam(store, event.target.id)
        render(root, store)
    }
})

// Make store Immutable Object
let store = Immutable.Map({
    "rovers": Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    "rover": Immutable.Map({
        "name": 'Curiosity',
        "cameras": Immutable.List([]),
        "camera": 'all',
        "page": 1
    })
})


// General update store nested

// Store API Calls (getRovers, getRover, setRover, getPhotos)
const getRovers = (state) => {
    return state.get('rovers')
}

const getRover = (state) => {
    // Check for rover in store. Eventually this should be a routed path and
    // validated by the url
    if (state.hasIn(['rover'])) {
        return state.get('rover')
    }
    // TODO: Error if rover not set
    console.log('No rover selected!')
}

const getRoverCams = () => {
    console.log('cam store', store)
}

const updateRover = (state, roverInfo) => {
    store = state.merge(roverInfo)
    console.log(store.toJS())
    }
    
const updateRoverCam = (state, roverCam) => {
    store = state.updateIn(['rover', 'camera'], val => roverCam)
    console.log(store.toJS())
}

// Render page
const render = async (root, state) => {
    root.innerHTML = await App(state)
}

// App compiler
const App = async (state) => {
    // Make API Calls to update store

    const navBar = NavBar(getRovers(state))
    const roverJumbo = await  RoverJumbo(getRover(state))
    const cameraFilter = CameraFilter()
    const roverPhotos = await RoverPhotos(getRover(store))
    return `
    <header>
        <section>${navBar}</section>
        <section>${roverJumbo}</section>
        <section>${cameraFilter}</section>
    </header>
    <main>
        
        <section>${roverPhotos}</section>
    </main>
    <footer></footer>
    `

}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    // TODO: Dynamic routing from compiled list of rovers
    render(root, store)

})

//---------- COMPONENTS ---------- 
const listRovers = (rovers) => {
    const htmlListRoveres = rovers.reduce((htmlString, currentRover) => {
        htmlString += `
        <li class="nav-item">
            <a class="nav-link" href="#">${currentRover}<span class="sr-only">(current)</span></a>
        </li>
        `
        return htmlString

    }, "")

    return htmlListRoveres

}

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
        <div class="container">
            <a class="navbar-brand" href="#">Mars Rovers</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>
        
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                ${htmlNavItemString}
            </ul>
            </div>
        </div>
    </nav>`
}


const RoverJumbo = async (rover) => {
    const data = await fetchData('/manifest', {"rover_name": rover.get('name')})
    
    updateRover(store, data)
    // console.log(store)
    return `
        <div class="jumbotron text-center">
            <div class="container">
                <h1>${store.getIn(['rover', 'name'])}</h1>
                <p>Launched: ${store.getIn(['rover', 'launch_date'])} | Landed: ${store.getIn(['rover', 'landing_date'])} | Status: ${store.getIn(['rover', 'satus'])} | Total Photos: ${store.getIn(['rover', 'total_photos'])}</p>                   
            </div>         
        </div>    
    `     
    }

const CameraFilter = () => {    
    const roverCameras = store.getIn(['rover', 'cameras'])
    console.log(roverCameras.toJS())
    const htmlCameraString = roverCameras.reduce((htmlString, currentCamera) => {
        // console.log(currentCamera)
        htmlString += `<div class="dropdown-item" id="${currentCamera.get('abbr')}">${currentCamera.get('name')}</div>`

        // htmlString += `
        // <div class="form-check">
        //     <input class="form-check-input" type="checkbox" value="" id="${currentCamera.get('abbr')}">
        //     <label class="form-check-label" for="defaultCheck1">
        //         ${currentCamera.get('name')}
        //     </label>
        // </div>
        // `
        return htmlString

    }, `<div class="dropdown-item" id="all">All</div>`)
    
    return `
    <nav class="navbar navbar-dark bg-dark">
        <div class="container">
            <button id="btnGroupDrop1" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Cameras
            </button>
            <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
            ${htmlCameraString}
            </div>   
        </div>
    </nav>`
}

const RoverPhotos = async (rover) => {
    // console.log(rover.toJS())
    const photos = await fetchData('/photos', {
        "rover_name": rover.get('name'), 
        "sol": 1000, 
        "camera": rover.get('camera') || 'all',
        "page": rover.get('page')
    })

    const htmlPhotoString = photos.reduce((htmlString, currentPhoto) => {
                
                
                htmlString += `
                <div class="col mb-3">
                    <div class="card h-100">
                        <div class="card-img-frame">
                            <img src="${currentPhoto.img_src}" class="card-img-top" alt="...">
                        </div>
                
                        
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
                    <div class="row row-cols-1 row-cols-md-4">
                    ${htmlPhotoString}                
                    </div>
                </div>
            </div>
            `
}


// Backend API Calls
const fetchData = async (url, body) => {
    // console.log("body: ", body)
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
       return response.json()
    }
}