const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dishIds:[{ type: Schema.Types.ObjectId,
        ref: 'Dish'}]
},{
    usePushEach : true
});


var  Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;