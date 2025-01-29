import { useAuth } from "../lib/hooks/useAuth";

export const Header = () => {
  const { logout, user } = useAuth();
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
      <h1>Sons of Liberty Dashboard</h1>
      <div>
        <span>Welcome, {user?.email}</span>
        <button onClick={logout} style={{ marginLeft: '1rem' }}>
          Logout
        </button>
      </div>
    </div>

  );
};