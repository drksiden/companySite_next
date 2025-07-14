import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>
        Welcome to the admin dashboard! To access the catalog management
        pages, navigate to <a href="/admin/catalog">/admin/catalog</a>.
      </p>
      <p>
        You must be signed in as a user with the "manager", "admin", or
        "super_admin" role to access this page.
      </p>
    </div>
  );
}