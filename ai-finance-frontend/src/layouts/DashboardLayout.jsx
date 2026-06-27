import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const navItem =
    "px-3 py-2 rounded-md text-sm transition-all duration-200";

  const activeStyle =
    "bg-primary/10 text-primary font-medium";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-light">

      {/* Sidebar */}
      <aside className="w-64 bg-background text-light p-6 flex flex-col justify-between shadow-xl">

        <div>
          <h2 className="text-2xl font-semibold tracking-wide text-gold mb-10">
            AI Finance
          </h2>

          <nav className="flex flex-col space-y-2">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeStyle : "hover:bg-white/5"}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/dashboard/analytics"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeStyle : "hover:bg-white/5"}`
              }
            >
              Analytics
            </NavLink>

            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeStyle : "hover:bg-white/5"}`
              }
            >
              Settings
            </NavLink>
          </nav>
        </div>

        <p className="text-xs text-muted">© 2026 AI Finance</p>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <h1 className="text-lg font-medium text-gray-800 tracking-wide">
            Dashboard Overview
          </h1>

          <button
            onClick={handleLogout}
            className="bg-primary text-white px-5 py-2 rounded-md text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="p-10">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;
