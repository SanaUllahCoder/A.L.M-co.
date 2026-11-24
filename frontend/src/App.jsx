import { useCallback, useState } from 'react';
import { Check } from 'lucide-react';
import AppShell from './layout/AppShell.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateInvoicePage from './pages/CreateInvoicePage.jsx';
import InvoiceHistoryPage from './pages/InvoiceHistoryPage.jsx';
import ShopkeepersPage from './pages/ShopkeepersPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';

function readAdmin() {
  try {
    return JSON.parse(localStorage.getItem('invoice-admin') ?? 'null');
  } catch {
    return null;
  }
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('invoice-admin-token'));
  const [admin, setAdmin] = useState(readAdmin);
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  }, []);

  function signIn(session) {
    localStorage.setItem('invoice-admin-token', session.token);
    localStorage.setItem('invoice-admin', JSON.stringify(session.admin));
    setToken(session.token);
    setAdmin(session.admin);
  }

  function signOut() {
    localStorage.removeItem('invoice-admin-token');
    localStorage.removeItem('invoice-admin');
    setToken(null);
    setAdmin(null);
  }

  if (!token) return <LoginPage onLogin={signIn} />;

  let pageContent;
  switch (page) {
    case 'create':
      pageContent = (
        <CreateInvoicePage
          notify={notify}
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      );
      break;
    case 'history':
      pageContent = <InvoiceHistoryPage notify={notify} />;
      break;
    case 'shopkeepers':
      pageContent = <ShopkeepersPage notify={notify} />;
      break;
    case 'products':
      pageContent = <ProductsPage notify={notify} />;
      break;
    case 'dashboard':
    default:
      pageContent = <DashboardPage key={refreshKey} onNavigate={setPage} />;
  }

  return (
    <>
      <AppShell
        page={page}
        admin={admin}
        onNavigate={setPage}
        onSignOut={signOut}
      >
        {pageContent}
      </AppShell>
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </>
  );
}
