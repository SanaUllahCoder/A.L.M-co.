import { useState } from 'react';
import {
  CalendarDays, FilePlus2, FileText, LayoutDashboard, LogOut, Menu, Plus,
  ShoppingBag, Store, X
} from 'lucide-react';
import { dateLabel } from '../utils.js';
import { COMPANY_NAME, DISTRIBUTED_BRANDS } from '../config/brand.js';

export const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'create', label: 'Create invoice', icon: FilePlus2 },
  { id: 'history', label: 'Invoice history', icon: FileText },
  { id: 'shopkeepers', label: 'Shopkeepers', icon: Store },
  { id: 'products', label: 'Products', icon: ShoppingBag }
];

export default function AppShell({ page, admin, onNavigate, onSignOut, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageTitle = navigation.find((item) => item.id === page)?.label ?? 'Dashboard';
  const initial = (admin?.name ?? 'A').slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">ALM</div>
          <div className="brand-copy">
            <strong>{COMPANY_NAME}</strong>
            <span>AUTHORIZED DISTRIBUTOR</span>
            <small>{DISTRIBUTED_BRANDS}</small>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'nav-active' : ''}`}
              onClick={() => {
                onNavigate(id);
                setSidebarOpen(false);
              }}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {id === 'create' && <span className="nav-shortcut"><Plus size={13} /></span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="profile" onClick={onSignOut}>
            <div className="avatar">{initial}</div>
            <span className="profile-name">
              <b>{admin?.name ?? 'Administrator'}</b>
              <small>Administrator</small>
            </span>
            <LogOut size={16} className="logout-icon" />
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>Workspace</span><span className="crumb-slash">/</span><b>{pageTitle}</b>
          </div>
          <div className="topbar-right">
            <span className="today-date"><CalendarDays size={15} />{dateLabel(new Date())}</span>
            <div className="topbar-avatar">{initial}</div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
