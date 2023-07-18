const mongoose = require('mongoose');

const acountSchema = mongoose.Schema({
    name:{
        type:'String',
        require: true,
    },
    email:{
        type:'String',
        require: true,
    },
    password:{
        type:'String',
        require: true,
    },
    image:{
        type:'String',
        require: true,
    },
    status:{
        type:'Boolean',
        default: false,
    },
});

const accountModel = mongoose.model('account',acountSchema);
module.exports = accountModel;
