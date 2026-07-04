import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckSquare, Clock, CheckCircle2 } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data));
    api.get('/tasks').then((res) => setTasks(res.data));
  }, []);

  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back, {user?.name} 👋</h1>
      <p className="text-slate-500 mb-6">Here's what's happening with your work</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FolderKanban} label="My Projects" value={projects.length} color="primary" />
        <StatCard icon={CheckSquare} label="To Do" value={todo} color="orange" />
        <StatCard icon={Clock} label="In Progress" value={inProgress} color="purple" />
        <StatCard icon={CheckCircle2} label="Completed" value={done} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">My Recent Tasks</h2>
        <div className="space-y-3">
          {tasks.slice(0, 6).map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-800">{t.title}</p>
                <p className="text-sm text-slate-500">{t.project_name}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                t.status === 'done' ? 'bg-green-50 text-green-600' :
                t.status === 'in-progress' ? 'bg-purple-50 text-purple-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {t.status}
              </span>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-slate-400 text-sm">No tasks assigned yet.</p>}
        </div>
      </div>
    </Layout>
  );
}
