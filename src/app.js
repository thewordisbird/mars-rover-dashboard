
import Home from "./components/Home/home";
import Rover from './components/Rover/rover';
const rovers = ['Curiosity', 'Opportunity', 'Spirit'];

const App = () => {
  /**
   * @description Compiles components for view.
   * @param state (immutable obj): The state of the application.
   * @returns (str) - html string to be rendered.
  */
  // const rovers = getRovers();
  // const rover = getRover();
  const rover = null
  // const roverCams = getRoverCams();
  // const camera = getCam();
  // const photos = getPhotos();
  // const photos = null;
  // const navBar = Navbar();
  // const banner = rover ? Banner(RoverBanner, rover): Banner(HomeBanner);
  // const filterBar = roverCams ? FilterBar(roverCams, camera): '';
  // console.log("[App, photos]", photos);
  // const main = photos ? Main(RoverPhotosAlbum, photos): Main(ChooseRover, rovers);
  
  // Use ternery for logic to determine "route"
  const content = rover ? Rover(rover) : Home(rovers);

  return content;
};

export default App;
