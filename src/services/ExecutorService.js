const { getDB } = require('../Utility/mongoClient');
const Reply = require('../Utility/Reply');
const Mongo = require('mongodb');

class ExecutionService {

    static async provideData(campaignId) {
        const currentDate = new Date()
        const db = getDB();
        const docList = await db.collection('Metric').find({
            Date: {
                $gte: new Date( currentDate.toISOString().split('T')[0]+"T00:00:00.000Z"),
                $lte: new Date(currentDate.toISOString().split('T')[0]+"T23:59:59.000Z")
            },
            CampaignId: campaignId
         }).toArray();
        const spend =0;
        const impression = 0;
        const click= 0;
        const install =0;

        docList.forEach(obj=>{
           spend=spend+ obj.Spend;
           impression= impression+ obj.Impressions;
           click= click+ obj.Clicks;
           install= install+ obj.Installs;
        }) 
        return {spend, impression, click, install};
    }

    static async firstCondition(campaignId) {
        const {spend, impression, click, install} = await this.provideData(campaignId);
        if( spend*1000/impression >= 5 &&  impression >=1000000){
            return true;
        }
        return false;
    }
    static async secondCondition(campaignId) {
        const {spend, impression, click, install} = await this.provideData(campaignId);
        if( spend >= 1000 &&  spend/click <=0.2){
            return true;
        }
        return false;
    }
    
    static async thirdCondition(campaignId) {
        const {spend, impression, click, install} = await this.provideData(campaignId);
        if( click >= 50000 &&  install <=100){
            return true;
        }
        return false;
    }
    
    static async fourthCondition(campaignId) {
        const {spend, impression, click, install} = await this.provideData(campaignId);
        if( spend/install >= 2 &&  install >=100){
            return true;
        }
        return false;
    }

    static async notify(socket, time) {
        const db = getDB();
        socket.emit('message', 'hi from new backend');
        const ruleList = await db.collection('Rules').find({Activated: true, Date_Started:{$lte: new Date()}, Notify_Action:{$lte:time}}).toArray();
        
        await Promise.all(ruleList.map( async (rule)=>{
            switch (rule.Condition_Type) {
                case 'condition1':{
                    const result = await this.firstCondition(rule.Campaign_Id);
                    if(result){
                        socket.emit('notification', rule);
                    }
                    break;
                }
                case 'condition2':{
                    const result = await this.secondCondition(rule.Campaign_Id);
                    if(result){
                        socket.emit('notification', rule);
                    }
                    break;
                }
                case 'condition3':{
                    const result = await this.thirdCondition(rule.Campaign_Id);
                    if(result){
                        socket.emit('notification', rule);
                    }
                    break;
                }
                case 'condition4':{
                    const result = await this.fourthCondition(rule.Campaign_Id);
                    if(result){
                        socket.emit('notification', rule);
                    }
                    break;
                }
            };
        }))
        return;
    }

    static async createRules(req, res) {
        const db = getDB();
        const reply = new Reply();
        const {_id,User_Id, Campaign_Id, Activated, Condition_Type, Date_Started, Name, Notify_Action}= req.body;
        if(_id){
            req.body._id= new Mongo.ObjectID(_id);
        }
        if(!User_Id||!Campaign_Id ||Activated===null ||!Condition_Type || !Date_Started || !Notify_Action){
            reply.error.push('Invalid data');
            return res.send(JSON.stringify(reply));
        }
        // to do<<<<<<< check if User_id and Campaign_id exists in database
        await db.collection('Rules').save(req.body);
        reply.data= req.body;
        console.log(reply);
        return res.send(JSON.stringify(reply));
    }

    static async sendRules (req,res){
        const db = getDB();
        const reply = new Reply();
        const {User_Id}= req.body;
        const ruleList = await db.collection('Rules').find(User_Id).toArray();
        reply.data= ruleList;
        console.log(reply);
        return res.send(JSON.stringify(reply));
    }
}

module.exports = ExecutionService; 