import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import {PixabayApi} from './fetch-api'

const searchForm = document.querySelector('.search-form');
const inputEl = searchForm.firstElementChild;
const loader = document.querySelector('.loader');
const galleryListEl = document.querySelector('.gallery');
const goTopBtn = document.querySelector('.go-top');

const newApiService = new PixabayApi();
 
let infinitObserver = new IntersectionObserver(
  async ([entry], observer) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      onLoadMore();
    }
  }
)

function infinitScroll(){
  const lastCard = document.querySelector('.card:last-child');

  if (lastCard) {
    infinitObserver.observe(lastCard);
  }
}

searchForm.addEventListener('submit', onSearch);

async function onSearch(e){
    e.preventDefault();

    clearArticlesContainer();
    const searchQuery = inputEl.value.trim();
    if(!searchQuery){
      return
    }
    newApiService.query = searchQuery;
    newApiService.resetPage(); 
    try {
      const articles = await newApiService.fetchPhotos();

      if(!articles.hits.length){
        Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        console.log('Photos not found!')
        return
      }
      Notify.success(`Hooray! We found ${articles.totalHits} images.`)
      createGallery(articles);
      if(articles.totalHits<=40){
        return;
      }
      infinitScroll();
      loader.classList.remove('is-hidden');
    } catch (err) {
      console.log(err);
    }
}

async function onLoadMore(){
  newApiService.page++;
  
  try {
    const articles = await newApiService.fetchPhotos();

    if (newApiService.page >= articles.totalHits / 40) {
      loader.classList.add('is-hidden');
      Notify.failure("We're sorry, but you've reached the end of search results.");
      return;
    }

    createGallery(articles);
    infinitScroll();

  } catch (err) {
    console.log(err.message);
  }
} 

function createGallery (articles) {
  const listItem = articles.hits.map(createPhotoInfo).join("");
  galleryListEl.insertAdjacentHTML("beforeend", listItem);
  newApiService.addSimpleGallery();
}

function createPhotoInfo({largeImageURL, webformatURL, tags, likes, views, comments, downloads}) {
    
    return `
    <a class="card" href="${largeImageURL}">
    <div class="photo-card">
    <div class="photo">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </div>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
  </div></a>
  `;
}

function clearArticlesContainer() {
  galleryListEl.innerHTML = '';
  loader.classList.add('is-hidden');
}

goTopBtn.addEventListener('click', goTop);
window.addEventListener('scroll', trackScroll);

function trackScroll() {
  const offset = window.pageYOffset;
  const coords = document.documentElement.clientHeight;
  if (offset > coords) {
    goTopBtn.classList.add('go-top__active');
  } else {
      goTopBtn.classList.remove('go-top__active');
  }
}

function goTop() {
  if (window.pageYOffset > 0) {
    window.scrollBy(0, -75);
    setTimeout(goTop, 0);
  }
}
