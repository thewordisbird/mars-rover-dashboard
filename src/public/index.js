// DOM Components and event listeners -----------------------------------
const root = document.getElementById('root')

// Event delegation for click event in root div
root.addEventListener('click', async event => {
    // Trigger photo query and render for camera filter
    if (event.target.className.includes('camera-filter-item') ) {
        const state = getState()
        
        const prevFilter = state.getIn(['rover', 'photos', 'camera']) || 'all'
        const prevFilterElement = document.getElementById(prevFilter)
        prevFilterElement.classList.remove('active')
        
        const currentFilterItem = event.target
        currentFilterItem.classList.add('active')
        
        // get data to update newState
        const camera = event.target.id
        const photos = await fetchData('/photos', {
            "rover_name": state.getIn(['rover', 'data', 'name']), 
            "sol": state.getIn(['rover', 'data', 'max_sol']),
            "page": 1,
            "camera": camera
        })

        console.log('photo count', photos.length)
        // Update state camera field
        const newState = updateState(state, ['rover', 'photos'], {
            photos: photos,
            camera: camera,
            nextPage: photos.length == 25 ? 2: null
        })
        
        // render photos
        renderPhotos(true, newState)
        
    } else if (event.target.className === 'rover-link') {
        window.location.hash = `${event.target.id}`
    } else if (event.target.classList.contains('view-images')) {
        window.location.hash = `${event.target.value}`
    }
})

window.addEventListener('scroll', async event =>{
    const pageBottom = document.body.scrollHeight - window.innerHeight;
    if (document.body.scrollTop == pageBottom || document.documentElement.scrollTop == pageBottom) {
        
        const state = getState();

        if (state.getIn(['rover', 'photos', 'nextPage'])) {
            const photos = await fetchData('/photos', {
                "rover_name": state.getIn(['rover', 'data', 'name']), 
                "sol": state.getIn(['rover', 'data', 'max_sol']),
                "page": state.getIn(['rover', 'photos', 'nextPage']),
                "camera": state.getIn(['rover', 'photos', 'camera'])
            })
    
            const photosData = {
                photos: photos,
                nextPage: photos.length == 25 ? state.getIn(['rover', 'photos', 'nextPage']) + 1 : null
            }
            const newState = updateState2(state, ['rover', 'photos'], photosData)
            renderPhotos(false, newState)

        }
        
    }
   
})

// Routing and navigation -----------------------------------------------
let routes

const updateRoverRoutes = (state, rootDiv) => {
    // creates a route for each rover.
    const rovers = state.get('rovers')
    return rovers.reduce((acc, current) => {
        acc[`#${current.toLowerCase()}`] = renderRover(rootDiv, current)
        return acc
    }, {"#": renderHome(rootDiv)})
}

const setRoutes = (state, rootDiv) => {
    routes = Immutable.fromJS(updateRoverRoutes(state, rootDiv))
}


// Local state storage --------------------------------------------------
let store 

const freshState =() => {
    return Immutable.Map({
        "rovers": Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
    })
}

const renewState = () => {
    store = freshState()
    return store
}

const getState = () => {
    return store
}

const updateState2 = (state, path, data) => {
   
    const newState = state.updateIn(path, val => {
        const newVal = val.set('nextPage', data.nextPage)
        return newVal.update('photos', val => val.push(...Immutable.fromJS(data.photos)))
    })
    store = newState
    return newState
}

const updateState = (state, path, data) => {
    // On every update, update the global store variable
    const newState = state.setIn(path, Immutable.fromJS(data))
    store = newState;
    return newState
}

// Render functions -----------------------------------------------------
const renderRover = (htmlDiv, rover) => {
    return async (state) => {
        // Update the state with the chosen rover 
        const manifestData = await fetchData('/manifest', {rover_name: rover})
        const photos = await fetchData('/photos', {
            "rover_name": rover, 
            "sol": manifestData.rover.max_sol, 
            "camera": 'all',
            "page": 1
        })

        const photosData = {
            camera: 'all',
            photos: photos,
            nextPage: 2
        }
        const newState = updateState(
            state, 
            ['rover'], 
            {
                data: manifestData['rover'],
                photos: photosData
            }
        )
        return await App(newState)      
    }
}

const renderHome = (htmlDiv) => {
    return async (state) => {
        return await App(state)
    }    
}

const renderPhotos = (fromScratch, state) => {
    console.log("State pre renderPhotos: ", state.toJS())
    const element = document.getElementById('rover-photos-album')
    if (fromScratch) {
        element.innerHTML  = RoverPhotos(state.getIn(['rover', 'photos', 'photos']))
    } else {
        element.innerHTML += RoverPhotos(state.getIn(['rover', 'photos', 'photos']))
    }
}

const render = async (state, route, htmlDiv) => {
    if (routes.has(route)) {
        htmlDiv.innerHTML = await routes.get(route)(state)
    } else if (route) {
        htmlDiv.innerHTML = `404: ${route} is not a vailid Page`
    } else {
        htmlDiv.innerHTML = await renderHome(root)(state)
    }
}


// Component Compiler ---------------------------------------------------
const App = async (state) => {
    console.log('App state: ', state.toJS())
    const rovers = state.get('rovers')
    const rover = state.getIn(['rover', 'data'])
    const roverCams = state.getIn(['rover', 'data', 'cameras'])
    const camera = state.getIn(['rover', 'photos', 'camera']) || 'all'
    const photos = state.getIn(['rover', 'photos', 'photos'])

    const navBar = NavBar(rovers)
    const Jumbo = rover ? RoverJumbo(rover): HomeJumbo(rovers)
    const photoFilter = roverCams ? PhotoFilter(roverCams, camera): "" 
    const roverPhotos = rover ? RoverPhotosAlbum(photos): ""
    return `
        <header>
            <section id="nav-bar">${navBar}</section>
            <section id="rover-jumbo">${Jumbo}</section>
            <section id="camera-filter">${photoFilter}</section>
        </header>
        <main>
            <section id="rover-photos">${roverPhotos}</section>
        </main>
        <footer></footer>
    `
}


// Listen for load and hashchange events to trigger appropriate routing--
window.addEventListener('load', () => {
    const state = renewState()
    setRoutes(state, root)
    render(state, window.location.hash, root)
})

window.addEventListener('hashchange', () => {
    const state = renewState()
    setRoutes(state, root)
    render(state, window.location.hash, root)
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
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">Mars Rovers</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
            </button>        
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ml-auto">
                ${htmlNavItemString}
            </ul>
            </div>
        </div>
    </nav>`
}

const HomeJumbo = (rovers) => {
    const roverInfo = rovers.reduce((htmlString, currentRover) => {
        return htmlString += `
        <div class="col-md-4">
            <div class="home-rover-grid-item card">
                <img src="/assets/images/${currentRover}.jpg" class="card-img-top" alt="${currentRover}">
                <div class="card-body">
                <h5 class="card-title">${currentRover}</h5>
                <button class="btn btn-secondary view-images" value="${currentRover.toLowerCase()}">View Images »</button>
                </div>
            </div>
        </div>

        `
    }, "")

    return `
        <div class="jumbotron text-center">
            <div class="container">
                <h1>Mars Rover Photo Dashboard</h1>
                <p>live status and photos for the rovers exploring the red planet</p>      
            </div>   
        </div>   
        <div class="container home-rover-grid">
            <div class="row">
                ${roverInfo}
            </div>
        </div>
    `    
}

const RoverJumbo = (rover) => {
    return `
        <div class="jumbotron text-center">
            <div class="container">
                <h1>${rover.get('name')}</h1>
                <p>Launched: ${rover.get('launch_date')} | Landed: ${rover.get('landing_date')} | Status: ${rover.get('status')}<br>Max Date: ${rover.get('max_date')} | Max Sol: ${rover.get('max_sol')} | Total Photos: ${rover.get('total_photos')}</p>                   
            </div>         
        </div>    
    `     
}

const PhotoFilter = (roverCameras) => {    
    const htmlCameraString = roverCameras.reduce((htmlString, currentCamera) => {
        htmlString += `<div class="dropdown-item camera-filter-item" id="${currentCamera.get('abbr')}">${currentCamera.get('name')}</div>`
        return htmlString
    }, `<div class="dropdown-item camera-filter-item active"} " id="all">All</div>`)
    
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
            <a class="nav-link dropdown-toggle" href="#" id="filterDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Cameras
            </a>
            <div class="dropdown-menu" aria-labelledby="filterDropdown">
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

const RoverPhotosAlbum = (photos) => {  
    return `
    <div class="album">
        <div class="container">
            <div class="row row-cols-1 row-cols-md-4" id="rover-photos-album">
            ${RoverPhotos(photos)}                
            </div>
        </div>
    </div>
    `
}

const RoverPhotos = (photos) => {
    // console.log('roverphotos: ', photos.toJS())
    const startIdx = photos.size - (photos.size % 25 == 0 ? 25 : photos.size % 25);
    console.log(startIdx)
    const htmlPhotoString = photos.reduce((htmlString, currentPhoto, idx) => {
        if (idx >= startIdx) {
            //console.log(currentPhoto.toJS())
            console.log()
            htmlString += `
                <div class="col mb-3">
                    <div class="card h-100">
                        <div class="card-img-frame">
                            <img src="${currentPhoto.get('img_src')}" class="card-img-top" alt="...">
                        </div>
                
                        
                        <div class="card-body">
                            <ul>
                                <li>Camera: ${currentPhoto.getIn(['camera', 'full_name'])}</li>
                                <li>Sol: ${currentPhoto.get('sol')}</li>
                                <li>Earth Date: ${currentPhoto.get('earth_date')}
                            </ul>
                        </div>
                    </div>
                </div>`
            return htmlString 
        }else {
            return ''
        }
        
    }, "")
    // console.log(htmlPhotoString)
    return htmlPhotoString

}


// Express API Calls ----------------------------------------------------
const fetchData = async (url, body) => {
    
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