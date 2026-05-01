import { useParams } from "react-router"

const taks = {
    protocolo: "1234565",
    solicitante: "biruleibe",
    departamento: "chupingole",
    titulo: "titulo aqui oh",
    descricao: "testando desc",
    prioridade: "Baixa",
    // imagem?: string;
    alt: "task image",
    responsavel: ["pedro", "Thiago", "joão"],
}

const Task = () => {
    const { id } = useParams()
    return (
        <div className="px-5 w-full">
            <div className="border-b-2">

                <h1 className=" text-2xl mt-[20px] font-bold flex items-center">
                    {taks.titulo}
                    <span className="ml-2 text-base">
                        {taks.protocolo}
                    </span>
                    <span
                        className={`px-2 py-[5px] text-xs rounded-xl text-white font-bold ml-2
                            ${taks.prioridade === "Alta"
                                ? "bg-[#ff6900] "
                                : taks.prioridade === "Media"
                                    ? "bg-[#f0b100]"
                                    : "bg-[#00c950]"
                            }`}
                    >
                        {taks.prioridade}
                    </span>
                </h1>
                <h2 className="text-sm">
                    <span className="font-bold mr-2 text-gray-400">
                        Aberto por:
                    </span>
                    {taks.solicitante}
                </h2>
                <h2 className="text-sm">
                    <span className="font-bold mr-2 text-gray-400">
                        Departamento:
                    </span>
                    {taks.departamento}
                </h2>
            </div>
            <h1 className=" text-lg mt-[20px] font-bold">
                Descrição:
            </h1>
            <p className="breakwords ">
                {taks.descricao}
            </p>
            <div>

                <h1 className=" text-lg mt-[20px] font-bold border-b-4">
                    Comentários:
                </h1>
                <textarea className="w-full rounded-lg border p-2 mt-2">

                </textarea>
            </div>


        </div>
    )
}

export default Task