import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaPlusSquare, FaSearch, FaBell, FaCog, FaUserCircle, FaHeart, FaRegHeart } from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home');
  const [posts, setPosts] = React.useState([]);
  const [currentUserId, setCurrentUserId] = React.useState(null);

  const [newImage, setNewImage] = React. useState('');
  const [caption, setCaption] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsAuthenticated(true);
      setCurrentUserId(userId);
      fetchPosts();
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts/all');
      const data = await res. json();
      if (res.ok) {
        setPosts(data);
      }
    } catch (err) {
      console.error("Eroare feed:", err);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'home') fetchPosts();
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!newImage) return alert("Alege o poză!");
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, image: newImage, caption })
      });
      if (res.ok) {
        setNewImage('');
        setCaption('');
        setActiveTab('home');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:  JSON.stringify({ userId: currentUserId })
      });

      const data = await res.json();

      if (res.ok) {
        setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasLiked = (likesArray) => {
    return likesArray && likesArray.includes(currentUserId);
  };

  const getLikeCount = (likesArray) => {
    return likesArray ? likesArray.length :  0;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="feed-container">
            {posts.length === 0 ? <p style={{marginTop: 20}}>Nu sunt postări. </p> : null}
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <FaUserCircle className="user-avatar" />
                  <span className="username">{post.author}</span>
                </div>
                <img src={post.image} alt="Post" className="post-image" />
                <div className="post-footer">
                  <div className="post-actions">
                    <div onClick={() => handleLike(post._id)} style={{ cursor: 'pointer' }}>
                      {hasLiked(post. likes) ? (
                        <FaHeart className="action-icon" style={{ color: '#ed4956' }} />
                      ) : (
                        <FaRegHeart className="action-icon" />
                      )}
                    </div>
                  </div>
                  <p className="likes-count">
                    {getLikeCount(post.likes)} aprecieri
                  </p>
                  <p className="post-caption">
                    <span className="bold">{post.author}</span> {post.caption}
                  </p>
                  <p className="post-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'post':
        return (
          <div className="create-post-container">
            <h2>Postare Nouă</h2>
            <div className="image-preview-area">
              {newImage ?  <img src={newImage} alt="Preview" className="preview-img" /> : <div className="placeholder-preview">Previzualizare</div>}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
            <textarea placeholder="Scrie o descriere..." value={caption} onChange={(e) => setCaption(e.target.value)} className="caption-input" />
            <button className="btn-primary" onClick={handlePostSubmit} disabled={loading}>{loading ? "Se postează..." : "Postează"}</button>
          </div>
        );

      case 'search':
        return <div className="tab-content"><h2>Caută</h2></div>;
      
      case 'notif': 
        return <div className="tab-content"><h2>Notificări</h2></div>;
      
      case 'settings': 
        return (
          <div className="tab-content">
            <h2>Setări</h2>
            <button className="btn-primary" onClick={() => navigate('/profile')} style={{marginBottom: '10px'}}>👤 Profil & Conexiuni</button>
            <button className="btn-logout" onClick={handleLogout}>Deconectare</button>
          </div>
        );
      
      default:
        return <div>Home</div>;
    }
  };

  if (! isAuthenticated) {
    return (
      <div className="landing-container guest-mode">
        <div className="main-content">
          <h1>Bine ai venit</h1>
          <div className="auth-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>Autentificare</button>
            <button className="btn-secondary" onClick={() => navigate('/register')}>Înregistrare</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-container app-mode">
      <div className="content-area">{renderContent()}</div>
      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === 'home' ? 'active' :  ''}`} onClick={() => setActiveTab('home')}><FaHome className="nav-icon" /><span>Home</span></div>
        <div className={`nav-item ${activeTab === 'post' ? 'active' : ''}`} onClick={() => setActiveTab('post')}><FaPlusSquare className="nav-icon" /><span>Post</span></div>
        <div className={`nav-item ${activeTab === 'search' ?  'active' : ''}`} onClick={() => setActiveTab('search')}><FaSearch className="nav-icon" /><span>Search</span></div>
        <div className={`nav-item ${activeTab === 'notif' ? 'active' : ''}`} onClick={() => setActiveTab('notif')}><FaBell className="nav-icon" /><span>Notif</span></div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><FaCog className="nav-icon" /><span>Settings</span></div>
      </div>
    </div>
  );
};

export default Landing;