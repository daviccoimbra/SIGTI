import { MdOutlineViewKanban, MdOutlineDashboard, MdOutlineArchive, MdLogout } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaUserPlus, FaUsers } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Setor } from "../../services/auth";

type NavLink = {
  title: string;
  icon: React.ReactNode;
  to: string;
  /** Se definido, o link só aparece para estes setores */
  allowedSetores?: Setor[];
};

const Sidebar = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks: NavLink[] = [
    { title: "Novo\nChamado", icon: <IoMdAddCircleOutline/>, to: "/novochamado" },
    { title: "Painel", icon: <MdOutlineDashboard />, to: "/dashboard" },
    { title: "Kanban", icon: <MdOutlineViewKanban />, to: "/chamados" },
    {
      title: "Arquivados",
      icon: <MdOutlineArchive />,
      to: "/arquivados",
      allowedSetores: ["ADMIN"],
    },
    {
      title: "Cadastrar\nUsuário",
      icon: <FaUserPlus />,
      to: "/cadastro-usuario",
      allowedSetores: ["ADMIN"],
    },

    {
      title: "Gerenciar\nUsuários",
      icon: <FaUsers />,
      to: "/usuarios",
      allowedSetores: ["ADMIN"],
    },

  ];

  // Filtra links conforme o setor do usuário
  const visibleLinks = navLinks.filter((link) => {
    if (!link.allowedSetores) return true;
    return hasPermission(...link.allowedSetores);
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div 
      className="fixed left-0 top-0 w-[60px]  h-full flex flex-col bg-[#1e3988] border-r border-slate-300 md:w-[80px]">
      
      {/* Logo */}
      <div 
        className="h-[70px] flex items-center justify-center border-b p-3">
          
        <div 
          className="flex w-full h-full rounded-lg items-center justify-center overflow-hidden">

          <img src="/logoimage.png" alt="Logo" className="w-full h-full object-contain p-1" />
              
        </div>
        
      </div>

      {/* Menu */}
      <div 
        className="flex flex-col items-center gap-4 py-5 flex-1">
        {visibleLinks.map((link) => (

          <Link 
            to={link.to} 
            key={link.title} 
            className="w-full flex justify-center">
            
            <div 
              className="flex flex-col items-center justify-center gap-1 w-full py-3 hover:bg-[#1e40af] cursor-pointer transition-all duration-200 rounded-lg m-1 text-[#b3bcD5] hover:text-white">
              
              <span 
                className="text-xl">
                {link.icon}
              </span>

              <span 
                className="text-[11px] font-medium text-center leading-tight  whitespace-pre-line">
                {link.title}
              </span>

            </div>

          </Link>
        ))}
      </div>

      {/* Rodapé: Info do usuário + Logout */}
      <div className="flex flex-col items-center gap-2 py-4 border-t border-blue-800">
        {/* Setor badge */}
        {user && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] font-bold text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full">
              {user.setor}
            </span>
            <span className="text-[9px] text-blue-300/70 text-center leading-tight truncate max-w-[70px]">
              {user.nome}
            </span>
          </div>
        )}

        {/* Botão Logout */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 w-full py-2 hover:bg-red-600/30 cursor-pointer transition-all duration-200 rounded-lg m-1 text-[#b3bcD5] hover:text-red-300"
          title="Sair"
        >
          <span className="text-xl">
            <MdLogout />
          </span>
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;