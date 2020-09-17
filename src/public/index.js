// DOM Components and event listeners -----------------------------------
const root = document.getElementById('root')

// Event delegation for click event in root div
root.addEventListener('click', event => {
    // Trigger photo query and render for camera filter
    if (event.target.className === 'dropdown-item') {
        // Update state camera field
        console.log("Before Cam update: ", store.toJS())
        updateRoverCam(store, event.target.id)
        console.log("After Cam update: ", store.toJS())
        // render photos
        renderPhotos(getState())
    }
})

// Local state storage --------------------------------------------------
let store = Immutable.Map({
    "rovers": Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    "rover": Immutable.Map({
        "name": 'Curiosity',
        "cameras": Immutable.List([]),
        "camera": 'all',
        "page": 1
    })
})


// State access and modification-----------------------------------------
// State API Calls (getRovers, getRover, setRover, getPhotos) -----------
//TODO: Refactor for generalized crud using access path array
const getState = () => {
    // Only method to access global store varable
    return store
}

const getRovers = (state) => {
    return state.get('rovers')
}

const getRover = (state) => {
    // Check for rover in store. Eventually this should be a routed path and
    // validated by the url
    if (state.hasIn(['rover'])) {
        return state.get('rover')
    }
    // TODO: Error if rover not set20
    console.log('No rover selected!')
}

const getRoverCams = (state) => {
    return state.getIn(['rover', 'cameras'])
}

const updateRover = (state, roverInfo) => {
    store = state.merge(roverInfo)
    }
    
const updateRoverCam = (state, roverCam) => {
    store = state.updateIn(['rover', 'camera'], val => roverCam)
}


// Render html in element -----------------------------------------------
const renderRover = (htmlDiv, rover) => {
    return async (state) => {
        const data = await fetchData('/manifest', {rover_name: rover})

        updateRover(state, data)

        const pageHTML = await App(getState());
        return pageHTML

    }
}

const renderHome = (htmlDiv) => {
    return (sate) => {
        return "<h1>Home sweet home!</h1>"
    }
    
}

const render = async (htmlDiv, hashURL, state) => {
    console.log('Step 2. Render Route');
    const pageHTML = routes.has(hashURL) ? await routes.get(hashURL)(state) : `404: Page ${hashURL} not found` 

    htmlDiv.innerHTML = pageHTML
    
}

const renderPhotos = async (state) => {
    const element = document.getElementById('rover-photos')
    element.innerHTML = await RoverPhotos(getRover(state))
}


// Component Compiler ---------------------------------------------------
const App = async (state) => {
    // Make API Calls to update store
    
    const navBar = NavBar(getRovers(state))
    const roverJumbo = RoverJumbo(getRover(state))
    const photoFilter = PhotoFilter(getRoverCams(state))
    const roverPhotos = await RoverPhotos(getRover(state))
    return `
    <header>
        <section id="nav-bar">${navBar}</section>
        <section id="rover-jumbo">${roverJumbo}</section>
        <section id="camera-filter">${photoFilter}</section>
    </header>
    <main>
        <section id="rover-photos">${roverPhotos}</section>
    </main>
    <footer></footer>
    `

}

// Routing and navigation -----------------------------------------------
const updateRoverRoutes = (root) => {
    console.log('in update rover routes')
    // creates a route for each rover.
    const rovers = getRovers(getState())
    return rovers.reduce((acc, current) => {
        acc[`#${current.toLowerCase()}`] = renderRover(root, current)
        return acc
    }, {"/": renderHome(root), "#test": renderHome(root) })
}

const routes = Immutable.fromJS(updateRoverRoutes(root))

const onNavigate = (pathName) => {
    window.history.pushState(
        {},
        pathName,
        window.location.origin + pathName
    )
    routes[pathName]
}



// Listen for load and hashchange events to trigger appropriate routing--
window.addEventListener('load', () => {
    console.log('Step 1a. On Load Trigger');
    const hashURL = window.location.hash;
    render(root, hashURL, store)
    
})

window.addEventListener('hashchange', () => {
    console.log('Step 1b. On Hashchange Trigger');
    const hashURL = window.location.hash;

    render(root, hashURL, store)

})


// Components -----------------------------------------------------------
const NavBar = (rovers) => {
    const htmlNavItemString = rovers.reduce((htmlString, currentRover) => {
        htmlString += `
        <li class="nav-item">
            <a class="nav-link" href="#${currentRover.toLowerCase()}">${currentRover}<span class="sr-only">(current)</span></a>
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


const RoverJumbo = (rover) => {
    console.log(rover.toJS())
    return `
        <div class="jumbotron text-center">
            <div class="container">
                <h1>${rover.get('name')}</h1>
                <p>Launched: ${rover.get('launch_date')} | Landed: ${rover.get('landing_date')} | Status: ${rover.get('status')}<br>Max Date: ${rover.get('max_date')} | Max Sol: ${rover.get('max_sol')} | Total Photos: ${rover.get('total_photos')}</p>                   
            </div>         
        </div>    
    `     
    // return `
    //     <div class="jumbotron text-center">
    //         <div class="container">
    //             <h1>${store.getIn(['rover', 'name'])}</h1>
    //             <p>Launched: ${store.getIn(['rover', 'launch_date'])} | Landed: ${store.getIn(['rover', 'landing_date'])} | Status: ${store.getIn(['rover', 'satus'])} | Total Photos: ${store.getIn(['rover', 'total_photos'])}</p>                   
    //         </div>         
    //     </div>    
    // `     
    }

const PhotoFilter = (roverCameras) => {    
    const htmlCameraString = roverCameras.reduce((htmlString, currentCamera) => {
        htmlString += `<div class="dropdown-item" id="${currentCamera.get('abbr')}">${currentCamera.get('name')}</div>`
        return htmlString

    }, `<div class="dropdown-item" id="all">All</div>`)
    
    // TODO: Add date selector
    return `
    <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
    <div class="container">
        <div class="navbar-brand">Filters</div>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
        </button>
    
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
        
        <ul class="navbar-nav mr-auto">
            
            <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Cameras
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                ${htmlCameraString}
            </div>
            
        </ul>
            <!-- Form for future version with sol filter
            <input class="form-control mr-sm-2" type="search" placeholder="Sol" aria-label="Search">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            -->
        </div>
    </div>
  </nav>`
}

const RoverPhotos = async (rover) => {
    // console.log(rover.toJS())
    const photos = await fetchData('/photos', {
        "rover_name": rover.get('name'), 
        "sol": rover.get('max_sol'), 
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


// Express API Calls ----------------------------------------------------
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