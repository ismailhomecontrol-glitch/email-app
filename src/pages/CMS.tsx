import React, { useState, useEffect } from 'react';

const CMS = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch('/api/cms-posts');
    const data = await res.json();
    setPosts(data.posts || []);
  };

  const deletePost = async (id: number) => {
    await fetch('/api/cms-posts', {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });
    fetchPosts();
  };

  const triggerAI = async () => {
    await fetch('/api/post-blog', { method: 'POST' });
    fetchPosts();
    alert('AI blog generation triggered!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Blog CMS</h1>
      <button onClick={triggerAI} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px' }}>Generate New Blog with AI</button>
      <div style={{ marginTop: '20px' }}>
        {posts.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
            <h3>{p.title}</h3>
            {p.image_url && <img src={p.image_url} alt="Blog" style={{ maxWidth: '100px' }} />}
            <p>{p.summary}</p>
            <button onClick={() => deletePost(p.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CMS;
