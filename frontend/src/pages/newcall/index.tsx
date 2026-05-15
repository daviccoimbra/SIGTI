import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  MdOutlineFileUpload,
  MdAddCircleOutline,
  MdTitle,
  MdPerson,
  MdCategory,
  MdComputer,
  MdDescription,
  MdLabel,
  MdPriorityHigh,
  MdSend,
  MdCancel,
  MdAdd,
  MdSearch,
  MdKeyboardArrowDown,
} from "react-icons/md";

import { useNavigate } from "react-router-dom";

import { useToast } from "../../context/toastContext";

import { useTicketMutations } from "../../hooks/useTicketMutations";
import RequesterModal from "../../components/RequesterModal";
import CategoryModal from "../../components/CategoryModal";
import EquipmentModal from "../../components/EquipmentModal";
import api from "../../services/api";
import type { RequesterT, CategoryT, EquipmentT } from "../../types";

interface FormData {
  titulo: string;
  descricao: string;
  classificacao: string;
  prioridade: string;
  categoryId: string;
  equipmentId: string;
  requesterId: string;
}

const priorities = [
  { value: "Baixa", label: "Baixa", activeClass: "bg-green-500 text-white border-green-500 shadow-lg shadow-green-200", inactiveClass: "text-green-600 hover:bg-green-50 border-green-200 bg-white" },
  { value: "Média", label: "Média", activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200", inactiveClass: "text-amber-600 hover:bg-amber-50 border-amber-200 bg-white" },
  { value: "Alta", label: "Alta", activeClass: "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200", inactiveClass: "text-orange-600 hover:bg-orange-50 border-orange-200 bg-white" },
  { value: "Crítica", label: "Crítica", activeClass: "bg-red-600 text-white border-red-600 shadow-lg shadow-red-200", inactiveClass: "text-red-600 hover:bg-red-50 border-red-200 bg-white" },
];

const NewCall = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [isRequesterModalOpen, setIsRequesterModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [requesters, setRequesters] = useState<RequesterT[]>([]);
  const [categories, setCategories] = useState<CategoryT[]>([]);
  const [equipments, setEquipments] = useState<EquipmentT[]>([]);
  const [requesterSearch, setRequesterSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [showRequesterDropdown, setShowRequesterDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  const navigate = useNavigate();
  const { showMessage } = useToast();
  const { createTicket } = useTicketMutations();

  const fetchRequesters = useCallback(async () => {
    try {
      const response = await api.get("/requesters");
      setRequesters(response.data);
    } catch (error) {
      console.error("Erro ao buscar solicitantes:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }, []);

  const fetchEquipments = useCallback(async () => {
    try {
      const response = await api.get("/equipments");
      setEquipments(response.data);
    } catch (error) {
      console.error("Erro ao buscar equipamentos:", error);
    }
  }, []);

  useEffect(() => {
    fetchRequesters();
    fetchCategories();
    fetchEquipments();
  }, [fetchRequesters, fetchCategories, fetchEquipments]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowRequesterDropdown(false);
      setShowCategoryDropdown(false);
      setShowEquipmentDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredRequesters = useMemo(() => {
    if (!requesterSearch.trim()) return requesters;
    const search = requesterSearch.toLowerCase();
    return requesters.filter(r => 
      r.nome.toLowerCase().includes(search) || 
      r.setor.toLowerCase().includes(search)
    );
  }, [requesters, requesterSearch]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const search = categorySearch.toLowerCase();
    return categories.filter(c => c.descricao.toLowerCase().includes(search));
  }, [categories, categorySearch]);

  const filteredEquipments = useMemo(() => {
    if (!equipmentSearch.trim()) return equipments;
    const search = equipmentSearch.toLowerCase();
    return equipments.filter(e => 
      e.nome.toLowerCase().includes(search) || 
      e.marcaModelo.toLowerCase().includes(search)
    );
  }, [equipments, equipmentSearch]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const selectedPriority = watch("prioridade", "Baixa");

  const onSubmit = async (data: FormData) => {
    try {
      const protocolo = new Date().toISOString().replace(/\D/g, "").slice(0, 17);
      const selectedRequester = requesters.find(r => r.id === data.requesterId);

      const payload = {
        titulo: data.titulo,
        descricao: data.descricao,
        classificacao: data.classificacao,
        prioridade: data.prioridade,
        protocolo,
        requesterId: data.requesterId,
        categoryId: data.categoryId,
        equipmentId: data.equipmentId,
        solicitante: selectedRequester ? selectedRequester.nome : "Analista de TI",
        departamento: selectedRequester ? selectedRequester.setor : "TI",
      };

      await createTicket.mutateAsync(payload);
      showMessage("Chamado criado com sucesso!", "success");
      reset();
      navigate("/boards");
    } catch (error: unknown) {
      console.error("Erro ao criar chamado:", error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = err.response?.data?.error || err.message || "Erro desconhecido";
      showMessage(`Erro ao criar chamado: ${errorMsg}`, "error");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-sm";
  const labelClass = "text-sm font-semibold text-gray-700 flex items-center gap-2";

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-8 pt-7 pb-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-200">
            <MdTitle className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Novo Chamado
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Preencha os dados abaixo para abrir um novo ticket
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
<form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <MdTitle className="text-xl" />
                  Informações do Chamado
                </h2>
              </div>
              <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={`${labelClass} mb-2 block`}>
                  <MdTitle className="text-indigo-600" />
                  Título do Chamado *
                </label>
                <input
                  className={`${inputClass} ${errors.titulo ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                  placeholder="Ex: Computador não liga"
                  disabled={createTicket.isPending}
                  {...register("titulo", { required: true })}
                />
                {errors.titulo && <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>}
              </div>

              <div className="relative">
                <label className={`${labelClass} mb-2 block`}>
                  <MdPerson className="text-indigo-600" />
                  Solicitante *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={requesterSearch}
                      onChange={(e) => {
                        setRequesterSearch(e.target.value);
                        setShowRequesterDropdown(true);
                      }}
                      onFocus={() => setShowRequesterDropdown(true)}
                      className={`${inputClass} w-full ${errors.requesterId ? "border-red-400" : ""}`}
                      placeholder="Digite para buscar..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MdKeyboardArrowDown className="text-gray-400" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRequesterModalOpen(true)}
                    className="px-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <MdAdd className="text-xl" />
                  </button>
                </div>
                {showRequesterDropdown && filteredRequesters.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                    {filteredRequesters.map((r) => (
                      <div
                        key={r.id}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
                        onClick={() => {
                          setRequesterSearch(`${r.nome} - ${r.setor}`);
                          setShowRequesterDropdown(false);
                          setValue("requesterId", r.id);
                        }}
                      >
                        <span className="font-medium">{r.nome}</span>
                        <span className="text-gray-400"> - {r.setor}</span>
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register("requesterId", { required: true })} id="requesterId" />
                {errors.requesterId && <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>}
              </div>

              <div className="relative">
                <label className={`${labelClass} mb-2 block`}>
                  <MdCategory className="text-indigo-600" />
                  Categoria *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      className={`${inputClass} w-full ${errors.categoryId ? "border-red-400" : ""}`}
                      placeholder="Digite para buscar..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MdKeyboardArrowDown className="text-gray-400" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <MdAdd className="text-xl" />
                  </button>
                </div>
                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                    {filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
                        onClick={() => {
                          setCategorySearch(cat.descricao);
                          setShowCategoryDropdown(false);
                          setValue("categoryId", cat.id);
                        }}
                      >
                        {cat.descricao}
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register("categoryId", { required: true })} id="categoryId" />
                {errors.categoryId && <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>}
              </div>

              <div className="relative">
                <label className={`${labelClass} mb-2 block`}>
                  <MdComputer className="text-indigo-600" />
                  Equipamento *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={equipmentSearch}
                      onChange={(e) => {
                        setEquipmentSearch(e.target.value);
                        setShowEquipmentDropdown(true);
                      }}
                      onFocus={() => setShowEquipmentDropdown(true)}
                      className={`${inputClass} w-full ${errors.equipmentId ? "border-red-400" : ""}`}
                      placeholder="Digite para buscar..."
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <MdKeyboardArrowDown className="text-gray-400" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEquipmentModalOpen(true)}
                    className="px-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <MdAdd className="text-xl" />
                  </button>
                </div>
                {showEquipmentDropdown && filteredEquipments.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                    {filteredEquipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700"
                        onClick={() => {
                          setEquipmentSearch(`${eq.nome} - ${eq.marcaModelo}`);
                          setShowEquipmentDropdown(false);
                          setValue("equipmentId", eq.id);
                        }}
                      >
                        <span className="font-medium">{eq.nome}</span>
                        <span className="text-gray-400"> - {eq.marcaModelo}</span>
                      </div>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register("equipmentId", { required: true })} id="equipmentId" />
                {errors.equipmentId && <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>}
              </div>

              <div>
                <label className={`${labelClass} mb-2 block`}>
                  <MdLabel className="text-indigo-600" />
                  Classificação *
                </label>
                <input
                  list="classificacoes"
                  className={inputClass}
                  placeholder="Selecione ou digite..."
                  {...register("classificacao", { required: true })}
                />
                <datalist id="classificacoes">
                  <option value="Erro" />
                  <option value="Dúvida" />
                  <option value="Solicitação" />
                  <option value="Configuração" />
                  <option value="Outros" />
                </datalist>
                {errors.classificacao && <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>}
              </div>
            </div>

            <div>
              <label className={`${labelClass} mb-2 block`}>
                <MdDescription className="text-indigo-600" />
                Descrição *
              </label>
              <textarea
                className={`${inputClass} min-h-[120px] resize-y ${errors.descricao ? "border-red-400" : ""}`}
                placeholder="Descreva o problema com o máximo de detalhes possível..."
                disabled={createTicket.isPending}
                {...register("descricao", { required: true })}
              />
              {errors.descricao && <span className="text-red-500 text-xs mt-1">Campo obrigatório!</span>}
            </div>

            <div>
              <label className={`${labelClass} mb-3 block`}>
                <MdPriorityHigh className="text-indigo-600" />
                Prioridade *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorities.map((p) => (
                  <label
                    key={p.value}
                    className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200 text-center
                      ${selectedPriority === p.value ? p.activeClass : p.inactiveClass}
                    `}
                  >
                    <input
                      type="radio"
                      value={p.value}
                      className="sr-only"
                      {...register("prioridade", { required: true })}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
              {errors.prioridade && <span className="text-red-500 text-xs mt-2">Campo obrigatório!</span>}
            </div>

            <div>
              <label className={`${labelClass} mb-2 block`}>
                <MdOutlineFileUpload className="text-indigo-600" />
                Anexo (opcional)
              </label>
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                  ${isDragging ? "border-blue-400 bg-blue-50" : file ? "border-gray-300 bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                `}
              >
                {file ? (
                  <>
                    <p className="text-gray-700 font-medium text-sm">{file.name}</p>
                    <p className="text-gray-400 text-xs mt-1">Clique para trocar o arquivo</p>
                  </>
                ) : (
                  <>
                    <MdOutlineFileUpload size={32} className="text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Arraste e solte ou clique para selecionar</p>
                    <p className="text-gray-400 text-xs mt-1">PDF, imagens (PNG, JPG)</p>
                  </>
                )}
              </label>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors border border-gray-200 shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MdSend className="text-lg" />
              {createTicket.isPending ? "Criando..." : "Criar Chamado"}
            </button>
          </div>
        </form>
      </div>

      <RequesterModal
        isOpen={isRequesterModalOpen}
        onClose={() => setIsRequesterModalOpen(false)}
        onSuccess={fetchRequesters}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchCategories}
      />
      <EquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => setIsEquipmentModalOpen(false)}
        onSuccess={fetchEquipments}
      />
    </div>
  );
};

export default NewCall;