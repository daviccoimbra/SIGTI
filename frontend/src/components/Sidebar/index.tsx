import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { MdOutlineViewKanban, MdOutlineDashboard, MdOutlineArchive, MdLogout } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaUserPlus, FaUsers } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import type { Setor } from "../../services/auth";

type NavLink = {
  title: string;
  icon: React.ReactNode;
  to: string;
  allowedSetores?: Setor[];
  ariaLabel?: string;
};

const Sidebar = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navLinks: NavLink[] = [
    { title: "Novo\nChamado", icon: <IoMdAddCircleOutline />, to: "/novochamado", ariaLabel: "Criar novo chamado" },
    { title: "Painel", icon: <MdOutlineDashboard />, to: "/dashboard", ariaLabel: "Ir para Dashboard" },
    { title: "Kanban", icon: <MdOutlineViewKanban />, to: "/chamados", ariaLabel: "Ir para Kanban" },
    {
      title: "Arquivados",
      icon: <MdOutlineArchive />,
      to: "/arquivados",
      allowedSetores: ["ADMIN"],
      ariaLabel: "Ver chamados arquivados",
    },
    {
      title: "Cadastrar\nUsuário",
      icon: <FaUserPlus />,
      to: "/cadastro-usuario",
      allowedSetores: ["ADMIN"],
      ariaLabel: "Cadastrar novo usuário",
    },
    {
      title: "Gerenciar\nUsuários",
      icon: <FaUsers />,
      to: "/usuarios",
      allowedSetores: ["ADMIN"],
      ariaLabel: "Gerenciar usuários",
    },
  ];

  const visibleLinks = navLinks.filter((link) => {
    if (!link.allowedSetores) return true;
    return hasPermission(...link.allowedSetores);
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname === "/") return true;
    return location.pathname === path;
  };

  return (
    <nav 
      className="fixed left-0 top-0 h-full flex flex-col z-50"
      style={{ 
        width: '80px',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e3988 50%, #1e3a8a 100%)',
      }}
      aria-label="Navegação principal"
    >
      {/* Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Logo Section */}
      <div className="relative h-[70px] flex items-center justify-center px-3 border-b border-white/10">
        <div className="relative w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
          <img 
            src="/logoimage.png" 
            alt="Logo do sistema" 
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div 
        className="flex-1 flex flex-col items-center gap-2 py-4 px-2"
        role="navigation"
        aria-label="Menu de navegação"
      >
        {visibleLinks.map((link) => {
          const active = isActive(link.to);
          const isHovered = hoveredItem === link.title;

          return (
            <Link 
              to={link.to} 
              key={link.title} 
              className="w-full flex justify-center"
              aria-label={link.ariaLabel}
              onMouseEnter={() => setHoveredItem(link.title)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div 
                className={`group relative flex flex-col items-center justify-center gap-1 w-full py-2.5 px-2 rounded-xl transition-all duration-300 cursor-pointer ${
                  active 
                    ? 'bg-white/15 text-white shadow-lg shadow-black/10' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                role="menuitem"
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm" />
                )}
                
                {/* Hover Glow */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`} />

                <span 
                  className={`relative text-xl transition-all duration-300 ${
                    active ? 'text-white scale-110' : 'text-white/70 group-hover:text-white group-hover:scale-105'
                  }`}
                  aria-hidden="true"
                >
                  {link.icon}
                </span>

                <span 
                  className={`relative text-[10px] font-semibold text-center leading-tight whitespace-pre-line transition-all duration-300 ${
                    active ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {link.title}
                </span>

                {/* Tooltip on Hover */}
                {!active && isHovered && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xl whitespace-pre-line z-50 animate-fadeIn">
                    {link.ariaLabel}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      <div className="flex flex-col items-center gap-2 p-3 border-t border-white/10">
        {user && (
          <div 
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 w-full"
            aria-label={`Usuário: ${user.nome}, Setor: ${user.setor}`}
          >
            <span 
              className="text-[9px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-full border border-white/10"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {user.setor}
            </span>
            <span 
              className="text-[10px] text-white/70 text-center leading-tight truncate max-w-[70px]"
            >
              {user.nome}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="group relative flex flex-col items-center justify-center gap-1 w-full py-2.5 px-2 rounded-xl text-white/60 hover:text-white hover:bg-red-500/20 transition-all duration-300"
          aria-label="Sair do sistema"
        >
          <span 
            className="text-xl transition-all duration-300 group-hover:scale-110" 
            aria-hidden="true"
          >
            <MdLogout />
          </span>
          <span 
            className="text-[10px] font-medium transition-all duration-300"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Sair
          </span>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-red-500/0 to-red-500/10" />
        </button>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
    </nav>
  );
};

export default Sidebar;