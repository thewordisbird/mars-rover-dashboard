// DOM Components and event listeners -----------------------------------
const root = document.getElementById('root')
console.log(root)
// Event delegation for click event in root div
root.addEventListener('click', event => {
    // Trigger photo query and render for camera filter
    if (event.target.className.includes('camera-filter-item') ) {
        const state = getState()
        
        const prevFilter = state.getIn(['rover', 'camera']) || 'all'
        const prevFilterElement = document.getElementById(prevFilter)
        prevFilterElement.classList.remove('active')
        
        const currentFilterItem = event.target
        currentFilterItem.classList.add('active')
        
        // Update state camera field
        const newState = updateState(getState(), ['rover', 'camera'], event.target.id)
        // render photos
        renderPhotos(newState)
        
    } else if (event.target.className === 'rover-link') {
        window.location.hash = `${event.target.id}`
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

const updateState = (state, path, data) => {
    // On every update, update the global store variable
    console.log(path,data)
    const newState = state.setIn(path, Immutable.fromJS(data))
    store = newState;
    return newState
}


// Render functions --------------------------------------------------
const renderRover = (htmlDiv, rover) => {
    return async (state) => {
        // Update the state with the chosen rover 
        console.log('updating state')
        const data = await fetchData('/manifest', {rover_name: rover})
        const newState = updateState(
            state, 
            ['rover'], 
            data['rover']
        )
        return await App(newState)      
    }
}

const renderHome = (htmlDiv) => {
    return async (state) => {
        return await App(state)
    }    
}

const renderPhotos = async (state) => {
    const element = document.getElementById('rover-photos')
    element.innerHTML = await RoverPhotos(state.get('rover'))
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
    
    const rovers = state.get('rovers')
    const rover = state.get('rover')
    const roverCams = state.getIn(['rover', 'cameras'])
    const camera = state.getIn['rover', 'camera'] || 'all'

    const navBar = NavBar(rovers)
    const Jumbo = rover ? RoverJumbo(rover): HomeJumbo(rovers)
    const photoFilter = roverCams ? PhotoFilter(roverCams, camera): "" 
    const roverPhotos = rover ? await RoverPhotos(rover): ""
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
    const roverLinks = rovers.reduce((htmlString, current, idx, arr) => {
        console.log(arr.size)
        if (idx == arr.size -1){
            return htmlString += `<span class="rover-link" id="${current.toLowerCase()}">${current}</span>`
        }
        return htmlString += `<span class="rover-link" id="${current.toLowerCase()}">${current}</span> | `
    }, "")

    return `
        <div class="jumbotron text-center">
            <div class="container">
                <h1>Mars Rover Photo Dashboard</h1>
                <hr>
                <p>${roverLinks}</p>                   

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
    console.log(body)
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