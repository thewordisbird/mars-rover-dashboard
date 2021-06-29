const PhotoGallery = (photos) => {
  /**
     * @description Creates photos in photo album
     * @param photos (immutable obj): The immutable map containing the rover photos.
     * @returns (str): html string to be rendered.
    */
   const startIdx = photos.size - (photos.size % 25 === 0 ? 25 : photos.size % 25);
   return photos.reduce((htmlString, currentPhoto, idx) => {
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
}

export default PhotoGallery;