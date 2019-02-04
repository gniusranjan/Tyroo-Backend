const {getDB} = require('../Utility/mongoClient');
const Reply = require('../Utility/Reply');
const Mongo = require('mongodb');

class AuthenticationService{
    
    static async login(req, res){
        const db = getDB();
        const reply = new Reply();
        const {email, password }= req.body;
        if(!req.body || !req.body.email || !req.body.password){
            reply.error.push('Invalid data');
            return res.send(JSON.stringify(reply));
        }
        let userDB = await db.collection('Users').findOne({Email_Id: email, Password: password});
        if (!userDB) {
            reply.error.push('Invalid Email and Password Combination');
            return res.send(JSON.stringify(reply));
        }
        reply.data = userDB;
        return res.send(JSON.stringify(reply));
    }

    static async sendCampaign(req, res){
        const db = getDB();
        const reply = new Reply();
        const campaignList = await db.collection('Campaign').find({}).toArray();
        const campaignMap ={};
        campaignList.forEach(campaign =>{
            campaignMap[campaign._id] = campaign.Name
        })
        reply.data = campaignMap;
        console.log(reply);
        return res.send(JSON.stringify(reply));
    }
}

module.exports = AuthenticationService; 