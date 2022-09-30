import React, { useState, useEffect } from 'react';
import Searchbar from './Searchbar';
import imagesApi from '../services/imagesApi';
import ImageGallery from './ImageGallery';
import Button from './Button';
import './App.css';
import Modal from './Modal';
import Loader from './Loader';
import { animateScroll as scroll } from 'react-scroll';

function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [limit, setLimit] = useState(12);
  const [openButton, setOpenButton] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [largeImageURL, setLargeImageUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imgTags, setImgTags] = useState('');

  useEffect(() => {
    if (!query) {
      return;
    }
    setStatus('pending');
    setOpenButton(false);

    imagesApi
      .fetchImages(query, limit, page)
      .then(images => {
        if (!images.hits.length) {
          setStatus('rejected');
          setOpenButton(false);
          setLoading(false);
          return;
        }

        setImages(prevState => [...prevState, ...images.hits]);
        setOpenButton(true);
        setStatus('resolved');
        setLoading(false);
        setTotalHits(images.totalHits);
        scrollWindow();
        return;
      })
      .catch(error => {
        setError(error);
        setStatus('error');
      });
  }, [query, page, limit]);

  const scrollWindow = () => {
    scroll.scrollToBottom({
      offset: 0,
      smooth: true,
    });
  };

  const toggleModal = () => {
    setShowModal(prevState => !prevState);
  };

  const handleOpenModal = (largeImageURL = '', imgTags = '') => {
    setLargeImageUrl(largeImageURL);
    setImgTags(imgTags);
    toggleModal();
  };

  const onChangeQuery = query => {
    setQuery(query);
    setPage(1);
    setError(null);
  };

  const loadMore = () => {
    setLoading(true);
    setPage(prevState => prevState + 1);
  };

  return (
    <div className="App">
      <Searchbar onSubmit={onChangeQuery} />
      {status === 'pending' && <Loader />}
      {status === 'idle' && <h1>введите имя картинки в поле поиска</h1>}
      {status === 'rejected' && (
        <h1>изображения с названием "{query}" отсутсвуют</h1>
      )}
      {status === 'error' && <h1>{error.message}</h1>}
      {images && <ImageGallery images={images} onClick={handleOpenModal} />}
      {showModal && (
        <Modal showModal={handleOpenModal}>
          <img src={largeImageURL} alt={imgTags} />
        </Modal>
      )}
      {loading && <Loader />}
      {openButton && !loading && images.length !== totalHits && (
        <Button onClick={loadMore} />
      )}
    </div>
  );
}

export default App;
