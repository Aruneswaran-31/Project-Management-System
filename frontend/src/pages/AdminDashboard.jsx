import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../api/client';
import { Users, FolderKanban, CheckSquare, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/users/stats/overview').then((res) => setStats(res.data));
    api.get('/projects').then((res) => setProjects(res.data.slice(0, 5)));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
      <p className="text-slate-500 mb-6">Overview of all projects, tasks, and users</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={stats?.total_users ?? '-'} color="primary" />
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.total_projects ?? '-'} color="purple" />
        <StatCard icon={CheckSquare} label="Total Tasks" value={stats?.total_tasks ?? '-'} color="orange" />
        <StatCard icon={CheckCircle2} label="Completed Tasks" value={stats?.completed_tasks ?? '-'} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Projects</h2>
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">Owner: {p.owner_name} · {p.task_count} tasks</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                p.status === 'active' ? 'bg-green-50 text-green-600' :
                p.status === 'completed' ? 'bg-primary-50 text-primary-600' :
                'bg-orange-50 text-orange-600'
              }`}>
                {p.status}
              </span>
            </div>
          ))}
          {projects.length === 0 && <p className="text-slate-400 text-sm">No projects yet.</p>}
        </div>
      </div>
    </Layout>
  );
}
