'use client';

import React, { useState } from 'react';
import { UserCog, ShieldCheck, UserCheck, Plus, X, Lock } from 'lucide-react';

interface PortalUser {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'coordinator' | 'data_entry';
  email: string;
  lastActive: string;
}

const INITIAL_USERS: PortalUser[] = [
  {
    id: 'usr_1',
    name: 'Elisha Adera Campaign Team',
    username: 'admin',
    role: 'admin',
    email: 'admin@elishaadera.org',
    lastActive: 'Active Now',
  },
  {
    id: 'usr_2',
    name: 'Department Mobilizer',
    username: 'coordinator',
    role: 'coordinator',
    email: 'coordinator@elishaadera.org',
    lastActive: '2 hours ago',
  },
  {
    id: 'usr_3',
    name: 'Data Entry Volunteer',
    username: 'dataentry',
    role: 'data_entry',
    email: 'volunteer@elishaadera.org',
    lastActive: 'Yesterday',
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<PortalUser[]>(INITIAL_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'coordinator' | 'data_entry'>('coordinator');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) return;

    const newUser: PortalUser = {
      id: `usr_${Date.now()}`,
      name,
      username: username.toLowerCase().trim(),
      role,
      email: `${username.toLowerCase().trim()}@elishaadera.org`,
      lastActive: 'Just invited',
    };

    setUsers([...users, newUser]);
    setModalOpen(false);
    setName('');
    setUsername('');
  };

  return (
    <div className="space-y-6 pb-14 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-campaign-gold/15 border border-campaign-gold/30">
            <ShieldCheck className="w-3 h-3 text-campaign-gold" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-campaign-deepGreen">Security & Access Control</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-campaign-deepGreen">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Role-based access for Campaign Executives, Coordinators, and Data Entry Volunteers
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-campaign-gold" />
          <span>Add Portal User</span>
        </button>
      </div>

      {/* Role Definitions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-campaign-deepGreen font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-campaign-primaryGreen" />
            <span>Administrator</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Unrestricted access: manage supporters, configure communications, view audit logs, adjust settings, and export reports.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-campaign-cpaBlue font-bold text-sm">
            <UserCheck className="w-4 h-4 text-campaign-cpaBlue" />
            <span>Campaign Coordinator</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            View permitted supporters, manage campaign activities and meetings, access analytics. Restricted from system configuration.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-campaign-gold font-bold text-sm">
            <Lock className="w-4 h-4 text-campaign-gold" />
            <span>Data Entry Officer</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tasked with registering supporters and updating contact details. No access to sensitive settings or bulk exports.
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-campaign-deepGreen">Portal Users</h3>
            <p className="text-[11px] text-gray-400">{users.length} accounts configured</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User Name', 'Username', 'Assigned Role', 'Last Active', 'Access Status'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400 ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-campaign-lightGreen/10 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-campaign-lightGreen text-campaign-deepGreen font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">@{u.username}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${u.role === 'admin'
                        ? 'bg-campaign-lightGreen text-campaign-deepGreen'
                        : u.role === 'coordinator'
                          ? 'bg-blue-50 text-campaign-cpaBlue'
                          : 'bg-yellow-50 text-yellow-800'
                      }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{u.lastActive}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-campaign-border space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-campaign-deepGreen">
                Create Portal User
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Christine Mutheu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cmutheu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-campaign-darkText mb-1">
                  Access Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-campaign-lightBg border border-campaign-border rounded-xl font-medium"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="coordinator">Campaign Coordinator</option>
                  <option value="data_entry">Data Entry Officer</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-campaign-border rounded-xl font-bold text-campaign-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-campaign-primaryGreen hover:bg-campaign-deepGreen text-white font-bold rounded-xl shadow"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

