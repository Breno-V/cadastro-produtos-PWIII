import express from 'express';
const router = express.Router();

import { Categoria } from '../models/index.js';

router.get('/', async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });

    res.render('categorias/index', {
      categorias
    });
  } catch (err) {
    next(err);
  }
});

router.get('/novo', (req, res) => {
  res.render('categorias/novo');
});

router.post('/', async (req, res, next) => {
  try {
    await Categoria.create({ nome: req.body.nome });

    res.redirect('/categorias');
  } catch (err) {
    next(err);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);

    res.render('categorias/editar', {
      categoria
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id', async (req, res, next) => {
  try {
    await Categoria.update({ nome: req.body.nome }, {
      where: {
        id: req.params.id
      }
    });

    res.redirect('/categorias');
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Categoria.destroy({
      where: {
        id: req.params.id
      }
    });

    res.redirect('/categorias');
  } catch (err) {
    next(err);
  }
});

export default router;
