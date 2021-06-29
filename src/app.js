
import Home from "./components/Home/home";
import Rover from './components/Rover/rover';
const rovers = ['Curiosity', 'Opportunity', 'Spirit'];

const App = () => {
  /**
   * @description Compiles components for view.
   * @param state (immutable obj): The state of the application.
   * @returns (str) - html string to be rendered.
  */
  const state = {}

  const setRover = (rover) => {
    console.log("Setting Rover", rover)
    state.rover = rover
  }

  // const rover = "curiosity"
  const rover = null
  
  // Use ternery for logic to determine "route"
  const content = rover ? Rover(rover) : Home(rovers, setRover);

  return content;
};

export default App;
