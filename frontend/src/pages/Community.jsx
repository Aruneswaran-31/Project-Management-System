import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2, MessageCircle } from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [openComments, setOpenComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentsData, setCommentsData] = useState({});

  const loadPosts = () => api.get('/community/posts').then((res) => setPosts(res.data));

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await api.post('/community/posts', { content });
    setContent('');
    loadPosts();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/community/posts/${id}`);
    loadPosts();
  };

  const toggleComments = async (postId) => {
    const isOpen = openComments[postId];
    setOpenComments({ ...openComments, [postId]: !isOpen });
    if (!isOpen && !commentsData[postId]) {
      const res = await api.get(`/community/posts/${postId}`);
      setCommentsData({ ...commentsData, [postId]: res.data.comments });
    }
  };

  const submitComment = async (postId) => {
    const text = commentDrafts[postId];
    if (!text?.trim()) return;
    await api.post(`/community/posts/${postId}/comments`, { content: text });
    setCommentDrafts({ ...commentDrafts, [postId]: '' });
    const res = await api.get(`/community/posts/${postId}`);
    setCommentsData({ ...commentsData, [postId]: res.data.comments });
    loadPosts();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Community</h1>
      <p className="text-slate-500 mb-6">Share updates and connect with your team</p>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <form onSubmit={handlePost} className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the community..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            <Send size={18} />
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {posts.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                  {p.author_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{p.author_name}</p>
                  <p className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</p>
                </div>
              </div>
              {(p.user_id === user?.id || user?.role === 'admin') && (
                <button onClick={() => handleDelete(p.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-slate-700 mb-3">{p.content}</p>
            <button
              onClick={() => toggleComments(p.id)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600"
            >
              <MessageCircle size={16} /> {p.comment_count} comments
            </button>

            {openComments[p.id] && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                {(commentsData[p.id] || []).map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs shrink-0">
                      {c.author_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 flex-1">
                      <p className="text-xs font-medium text-slate-700">{c.author_name}</p>
                      <p className="text-sm text-slate-600">{c.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={commentDrafts[p.id] || ''}
                    onChange={(e) => setCommentDrafts({ ...commentDrafts, [p.id]: e.target.value })}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <button
                    onClick={() => submitComment(p.id)}
                    className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {posts.length === 0 && <p className="text-slate-400 text-sm">No posts yet. Be the first to share!</p>}
      </div>
    </Layout>
  );
}
