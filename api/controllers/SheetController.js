const models = require('../models');
const authService = require('../services/auth.service');

const SheetController = () => {

    const create = (req, res) => {
        const body = req.body;
        console.log('Body', body);
        const cs =  {
            name: body.name,
            code:body.code,
            category: body.category,
            category_code: body.category_code,
            purchase_price: body.purchase_price,
            sale_price: body.sale_price,
            quantity: body.quantity,
        }
        return models.sheet.create(cs).then(_cs=> {
        //   return res.status(200).json(_cs);
          return console.log(_cs);
        }).catch(err=> {
          return res.status(500).json(err);
        });
      }

    return {
        create
    };
}

module.exports = SheetController;
