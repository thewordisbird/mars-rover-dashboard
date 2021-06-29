import Navbar from '../Navbar/navbar';
import Banner from '../Banner/banner';
import images from '../../../public/images/*.jpg';



const ChooseRover = (rovers) => {
  /**
   * @description Component displaying choice of rover to view dashboard.
   * @param rovers (Immutable Array): Rover options
   * @returns (str): html string to be rendered.
  */
  console.log(images)

  
  const roverInfo = rovers.reduce((htmlString, currentRover) => {
      const  imgSrc = require(`../../../public/images/curiosity.jpg`)
     
      return  htmlString += `
          <div class="choose-rover col-md-4">
              <div class="home-rover-grid-item card">
                  <img src="${images[currentRover.toLowerCase()]}" class="card-img-top" alt="${currentRover}">
                  <div class="card-body">
                      <h5 class="card-title">${currentRover}</h5>
                      <button onclick="() => handleClick(${currentRover})" class="btn btn-secondary rover-link-landing" value="${currentRover.toLowerCase()}">View Images »</button>
                  </div>
              </div>
          </div>
      `;
  }, '');

  return `
      <div class="container">
        <div class="home-rover-grid">
            <div class="row">
                ${roverInfo}
            </div>
        </div>
      </div>
    `;
};

const Home = (rovers) => {
  const bannerContent = `
    <h1>Mars Rover Photo Dashboard</h1>
    <p>live status and photos for the rovers exploring the red planet</p> 
  `;

  const homeBanner = Banner(bannerContent)
  const homeContent =  ChooseRover(rovers)

  return `
    <header>
      <section id="nav-bar">${Navbar(rovers)}</section>
      <section id="banner">${homeBanner}</section>
    </header>
    <main>
      <section>${homeContent}</section>
    </main>
    <footer></footer>
  `
};


export default Home;
