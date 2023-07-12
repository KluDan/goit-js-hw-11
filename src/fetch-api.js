import axios from 'axios';

export class PixabayApi{
    #BASE_URL = 'https://pixabay.com/api/';
    #API_KEY = '38050235-0ef1876a2782912452eb2747f';
    query = null;
    page = 1;

    async fetchPhotos() {
        try {
          const response = await axios.get(this.#BASE_URL, {
            params: {
              key: this.#API_KEY,
              q: this.query,
              image_type: 'photo',
              orientation: 'horizontal',
              safesearch: true,
              per_page: 40,
              page: this.page
            }
          });
          
          return response.data;
        } catch (error) {
          console.error(error);
        }
    }
    resetPage(){
      this.page =1;
    }
    addSimpleGallery(){
      let lightbox;
      if (lightbox) {
        lightbox.refresh();
      } else {
        lightbox = new SimpleLightbox('.gallery a', {
          captionDelay: 200,
          captionsData: 'alt',
        });
      }
    }
}
