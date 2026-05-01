import { v4 as uuidv4 } from "uuid";
// import taskImage from "../assets/images/task.jpg";
// import taskImage2 from "../assets/images/task2.jpg";
// import taskImage3 from "../assets/images/task3.jpg";
import { Columns } from "../types";

export const Board: Columns = {
	backlog: {
		name: "Para Fazer (Backlog)",
		items: [
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo zxczxchjgrfjytghkd oh",
				descricao: "testando desc",
				prioridade: "Alta",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Alta",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},

		],
	},
	pending: {
		name: "Em Andamento",
		items: [
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
		],
	},
	todo: {
		name: "Aguardando Cliente",
		items: [
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Baixa",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Baixa",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Baixa",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
		],
	},
	done: {
		name: "Concluído",
		items: [
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
			{

				id: uuidv4(),
				protocolo: "1234565",
				solicitante: "biruleibe",
				departamento: "chupingole",
				titulo: "titulo aqui oh",
				descricao: "testando desc",
				prioridade: "Media",
				// imagem?: string;
				alt: "task image",
				responsavel: ["pedro", "Thiago", "joão"],
				
			},
		],
	},
};