import React, { useEffect, useState } from 'react';
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

const Favorites = () => {
  const axiosPrivate = useAxiosPrivate();
  const [contents, setContents] = useState([]);
  const [likedContents, setLikedContents] = useState([]);
  const [favoritedContents, setFavoritedContents] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const favoritedResponse = await axiosPrivate.get('/contents/favorited');
        setContents(favoritedResponse.data.contents);
        const favoritedIds = favoritedResponse.data.contents.map(content => content.Id);
        setFavoritedContents(favoritedIds);

        const likedResponse = await axiosPrivate.get('/contents/liked');
        const likedIds = likedResponse.data.contents.map(content => content.Id);
        setLikedContents(likedIds);
      } catch (error) {
        console.error('There was an error fetching the contents!', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, [axiosPrivate]);

  const handleLike = (Id) => {
    const isLiked = likedContents.includes(Id);
  
    // Update likeCount and likedContents in state
    setLikedContents(prevLikedContents => {
      if (isLiked) {
        return prevLikedContents.filter(contentId => contentId !== Id);
      } else {
        return [...prevLikedContents, Id];
      }
    });
  
    setContents(prevContents => 
      prevContents.map(content =>
        content.Id === Id
          ? { ...content, likeCount: content.likeCount + (isLiked ? -1 : 1) }
          : content
      )
    );
  
    // Make the API call to toggle like status
    axiosPrivate.post('/content/' + Id + '/togglelike')
    .then(response => {
      console.log('Toggle Like Response:', response.data);
    })
    .catch(error => {
      console.error('There was an error toggling the like status!', error);
    });
  };

  const handleFavorite = (Id) => {
    const isFavorited = favoritedContents.includes(Id);
    setFavoritedContents(prevFavoritedContents => {
      if (isFavorited) {
        return prevFavoritedContents.filter(contentId => contentId !== Id);
      } else {
        return [...prevFavoritedContents, Id];
      }
    });

    axiosPrivate.post('/content/' + Id + '/togglefavorite')
    .then(response => {
      console.log('Toggle Favorite Response:', response.data);
    })
    .catch(error => {
      console.error('There was an error toggling the favorite status!', error);
    });
  };

  if (loading) {
    return <div className="loader">Loading...</div>; // Display loading indicator
  }

  return (
    <div className="page-content home">
      <ul className="content-list">
        {Array.isArray(contents) && contents.map(content => (
          <li key={content.Id} className="content-item">
            <h2>{content.title}</h2>
            <p>{content.description}</p>
            <p>{content.body}</p>
            <p>Likes: {content.likeCount}</p>
            <div className="button-container">
              <button 
                onClick={() => handleLike(content.Id)} 
                className={likedContents.includes(content.Id) ? 'liked' : ''}
              >
                <FontAwesomeIcon icon={faStar} /> {likedContents.includes(content.Id) ? 'Liked' : 'Like'}
              </button>
              <button 
                onClick={() => handleFavorite(content.Id)} 
                className={favoritedContents.includes(content.Id) ? 'favorited' : ''}
              >
                <FontAwesomeIcon icon={faHeart} /> {favoritedContents.includes(content.Id) ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
