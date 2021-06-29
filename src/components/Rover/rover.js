import fetchRoverData from "../../utils/fetchRoverData";
import PhotoGallery from "./photoGallery";

const Rover = (rover) => {
  console.log("[Rover, rover]", rover)
  const state = {};

  (function fetchData() {
    console.log("[fetchData]")
    fetchRoverData('/manifest', {rover_name: rover})
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

      const status = Promise.all();
  console.log("Promise status", status)
      
  })();

  const status = Promise.allSettled();
  console.log("Promise status", status)

  const content = state.photos ? PhotoGallery(state.photos) : "<h1>Waiting for photos</h1>"

  return `
    ${content}
  `

 
 
  


};

export default Rover;