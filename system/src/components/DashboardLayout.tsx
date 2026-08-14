import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutGrid, User as UserIcon, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

interface Department {
  id: number;
  name: string;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [departmentName, setDepartmentName] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.department_id) return;
    api.getDepartments().then((depts: Department[]) => {
      const match = depts.find((d) => d.id === user.department_id);
      if (match) setDepartmentName(match.name);
    }).catch(() => {});
  }, [user?.department_id]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutGrid },
    { to: "/module-access", label: "Module Access", icon: PlusCircle },
    { to: "/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen">
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-black/5 flex-col z-40">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-6 border-b border-black/5">
          <img src="/assets/logos/prismma_main_logo.png" alt="Prismma Express" className="h-6" />
        </Link>
        <p className="px-6 pt-3 pb-4 text-xs text-body/70 tracking-wide uppercase border-b border-black/5">
          Internal Systems Portal
        </p>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active ? "bg-brand-orange/10 text-brand-orange" : "text-body hover:bg-black/5 hover:text-brand-navy"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-black/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-black/10 shrink-0">
              {user?.profile_picture_url ? (
                <img src={user.profile_picture_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-navy font-medium text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-navy leading-tight truncate">{user?.name}</p>
              <p className="text-xs text-body leading-tight capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="px-2 mt-2 space-y-0.5 text-xs text-body/80">
            {user?.employee_id && <p>ID {user.employee_id}</p>}
            {user?.job_title && <p>{user.job_title}</p>}
            {departmentName && <p>{departmentName}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2 py-2.5 mt-3 rounded-md text-sm font-medium text-body hover:bg-black/5 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="md:ml-64 min-h-screen px-6 md:px-10 py-10">{children}</main>
    </div>
  );
}
