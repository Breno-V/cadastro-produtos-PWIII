import {Sequelize, DataTypes} from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

const Produto = sequelize.define('Produto', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },

  preco: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  quantidade: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const Categoria = sequelize.define('Categoria', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

Categoria.hasMany(Produto, { foreignKey: 'categoriaId', onDelete: 'CASCADE' });
Produto.belongsTo(Categoria, { foreignKey: 'categoriaId' });

export { sequelize, Produto, Categoria };
export default { sequelize, Produto, Categoria };