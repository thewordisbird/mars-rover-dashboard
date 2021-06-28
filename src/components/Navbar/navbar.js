const Navbar = (rovers) => {
  /**
   * @description Creates NavBar component
   * @param rovers (immutable obj): The immutable list containing the availible rovers.
   * @returns (str): html string to be rendered.
  */
  const navLinks = rovers.reduce((htmlString, currentRover) => {
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
                     ${navLinks}
                  </ul>
              </div>
          </div>
      </nav>`;
};

export default Navbar;