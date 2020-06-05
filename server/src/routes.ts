import express, { request, response } from 'express';
import { celebrate } from  'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';
 
import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';
import Joi from '@hapi/joi';

// Desacoplando as rotas do servidor para um arquivo por meio do 'express.Router()'

//Conveções da comunidade: index(listar vários), show (listar único), create, update, delete
const routes = express.Router();
const upload = multer(multerConfig);



const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.post(
    '/points', 
    upload.single('image'), 
    celebrate({
        body: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().required(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required(),
            items: Joi.string().required(),
    })
}, {
    abortEarly: false
}),
    pointsController.create
);

routes.get('/items', itemsController.index);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;