// DOM Components and event listeners -----------------------------------
const root = document.getElementById('root');

// Event delegation for click event in root div
root.addEventListener('click', async event => {
    /**
     * @description Click even delegation for dynamically generated elements
     * <br>in the roor div.
     * @param event (obj): The event object generated by the click.
    */
    if (event.target.className.includes('camera-filter-item') ) {
        // Render photos for the rover taken using the selected camera
        const state = getState();
        
        const prevFilter = state.getIn(['rover', 'photos', 'camera']) || 'all';
        const prevFilterElement = document.getElementById(prevFilter);
        prevFilterElement.classList.remove('active');
        
        const currentFilterItem = event.target;
        currentFilterItem.classList.add('active');
        
        const camera = event.target.id;

        const photos = await fetchData('/photos', {
            rover_name: state.getIn(['rover', 'data', 'name']),
            sol: state.getIn(['rover', 'data', 'max_sol']),
            page: 1,
            camera: camera
        });

        // Update state with the selected camera and photos taken from that camera
        const newState = setState(state, ['rover', 'photos'], {
            photos: photos,
            camera: camera,
            nextPage: photos.length == 25 ? 2: null
        });
        
        // Render photos
        renderPhotos(true, newState);
        
    } else if (event.target.classList.contains('rover-link-landing')) {
        // Navigate to the selected route from the landing page
        window.location.hash = event.target.value;
    }
});

window.addEventListener('scroll', async () => {
    /**
     * @description Query next page of photos for the current app state when the
     * <br>user scrolls to the bottom of the page.
    */
    const pageBottom = document.body.scrollHeight - window.innerHeight;
    if (document.body.scrollTop == pageBottom || document.documentElement.scrollTop == pageBottom) {
        const state = getState();

        if (state.getIn(['rover', 'photos', 'nextPage'])) {
            // If the nextPage value is valid query backend for photos
            const photos = await fetchData('/photos', {
                rover_name: state.getIn(['rover', 'data', 'name']),
                sol: state.getIn(['rover', 'data', 'max_sol']),
                page: state.getIn(['rover', 'photos', 'nextPage']),
                camera: state.getIn(['rover', 'photos', 'camera'])
            });
            
            // Create update object to update state
            const photosData = {
                photos: photos,
                nextPage: photos.length == 25 ? state.getIn(['rover', 'photos', 'nextPage']) + 1 : null
            };

            // Update state
            const newState = updateState(state, ['rover', 'photos'], photosData);

            // Render Photos
            renderPhotos(false, newState);
        }
    }
});


// Routing and navigation -----------------------------------------------
let routes;

const updateRoverRoutes = (state, rootDiv) => {
    /**
     * @description Create routes for all rovers to be use in routing.
     * @param state (immutable obj) - state of the application.
     * @param rootDiv (obj) - html element to modify.
     * @returns (obj) - Object with keys: relative route path and values: route render function
    */
    const rovers = state.get('rovers');
    return rovers.reduce((acc, current) => {
        acc[`#${current.toLowerCase()}`] = renderRover(current);
        return acc;
    }, {"#": renderHome(rootDiv)});
};

const setRoutes = (state, rootDiv) => {
    /**
     * @description Builds the root object.
     * @param (immutable obj) state - State of application.
     * @param (obj) - html element to modify.
    */
    routes = Immutable.fromJS(updateRoverRoutes(state, rootDiv));
};


// Local state storage --------------------------------------------------
let store;

const freshState =() => {
    /**
     * @description The innitial state of the application with only the rover names.
     * @returns (immutable obj) - Fresh state.
    */
    return Immutable.Map({
        rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit'])
    });
};

const renewState = () => {
    /**
     * @description Reset the state of the application to its innitial state
     * @returns (immutable obj) - Application state.
    */
    store = freshState();
    return store;
};

const getState = () => {
    /**
     * @description Get the state of the application
     * @returns (immutable obj) - Application state.
    */
    return store;
};

const setState = (state, path, data) => {
    /**
     * @description Set data in the application store.
     * @param (immutable obj) state - The current state of the application.
     * @param (array) path - Path to the key to be set.
     * @data (obj) data - The data to be set at the path.
     * @returns (immutable obj) - Application state.
    */
    const newState = state.setIn(path, Immutable.fromJS(data));
    store = newState;
    return newState;
};

const updateState = (state, path, data) => {
    /**
     * @description Update data in the application store. This only pushes data to a list
     * <br>as it is the only update required in the app.
     * @param (immutable obj) state - The current state of the application.
     * @param (array) path - Path to the key to be update.
     * @data (obj) data - The data to be updated at the path.
     * @returns (immutable obj) - Application state.
    */
    const newState = state.updateIn(path, val => {
        const newVal = val.set('nextPage', data.nextPage);
        return newVal.update('photos', val => val.push(...Immutable.fromJS(data.photos)));
    });
    store = newState;
    return newState;
};


// Render functions -----------------------------------------------------
const renderRover = (rover) => {
    /**
     * @description Closure function to render the rover view for a rover at a given state.
     * @param (str) rover - The name of the rover to be rendered.
     * @returns (function) - Function that will render the rover html string for the
     * <br>given state.
    */
    return async (state) => {
        /**
         * @description Render html string for a given state
         * @param (immutable obj) state - The state of the application.
         * @returns (str) - html string for the view of the rover at the given state.
        */
        const manifestData = await fetchData('/manifest', {rover_name: rover});
        const photos = await fetchData('/photos', {
            rover_name: rover,
            sol: manifestData.rover.max_sol,
            camera: 'all',
            page: 1
        });

        const photosData = {
            camera: 'all',
            photos: photos,
            nextPage: 2
        };

        const newState = setState(
            state,
            ['rover'],
            {
                data: manifestData['rover'],
                photos: photosData
            }
        );
        return await App(newState);
    };
};

const renderHome = () => {
    /**
     * @description Function to render the home view for a rover at a given state.
     * @returns (function) - Function that will render the home html string
    */
    return async (state) => {
        return await App(state);
    };
};

const renderPhotos = (fromScratch, state) => {
    /**
     * @description Updates the rover-photo-album element in the DOM with rover photos.
     * @param (bool) fromScratch - Boolean indicating if the element is being appended
     * <br>or overwritten.
    */
    const element = document.getElementById('rover-photos-album');
    if (fromScratch) {
        element.innerHTML  = RoverPhotos(state.getIn(['rover', 'photos', 'photos']));
    } else {
        element.innerHTML += RoverPhotos(state.getIn(['rover', 'photos', 'photos']));
    }
};

const renderView = async (state, route, htmlDiv) => {
    /**
     * @description Updates the DOM with view based on the route.
     * @param (immutable obj) state - The state of the application.
     * @param (str) route - Route to be rendered.
     * @param (obj) - DOM element to be modified.
    */
    if (routes.has(route)) {
        htmlDiv.innerHTML = await routes.get(route)(state);
    } else if (route) {
        htmlDiv.innerHTML = `404: ${route} is not a vailid Page`;
    } else {
        htmlDiv.innerHTML = await renderHome(root)(state);
    }
};


// Component Compiler ---------------------------------------------------
const App = async (state) => {
    /**
     * @description Compiles components for view.
     * @param (immutable obj) state - The state of the application.
     * @returns (str) - html string to be rendered.
    */
    const rovers = state.get('rovers');
    const rover = state.getIn(['rover', 'data']);
    const roverCams = state.getIn(['rover', 'data', 'cameras']);
    const camera = state.getIn(['rover', 'photos', 'camera']) || 'all';
    const photos = state.getIn(['rover', 'photos', 'photos']);

    const navBar = NavBar(rovers);
    const banner = rover ? RoverJumbo(rover): Home(rovers);
    const photoFilter = roverCams ? PhotoFilter(roverCams, camera): '';
    const roverPhotos = rover ? RoverPhotosAlbum(photos): '';
    return `
        <header>
            <section id="nav-bar">${navBar}</section>
            <section id="rover-jumbo">${banner}</section>
            <section id="camera-filter">${photoFilter}</section>
        </header>
        <main>
            <section id="rover-photos">${roverPhotos}</section>
        </main>
        <footer></footer>
    `;
};


// Listen for load and hashchange events to trigger appropriate routing--
window.addEventListener('load', () => {
    const state = renewState();
    setRoutes(state, root);
    renderView(state, window.location.hash, root);
});

window.addEventListener('hashchange', () => {
    const state = renewState();
    setRoutes(state, root);
    renderView(state, window.location.hash, root);
});


// Components -----------------------------------------------------------
const NavBar = (rovers) => {
    /**
     * @description Creates NavBar component
     * @param (immutable obj) rovers - The immutable list containing the availible rovers.
     * @returns (str) - html string to be rendered.
    */
    const htmlNavItemString = rovers.reduce((htmlString, currentRover) => {
        return htmlString += `
        <li class="nav-item">
            <a class="nav-link" href="#${currentRover.toLowerCase()}">${currentRover}<span class="sr-only">(current)</span></a>
        </li>
        `;
    }, '');
   
    return `
        <nav class="navbar navbar-expand-md navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="#">Mars Rovers</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navItems" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>        
                <div class="collapse navbar-collapse" id="navItems">
                    <ul class="navbar-nav ml-auto">
                        ${htmlNavItemString}
                    </ul>
                </div>
            </div>
        </nav>`;
};

const Home = (rovers) => {
    /**
     * @description Creates Home page view
     * @param (immutable obj) rovers - The immutable list containing the availible rovers.
     * @returns (str) - html string to be rendered.
    */
    const roverInfo = rovers.reduce((htmlString, currentRover) => {
        return htmlString += `
            <div class="col-md-4">
                <div class="home-rover-grid-item card">
                    <img src="/assets/images/${currentRover}.jpg" class="card-img-top" alt="${currentRover}">
                    <div class="card-body">
                        <h5 class="card-title">${currentRover}</h5>
                        <button class="btn btn-secondary rover-link-landing" value="${currentRover.toLowerCase()}">View Images »</button>
                    </div>
                </div>
            </div>
        `;
    }, '');

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
    `;
};

const RoverJumbo = (rover) => {
    /**
     * @description Creates rover information jumbotron.
     * @param (immutable obj) rover - The immutable map containing the rover
     * @returns (str) - html string to be rendered.
    */
    return `
        <div class="jumbotron text-center">
            <div class="container">
                <h1>${rover.get('name')}</h1>
                <p class="rover-manifest-data">Launched: ${rover.get('launch_date')} | Landed: ${rover.get('landing_date')} | Status: ${rover.get('status')}<br>Max Date: ${rover.get('max_date')} | Max Sol: ${rover.get('max_sol')} | Total Photos: ${rover.get('total_photos')}</p>                   
            </div>         
        </div>    
    `;
};

const PhotoFilter = (roverCameras) => {
    /**
     * @description Creates photo filter bar.
     * @param (immutable obj) roverCameras - The immutable map containing the rover camera information.
     * @returns (str) - html string to be rendered.
    */
    const htmlCameraString = roverCameras.reduce((htmlString, currentCamera) => {
        return htmlString += `<div class="dropdown-item camera-filter-item" id="${currentCamera.get('abbr')}">${currentCamera.get('name')}</div>`;
    }, '<div class="dropdown-item camera-filter-item active" id="all">All</div>');
    return `
        <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
            <div class="container">
                <div class="navbar-brand">Filters</div>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#filterItems" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>            
                <div class="collapse navbar-collapse" id="filterItems">                
                    <ul class="navbar-nav mr-auto">                        
                        <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="filterDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Cameras</a>
                        <div class="dropdown-menu" aria-labelledby="filterDropdown">
                            ${htmlCameraString}
                        </div>                        
                    </ul>
                </div>
            </div>
        </nav>
    `;
};

const RoverPhotosAlbum = (photos) => {
    /**
     * @description Creates photo album.
     * @param (immutable obj) photos - The immutable map containing the rover photos.
     * @returns (str) - html string to be rendered.
    */
    return `
        <div class="album">
            <div class="container">
                <div class="row row-cols-1 row-cols-sm-1 row-cols-md-3 row-cols-lg-4" id="rover-photos-album">
                ${RoverPhotos(photos)}                
                </div>
            </div>
        </div>
    `;
};

const RoverPhotos = (photos) => {
    /**
     * @description Creates photos in photo album
     * @param (immutable obj) photos - The immutable map containing the rover photos.
     * @returns (str) - html string to be rendered.
    */
    const startIdx = photos.size - (photos.size % 25 == 0 ? 25 : photos.size % 25);
    const htmlPhotoString = photos.reduce((htmlString, currentPhoto, idx) => {
        if (idx >= startIdx) {
            return htmlString += `
                <div class="col mb-3">
                    <div class="card h-100">
                        <div class="card-img-frame">
                            <img src="${currentPhoto.get('img_src')}" class="card-img-top" alt="${currentPhoto.getIn(['rover', 'name'])} photo ${currentPhoto.get('id')} from ${currentPhoto.getIn(['camera', 'full_name'])}">
                        </div>               
                        <div class="card-body">
                            <ul>
                                <li>Camera: ${currentPhoto.getIn(['camera', 'full_name'])}</li>
                                <li>Sol: ${currentPhoto.get('sol')}</li>
                                <li>Earth Date: ${currentPhoto.get('earth_date')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
        return '';
    }, '');
    return htmlPhotoString;
};


// Express API Calls ----------------------------------------------------
const fetchData = async (url, body) => {
    /**
     * @description API call to express backend to query for manifest information or photo information.
     * @param (str) url - The endpoint of the api.
     * @param (obj) body - The data to be passed to the server.
     * @returns (obj) - Requested data from the server.
    */
    const response = await fetch(`http://localhost:3000${url}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        return response.json();
    }
};