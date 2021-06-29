// Take endpoint, and endpoint render function
// return htmlstring

import fetchRoverData from "./fetchRoverData"

const navigateRover = ((endpoint, renderFn) => {
  const state = {}
    console.log("[fetchData]")
    const promise = fetchRoverData('/manifest', {rover_name: rover})
      .then((manifest) => {
        state.manifest = manifest;
        console.log("[Rover, fetchRoverData, manifest]", manifest);
        return fetchRoverData('/photos', {
          rover_name: rover,
          sol: state.manifest.max_sol,
          camera: 'all',
          page: 1
        })
      })
      .then((photos) => {
        const photosData = {
          camera: "all",
          photos: photos,
          nextPage: 2
        }
        state.photos = photosData
        console.log("[Rover, fetchRoverData, photosData]", photosData);
      })
      
    Promise.allSettled(promise).then(() => renderFn(state))
})

export default navigateRover