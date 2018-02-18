const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoritesRouter = express.Router(); // favoritesRouter is an express router

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({userId: req.user._id})
            .populate('userId').populate('dishIds')
            .then((favorite) => {
                console.log(favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite); //sends data back in json format
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({userId: req.user._id})
            .then((favorite) => {
                if (favorite != null) {
                    for(var i = 0; i < req.body.length; i++){
                        if(favorite.dishIds.indexOf(req.body[i]._id) === -1) {
                            favorite.dishIds.push(req.body[i]._id);
                        }
                        else {
                            console.log("this item already exists");
                        }
                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite); //sends data back in json format
                        }, (err) => next(err));
                }
                else {
                    Favorites.create({userId : req.user._id})
                        .then((favorite) => {
                            for(var i = 0; i < req.body.length; i++){
                                favorite.dishIds.push(req.body[i]._id);
                            }
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                },(err) => next(err))
                        }, (err) => next(err))
                }
            },(err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
        Favorites.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({userId: req.user._id})
            .then((favorites) => {
                if(!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    return res.json({"exists": false, "favorites": favorites})
                }
                else {
                    if (favorites.dishIds.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        return res.json({"exists": false, "favorites": favorites})
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        return res.json({"exists": true, "favorites": favorites})

                    }
                }
            },(err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({userId: req.user._id})
            .then((favorite) => {
                if (favorite != null) {
                    if(favorite.dishIds.indexOf(req.params.dishId) === -1) {
                        favorite.dishIds.push(req.params.dishId);
                    }
                    else {
                        console.log("this item already exists");
                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite); //sends data back in json format
                        }, (err) => next(err));
                }
                else {
                    Favorites.create({userId : req.user._id})
                        .then((favorite) => {
                            if(favorite.dishIds.indexOf(req.params.dishId) === -1) {
                                favorite.dishIds.push(req.params.dishId);
                            }
                            else {
                                console.log("this item already exists");
                            }
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                },(err) => next(err))
                        }, (err) => next(err))
                }
            },(err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions,(req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported');
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
        Favorites.findOne({userId: req.user._id})
            .then((favorites) => {
                index = favorites.dishIds.indexOf(req.params.dishId);
                if( index >= 0) {
                    favorites.dishIds.splice(index,1);
                    favorites.save()
                        .then((favorites) => {
                            Favorites.findById(favorites._id)
                                .populate('userId')
                                .populate('dishIds')
                                .then((favorites) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        })
                }
                else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type','text/plain');
                    res.end('Dish ' + req.params._id + ' not in your favorites list');
                }
            });
    });

module.exports = favoritesRouter;
