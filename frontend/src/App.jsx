import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Community from './pages/Community';
import ManageUsers from './pages/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><UserDashboard /></ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute><Projects /></ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute><Tasks /></ProtectedRoute>
      } />
      <Route path="/community" element={
        <ProtectedRoute><Community /></ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
