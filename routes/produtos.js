import express from 'express';
const router = express.Router();

import { Op } from 'sequelize';
import { Produto, Categoria } from '../models/index.js';

const LIMIT = 5;

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * LIMIT;

    const where = {};
    if (req.query.q) {
      where.nome = { [Op.like]: '%' + req.query.q + '%' };
    }

    const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });

    const { count, rows } = await Produto.findAndCountAll({
      where: where,
      include: Categoria,
      limit: LIMIT,
      offset: offset,
      order: [['id', 'ASC']]
    });

    const totalPages = Math.max(Math.ceil(count / LIMIT), 1);

    res.render('produtos/index', {
      produtos: rows,
      count: count,
      page: page,
      totalPages: totalPages,
      q: req.query.q || '',
      categorias: categorias,
      categoria: null
    });
  } catch (err) {
    next(err);
  }
});

router.get('/novo', async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });

    res.render('produtos/novo', {
      categorias: categorias
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.categoriaId) {
      return res.status(400).render('error', {
        message: 'Categoria é obrigatória. Cadastre uma categoria em /categorias/novo antes de criar produtos.',
        error: {}
      });
    }

    const categoria = await Categoria.findByPk(req.body.categoriaId);
    if (!categoria) {
      return res.status(400).render('error', {
        message: 'Categoria informada não existe.',
        error: {}
      });
    }

    await Produto.create({
      nome: req.body.nome,
      preco: req.body.preco,
      quantidade: req.body.quantidade,
      categoriaId: req.body.categoriaId
    });

    res.redirect('/produtos');
  } catch (err) {
    next(err);
  }
});

router.get('/categoria/:categoriaId', async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.categoriaId);

    if (!categoria) {
      return res.status(404).render('error', {
        message: 'Categoria não encontrada',
        error: {}
      });
    }

    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * LIMIT;

    const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });

    const { count, rows } = await Produto.findAndCountAll({
      where: { categoriaId: req.params.categoriaId },
      include: Categoria,
      limit: LIMIT,
      offset: offset,
      order: [['id', 'ASC']]
    });

    const totalPages = Math.max(Math.ceil(count / LIMIT), 1);

    res.render('produtos/index', {
      produtos: rows,
      count: count,
      page: page,
      totalPages: totalPages,
      q: '',
      categorias: categorias,
      categoria: categoria
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const produto = await Produto.findByPk(req.params.id);
    const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });

    res.render('produtos/editar', {
      produto: produto,
      categorias: categorias
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id', async (req, res, next) => {
  try {
    if (!req.body.categoriaId) {
      return res.status(400).render('error', {
        message: 'Categoria é obrigatória.',
        error: {}
      });
    }

    const categoria = await Categoria.findByPk(req.body.categoriaId);
    if (!categoria) {
      return res.status(400).render('error', {
        message: 'Categoria informada não existe.',
        error: {}
      });
    }

    await Produto.update({
      nome: req.body.nome,
      preco: req.body.preco,
      quantidade: req.body.quantidade,
      categoriaId: req.body.categoriaId
    }, {
      where: {
        id: req.params.id
      }
    });

    res.redirect('/produtos');
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Produto.destroy({
      where: {
        id: req.params.id
      }
    });

    res.redirect('/produtos');
  } catch (err) {
    next(err);
  }
});

export default router;
