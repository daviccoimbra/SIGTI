import { MdOutlineViewKanban, MdOutlineDashboard, MdOutlineArchive } from "react-icons/md";
import { IoMdAddCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const navLinks = [
    { title: "Novo\nChamado", icon: <IoMdAddCircleOutline/>, to: "/novochamado" },
    { title: "Painel", icon: <MdOutlineDashboard />, to: "/dashboard" },
    { title: "Kanban", icon: <MdOutlineViewKanban />, to: "/chamados" },
    { title: "Arquivados", icon: <MdOutlineArchive />, to: "/arquivados" },
  ];

  return (
    <div 
      className="fixed left-0 top-0 w-[60px]  h-full flex flex-col bg-[#1e3988] border-r border-slate-300 md:w-[80px]">
      
      {/* Logo */}
      <div 
        className="h-[70px] flex items-center justify-center border-b p-3">
          
        <div 
          className="flex bg-[#2563eb] w-full h-full rounded-lg items-center justify-center">

            <span 
              className="text-sm font-semibold text-[20px] text-[#fff]">JK</span>
              
        </div>
        
      </div>

      {/* Menu */}
      <div 
        className="flex flex-col items-center gap-4 py-5">
        {navLinks.map((link) => (

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
    </div>
  );
};

export default Sidebar;