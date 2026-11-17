import AdminSidebar from '../../components/admin/AdminSidebar';

export const metadata = { title: 'Admin — Novique' };

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-brand-black">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
