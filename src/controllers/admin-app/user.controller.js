const {User} = require('../../../models/init-models');
const HttpException = require('../../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {secret_jwt} = require('../../startup/config');

/******************************************************************************
 *                              User Controller
 ******************************************************************************/
class UserController {
    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        const { name, password: pass } = req.body;
        const user = await User.findOne({
            where:{ 
                name: name
            }
        });

        if (!user) {
            throw new HttpException(401, 'Unable to login!');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new HttpException(401, 'Incorrect password!');
        }

        // user matched!
        const token = jwt.sign({ user_id: user.id.toString() }, secret_jwt, {
            expiresIn: '24h'
        });
        user.dataValues.token = token;
        
        res.send({
            success: true,
            message: 'User info',
            data: user
        });
    };
    getAll = async (req, res, next) =>{
        const model = await User.findAll(); 
        res.status(200).send({
            error: false,
            error_code: 200,
            message: 'Malumotlar chiqdi',
            data: model
        });
       }
    getOne = async (req, res, next) =>{
        const model = await User.findOne({
            where:{
                id: req.params.id
            }
        })
        if(!model){
            throw new HttpException(404, "bu id da malumot yo\'q")
        }
        res.status(200).send({
            error: false,
            error_code: 200,
            message: 'Malumot chiqdi',
            data: model
        });
    }
    create = async(req, res, next) => {
        this.checkValidation(req);
       await this.hashPassword(req)
        const modell = await User.create(req.body);
        res.status(200).send({
            error: false,  
            error_code: 200,
            message: 'Malumotlar qo\'shildi',
            data: modell
        });
    }
    update = async (req, res, next) =>{
        let data = req.body;
        this.hashPassword(req)
            const model = await User.findOne({
                where:{
                    id: req.params.id
                }
            })
        model.name = data.name;
        model.phone_number = data.phone_number;
        model.password = data.password;
        model.role = data.role;
        model.save();
        res.status(200).send({
            error: false,
            error_code: 200,
            message: 'Malumotlar tahrirlandi',
            data: model
        });
    }
    delete = async (req, res, next) =>{
        const model = await User.destroy({
            where:{
                id: req.params.id
            }
        });
        if(!model){
            throw new HttpException(404, "bunday id yoq")
        }
        else{
        res.status(200).send({
            error: false,
            error_code: 200,
            message: 'Malumot ochirildi',
            data: model
        });
    }
    }
    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new HttpException(400, 'Validation faild', errors);
        }
    }

    // hash password if it exists
    hashPassword = async (req) => {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 8);
        }
    }
}



/******************************************************************************
 *                               Export
 ******************************************************************************/
module.exports = new UserController;