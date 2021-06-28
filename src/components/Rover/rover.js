import fetchRoverData from "../../utils/fetchRoverData";

const Rover = (rover) => {
  const state = {};

  async function fetchData() {
    const manifest = await fetchRoverData('/manifest', {rover_name: rover});
    state.manifest = manifest;
    console.log("[Rover, fetchRoverData, manifest]", manifest);

    const photos = await fetchRoverData('/photos', {
      rover_name: rover,
      sol: manifestData.max_sol,
      camera: 'all',
      page: 1
    });

  const photosData = {
      camera: 'all',
      photos: photos,
      nextPage: 2
  };

  state.photos = photosData

  console.log("[Rover, fetchRoverData, manifest]", photosData);
  }

  fetchData();


};

export default Rover;