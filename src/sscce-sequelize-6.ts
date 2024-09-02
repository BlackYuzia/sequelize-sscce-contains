import { DataTypes, Model, Op } from 'sequelize';
import { createSequelize6Instance } from '../dev/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mariadb', 'mysql']); // tested on mariadb

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Foo extends Model { }

  Foo.init({
    name: DataTypes.TEXT,
    categories: DataTypes.JSON,
  }, {
    sequelize,
    modelName: 'Foo',
  });

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: true });
  expect(spy).to.have.been.called;
  const created = await Foo.create({ name: 'TS roo', categories: ["Kruzya", "Isn't", "Gay!"] });
  // ! FAILED
  try {
    const founded = await Foo.findOne({
      where: {
        categories: {
          [Op.contains]: ["Kruzya"]
        }
      }
    })
    expect(founded).not.null("Foo") // never
  } catch (error) {
    console.error("error on Op.contains", error)
  }

  // ? WORK
  const founded = await Foo.findOne({
    where: sequelize.fn('JSON_CONTAINS', sequelize.col('categories'), JSON.stringify('Kruzya')),
  })

  console.log("JSON_CONTAINS", founded)
  expect(await Foo.count()).to.equal(1);
}
