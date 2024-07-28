import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faHeart } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';

Modal.setAppElement('#root');

const Home = () => {
  const [contents, setContents] = useState([]);
  const [editingContent, setEditingContent] = useState(null);
  const [creatingContent, setCreatingContent] = useState(false);
  const [formData, setFormData] = useState({ Id: '', title: '', body: '', description: '' });
  const [likedContents, setLikedContents] = useState([]);
  const [favoritedContents, setFavoritedContents] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const userid = auth.uid;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contentsResponse = await axiosPrivate.get('/contents');
        setContents(contentsResponse.data.contents);

        const likedResponse = await axiosPrivate.get('/contents/liked');
        const likedIds = likedResponse.data.contents.map(content => content.Id);
        setLikedContents(likedIds);

        const favoritedResponse = await axiosPrivate.get('/contents/favorited');
        const favoritedIds = favoritedResponse.data.contents.map(content => content.Id);
        setFavoritedContents(favoritedIds);
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

  const handleEdit = (content) => {
    setEditingContent(content.Id);
    setFormData({ Id: content.Id, title: content.title, body: content.body, description: content.description });
  };

  const handleCreate = () => {
    setCreatingContent(true);
    setFormData({ Id: '', title: '', body: '', description: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (creatingContent) {
        const response = await axiosPrivate.post('/content', formData);
        console.log('Content created:', response.data);
        setContents(prevContents => [...prevContents, response.data]);
        setCreatingContent(false);
      } else {
        const response = await axiosPrivate.put(`/content/${formData.Id}`, formData);
        console.log('Content updated:', response.data);
        setContents(prevContents =>
          prevContents.map(content =>
            content.Id === formData.Id ? { ...content, ...response.data } : content
          )
        );
        setEditingContent(null);
      }
      setFormData({ Id: '', title: '', body: '', description: '' });
    } catch (error) {
      console.error('There was an error saving the content!', error);
    }
  };

  const handleCancel = () => {
    setEditingContent(null);
    setCreatingContent(false);
    setFormData({ Id: '', title: '', body: '', description: '' });
  };

  if (loading) {
    return <div className="loader">Loading...</div>; // Display loading indicator
  }

  return (
    <div className="page-content home">
      <div className="center-button-container">
        <button onClick={handleCreate}>Share Content</button>
      </div>
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
              {content.createdby === userid && (
                <button onClick={() => handleEdit(content)}>Edit</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={!!editingContent || creatingContent}
        onRequestClose={handleCancel}
        contentLabel="Edit/Create Content"
        className="edit-modal"
        overlayClassName="edit-overlay"
      >
        <h2>{creatingContent ? 'Create Content' : 'Edit Content'}</h2>
        <form className="edit-form" onSubmit={handleSubmit}>
          <label>
            Title:
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </label>
          <label>
            Description:
            <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>
          </label>
          <label>
            Body:
            <textarea name="body" value={formData.body} onChange={handleChange} required></textarea>
          </label>
          <div className="modal-button-container">
            <button type="submit">{creatingContent ? 'Create' : 'Save'}</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Home;
