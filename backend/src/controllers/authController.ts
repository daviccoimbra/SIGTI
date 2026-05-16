import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/login
 * Autentica o usuário com username + senha e retorna um JWT com o setor no payload.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // Busca o usuário pelo username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (!user.ativo) {
      return res.status(403).json({ error: 'Usuário desativado. Contate o administrador.' });
    }

    // Compara a senha com o hash armazenado
    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    // Gera o token JWT com o setor no payload
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET não configurado no servidor' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        nome: user.nome,
        setor: user.setor,
      },
      secret,
      { expiresIn: '8h' }
    );

    // Envia o token em um cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // ou 'none' se usar domínios diferentes com https
      maxAge: 8 * 60 * 60 * 1000, // 8 horas em milissegundos
    });

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        setor: user.setor,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro interno ao fazer login' });
  }
};

/**
 * POST /api/auth/logout
 * Limpa o cookie de autenticação.
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logout realizado com sucesso' });
};

/**
 * POST /api/auth/register
 * Cria um novo usuário. Apenas usuários do setor ADMIN podem registrar novos usuários.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, nome, setor, email, departamento, cargo } = req.body;

    if (!username || !password || !nome || !setor) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios: username, password, nome, setor',
      });
    }

    // Valida se o setor é válido
    const setoresValidos = ['ADMIN', 'GESTAO'];
    if (!setoresValidos.includes(setor)) {
      return res.status(400).json({
        error: `Setor inválido. Valores permitidos: ${setoresValidos.join(', ')}`,
      });
    }

    // Verifica se o username já existe
    const existente = await prisma.user.findUnique({
      where: { username },
    });

    if (existente) {
      return res.status(409).json({ error: 'Nome de usuário já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nome,
        setor,
        email,
        departamento,
        cargo,
      },
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      nome: user.nome,
      setor: user.setor,
      email: user.email,
      departamento: user.departamento,
      cargo: user.cargo,
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
};

/**
 * GET /api/auth/me
 * Retorna os dados do usuário autenticado (requer token válido).
 */
export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        nome: true,
        setor: true,
        ativo: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
