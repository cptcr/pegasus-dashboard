import { redirect } from 'next/navigation';

// Redirect /dashboard/servers to /dashboard
export default function ServersRedirect() {
  redirect('/dashboard');
}