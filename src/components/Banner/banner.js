const Banner = (bannerData) => {
  /**
   * @description Creates Banner component
   * @param BannerComponent (function): Function to build the sub components of the banner.
   * @param data (Immutable Object): Data to be applied to the component.
   * @returns (str): html string to be rendered.
  */
  return  `
      <div class="jumbotron text-center">
          <div class="container">
              ${bannerData}     
          </div>   
      </div> 
  `;
};

export default Banner;