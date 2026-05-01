import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdOutlineFileUpload, MdAddCircleOutline } from "react-icons/md";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface FormData {
  titulo: string;
  descricao: string;
  prioridade: string;
  categoria: string;
  equipamento: string;
}

const NewCall = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const protocolo = Math.floor(1000000 + Math.random() * 9000000).toString();
      const payload = {
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        protocolo,
        solicitante: "Analista de TI",
        departamento: data.categoria || "TI",
      };
      
      await api.post('/tickets', payload);
      alert('Chamado criado com sucesso!');
      reset();
      navigate('/boards');
    } catch (error: unknown) {
      console.error('Erro ao criar chamado:', error);
      const err = error as { response?: { data?: { error?: string } }, message?: string };
      const errorMsg = err.response?.data?.error || err.message || 'Erro desconhecido';
      alert(`Erro ao criar chamado: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center bg-[#f8f9fa] pb-5">
      <h1 
      className="text-2xl mb-6 text-bold  mt-2 font-bold">Novo Chamado</h1>
      <p 
        className="text-[13px] text-gray-600 mb-3">
        Preencha os dados abaixo para abrir um novo ticket
      </p>
      <form 
        className="flex justify-items-start w-[60%] md:w-[40%] bg-[#fff] p-4 shadow rounded-lg border-[2px] pb-5" onSubmit={handleSubmit(onSubmit)}>

        <div 
          className="flex flex-col w-full">
          <div 
            className="flex flex-col">

            <label 
              className="text-[15px] mb-3 font-bold">
              Título do Chamado*
            </label>
            <input 
              className="p-2 rounded-md border border-gray-300 text-[15px] focus:border-[#1e40af] focus:outline-none"
              placeholder="Informe o título do seu chamado"
              disabled={loading}
              {...register("titulo", {
                required: true,
              })}
            >
            </input>
            {errors.titulo && 
            <span 
              className="text-[13px] text-red-500">
              Campo Obrigatório!
            </span>}
          </div>

          <div className="flex flex-col">

            <label className="text-[15px] mt-5 mb-3 font-bold">
              Categoria do Chamado*
            </label>
            <div className="flex items-center justify-center justify-between">

              <select
                className="p-2 text-[13px] rounded-md w-[95%] border-lg border border-gray-300 text-gray-700 focus:border-[#1e40af] focus:outline-none"
                {...register("categoria", {
                  required: true,
                })}
                defaultValue=""
              >
                <option 
                  className="text-gray-500 text-[13px] " 
                  value="" 
                  disabled>
                  Selecione uma categoria...
                </option>
                <option 
                  className="text-gray-500 text-[13px] " 
                  value="ti">
                  Suporte TI
                </option>
                <option 
                  className="text-gray-500 text-[13px] " 
                  value="financeiro">
                  Financeiro
                </option>
                <option 
                  className="text-gray-500 text-[13px] " 
                  value="manutencao">
                  Manutenção
                </option>
                <option 
                  className="text-gray-500 text-[13px] " 
                  value="rh">
                  Recursos Humanos
                </option>
                <option 
                  className="text-gray-500 text-[13px] " 
                  value="outros">
                  Outros
                </option>
              </select>
              <MdAddCircleOutline className="text-[25px] text-blue-700 cursor-pointer hover:text-blue-200" />
            </div>
            {errors.categoria && <span className="text-[13px] text-red-500">Campo Obrigatório!</span>}
          </div>

          <div className="flex flex-col">

            <label className="text-[15px] mt-5 mb-3 font-bold">
              Equipamento*
            </label>

            <div className="flex items-center justify-center justify-between">
              <select
                className="p-2 text-[13px] rounded-md w-[95%] border-lg border border-gray-300 text-gray-700 focus:border-[#1e40af] focus:outline-none"
                {...register("equipamento", {
                  required: true,
                })}
                defaultValue=""
              >
                <option className="text-gray-500 text-[13px] " value="" disabled>Selecione um equipamento...</option>
                <option className="text-gray-500 text-[13px] " value="ti">Suporte TI</option>
                <option className="text-gray-500 text-[13px] " value="financeiro">Financeiro</option>
                <option className="text-gray-500 text-[13px] " value="manutencao">Manutenção</option>
                <option className="text-gray-500 text-[13px] " value="rh">Recursos Humanos</option>
                <option className="text-gray-500 text-[13px] " value="outros">Outros</option>
              </select>
              <MdAddCircleOutline className="text-[25px] text-blue-700 cursor-pointer hover:text-blue-200" />
            </div>
            {errors.equipamento && <span className="text-[13px] text-red-500">Campo Obrigatório!</span>}
          </div>

          <div className="flex flex-col">

            <label className="text-[15px] mt-5 mb-3 font-bold">
              Descrição*
            </label>
            <textarea className="text-gray-500 text-[12px] p-2 rounded-md border border-gray-300 focus:border-[#1e40af] focus:outline-none"
              placeholder="Descreva o problema com máximo detalhe possível."
              {...register("descricao", {
                required: true,
              })}
            >
            </textarea>
            {errors.descricao && <span className="text-[13px] text-red-500">Campo Obrigatório!</span>}
          </div>


          <div className="flex flex-col mb-10">
            <label className="text-[15px] mt-5 mb-3 font-bold">
              Prioridade*
            </label>

            <div className="flex justify-evenly gap-2  w-full font-bold text-[13px] flex-wrap">

              <label className="flex items-center justify-between p-2 cursor-pointer border border-gray-300 rounded-lg transition-colors has-[:checked]:border-[#00c950] has-[:checked]:bg-[#00c950]/70 focus-within:ring-2  focus-within:ring-[#00c950] has-[:checked]:text-[#fff]">
                <input
                  defaultChecked
                  type="radio"
                  id="Baixa"
                  value="Baixa"
                  className="sr-only"
                  {...register("prioridade", { required: true })}
                />
                <span className="font-bold">Baixa</span>
              </label>

              <label className="flex items-center justify-between p-2 cursor-pointer border border-gray-300 rounded-lg transition-colors has-[:checked]:border-[#f0b100] has-[:checked]:bg-[#f0b100]/70 focus-within:ring-2  focus-within:ring-[#f0b100] has-[:checked]:text-[#fff]">
                <input
                  type="radio"
                  id="Média"
                  value="Média"
                  className="sr-only"
                  {...register("prioridade", { required: true })}
                />
                <span className="font-bold">Média</span>
              </label>

              <label className="flex items-center justify-between p-2 cursor-pointer border border-gray-300 rounded-lg transition-colors has-[:checked]:border-[#ff6900] has-[:checked]:bg-[#ff6900]/70 focus-within:ring-2  focus-within:ring-[#ff6900] has-[:checked]:text-[#fff]">
                <input
                  type="radio"
                  id="Alta"
                  value="Alta"
                  className="sr-only"
                  {...register("prioridade", { required: true })}
                />
                <span className="font-bold">Alta</span>
              </label>

              <label className="flex items-center justify-between p-2 cursor-pointer border border-gray-300 rounded-lg transition-colors has-[:checked]:border-[#FF0000] has-[:checked]:bg-[#FF0000]/60 focus-within:ring-2  focus-within:ring-[#FF0000] has-[:checked]:text-[#fff]">
                <input
                  type="radio"
                  id="critica"
                  value="Crítica"
                  className="sr-only"
                  {...register("prioridade", { required: true })}
                />
                <span className="font-bold">Crítica</span>
              </label>
              {errors.prioridade && <span className="text-[10px]">Campo Obrigatório!</span>}

            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <label
              htmlFor="fileInput"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center
            border-2 border-dashed rounded-xl p-10 cursor-pointer
            transition
            ${isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                }
          `}
            >
              <MdOutlineFileUpload size="50px" color="#c8c8c8" />

              <p className="text-gray-600 text-center">
                {file
                  ? `Arquivo: ${file.name}`
                  : "Arraste e solte ou clique para selecionar"}
              </p>

              <span className="text-sm text-gray-400 mt-2">
                (PDF, imagens, etc.)
              </span>
            </label>

            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </div>

          <div className="w-full mt-5 flex flex-col gap-2 md:flex-row md:justify-between md:h-[40px]">
            <input
              type="submit"
              value="Criar Chamado"
              className="border rounded-lg w-full md:w-[70%] bg-[#2563eb] text-white font-bold hover:bg-[#2563eb]/50 transition duration-200"
            />

            <button
              type="button"
              onClick={() => reset()}
              className="bg-gray-300 w-full md:w-[25%] rounded-lg font-bold hover:bg-gray-300/50"
            >
              Cancelar
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}

export default NewCall;