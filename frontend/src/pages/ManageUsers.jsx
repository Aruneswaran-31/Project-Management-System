import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/client';
import { Trash2 } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = () => api.get('/users').then((res) => setUsers(res.data));

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Manage Users</h1>
      <p className="text-slate-500 mb-6">View and manage all registered users</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-800 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="border border-slate-200 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleDelete(u.id)} className="text-slate-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
