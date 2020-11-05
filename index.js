const Web3 = require('web3')
const fs = require('fs')
const wanutil = require('wanchain-util');
const WanTx = wanutil.wanchainTx
const ethTx = require('ethereumjs-tx');
const assert = require('assert')
const args = require("optimist").argv;
const sf ={
        priv:"0x303bc5cc3af0f655430909a4a3add6a411fa9c4b7f182a8d2a1a419614e818f0",
        addr:"0xf1cf205442bea02e51e2c68ff4cc698e5879663c"
}
let web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.2:8545")) 
const gGasPrice = 1000000000
const gGasLimit = 1000000
let scAddr;

let crossScAddr = '0x62dE27e16f6f31d9Aa5B02F4599Fc6E21B339e79'.toLowerCase();
let oracleAddr = '0xF728FB2e26Be1f12496d9F68BDDFe1Eac0eBFD26'.toLowerCase();
let quotaAddr = '0x7585c2ae6a3F3B2998103cB7040F811B550C9930';
let tokenManagerAddr = '0x017aB6485fF91C1A0a16B90E71f92B935B7213d3';
let smgAdminAddr = '0xaa5a0f7f99fa841f410aafd97e8c435c75c22821';
let listGroupAddr = '0x83C4F86124329040dDdb936bffa211Ce460aCb9E';

let gpkAddr= '0xf0bFfF373EEF7b787f5aecb808A59dF714e2a6E7';
let metricAddr = '0x869276043812B459Cc9d11E255Fb0097D51846EF';
let PosLibAddr = "0x4Ec1e3c0aB865707eEc5F9a97Bcaee2E39b8a2De"
let WrcEthOnWanAddr = "0x48344649b9611a891987b2db33faada3ac1d05ec"
let wan_atEth = ""
 
let groupId = "0x000000000000000000000000000000000000000000746573746e65745f303037"   
let KnownCap = {
        "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c": "400000000000000000000",
        "0xef1df88ab86ce47bacb01ccb52818e87dde08137": "100000000000000000000",
        "0x5e97f046fc50c094a437c6aa15c72a69625d297b": "100000000000000000000",
}
const mainnet = args.mainnet
if(mainnet){
        smgAdminAddr = '0x1E7450D5d17338a348C5438546f0b4D0A5fbeaB6';
        gpkAddr= '0xFC86Ad558163C4933eBCfA217945aF6e9a3bcE06';
        listGroupAddr = '0x8113a9373BD319A05b607747f396CA8e78e8F5B9';
        PosLibAddr = "0xe5D05F0C52DAe635B8bd2e5AFAF5c72369920B39"
        metricAddr = '0xd5e61e4069c013a444e962dbd489d845b9Ae2727';
        KnownCap = {}
        web3 = new Web3(new Web3.providers.HttpProvider("http://52.88.104.167:26891")) 
        groupId = "0x000000000000000000000000000000000000000000000041726965735f303030"   
}


let tm,smg,quota,metric,pos,listGroup,wrc20;

async function wanSendTransaction(sf, value, sdata, to, nonce=undefined){
        if(nonce == undefined){
                nonce = await web3.eth.getTransactionCount(sf.addr,"pending")
        }
        let rawTx = {
            Txtype:1,
            nonce:  nonce,
            gasPrice: gGasPrice,
            gas: gGasLimit,
            to: to,
            chainId: 3,
            value: value,
            data: sdata,
        }
         console.log("rawTx:", rawTx)
        let tx = new WanTx(rawTx)
        let pri = sf.priv
        
        if(typeof(pri) == 'string'){
            pri = Buffer.from(sf.priv.slice(2), 'hex')
        }
        tx.sign(pri)
        const serializedTx = '0x'+tx.serialize().toString('hex');
    
        let receipt =  web3.eth.sendSignedTransaction(serializedTx)
        return receipt
    }
    async function ethSendTransaction(sf, value, sdata, to, nonce=undefined){
        if(nonce == undefined){
                nonce = await web3.eth.getTransactionCount(sf.addr,"pending")
        }
        let rawTx = {
            nonce:  nonce,
            gasPrice: gGasPrice,
            gas: gGasLimit,
            to: to,
            chainId: 3,
            value: value,
            data: sdata,
        }
         console.log("rawTx:", rawTx)
        let tx = new ethTx(rawTx)
        let pri = sf.priv
        
        if(typeof(pri) == 'string'){
            pri = Buffer.from(sf.priv.slice(2), 'hex')
        }
        tx.sign(pri)
        const serializedTx = '0x'+tx.serialize().toString('hex');
    
        let receipt =  web3.eth.sendSignedTransaction(serializedTx)
        return receipt
    }

async function init() {
        let content;
        let smgfile = 'abi/abi.StoremanGroupDelegate.json'
        let tmfile = 'abi/abi.TokenManagerDelegate.json'
        let quotafile = 'abi/abi.QuotaDelegate.json'
        let metricfile = 'abi/abi.MetricDelegate.json'
        let posfile = 'abi/abi.PosLib.json'
        let crossfile = 'abi/abi.CrossDelegate.json'
        let tokenfile = 'abi/abi.MappingToken.json'
        let listGroupfile = 'abi/abi.ListGroup.json'

        content = fs.readFileSync(smgfile, 'utf8')
        let smgAbi = JSON.parse(content)
        content = fs.readFileSync(tmfile, 'utf8')
        let tmAbi = JSON.parse(content)
        content = fs.readFileSync(quotafile, 'utf8')
        let quotaAbi = JSON.parse(content)
        content = fs.readFileSync(metricfile, 'utf8')
        let metricAbi = JSON.parse(content)
        content = fs.readFileSync(posfile, 'utf8')
        let posAbi = JSON.parse(content)
        content = fs.readFileSync(crossfile, 'utf8')
        let crossAbi = JSON.parse(content)
        content = fs.readFileSync(tokenfile, 'utf8')
        let tokenAbi = JSON.parse(content)
        content = fs.readFileSync(listGroupfile, 'utf8')
        let listGroupAbi = JSON.parse(content)
        smg = new  web3.eth.Contract(smgAbi, smgAdminAddr);
        tm =  new  web3.eth.Contract(tmAbi, tokenManagerAddr);
        quota =  new  web3.eth.Contract(quotaAbi, quotaAddr);
        metric = new  web3.eth.Contract(metricAbi, metricAddr);
        pos = new  web3.eth.Contract(posAbi, PosLibAddr);
        cross = new  web3.eth.Contract(crossAbi, crossScAddr);
        token = new  web3.eth.Contract(tokenAbi, wan_atEth);
        listGroup = new  web3.eth.Contract(listGroupAbi, listGroupAddr);

}

async function verifyDepositBase(gid){
        let gpkBlock = await getBlockOfbase(gid)
        return verifyDeposit(gid, gpkBlock)
}

async function verifyDepositCurrent(gid){
        let gpkBlock = await getBlockOfDismiss(gid)
        return verifyDeposit(gid, gpkBlock)
}
async function calQuitDelegatefromBase(gid, blockId){
        let selected = await smg.methods.getSelectedStoreman(gid).call(block_identifier=blockId)
        let from = await getBlockOfbase(gid)
        let options = {
                fromBlock: from,
                toBlock:blockId,
                filter:{wkAddr:selected}
        }
        let quitedValue = web3.utils.toBN(0)
        let event = await smg.getPastEvents("delegateOutEvent", options)
        for(let i=0; i<event.length; i++){
                let deOut = await smg.methods.getSmDelegatorInfo(event[i].returnValues.wkAddr,event[i].returnValues.from).call(block_identifier=event[i].blockNumber)
                let deCur = await smg.methods.getSmDelegatorInfo(event[i].returnValues.wkAddr,event[i].returnValues.from).call(block_identifier=blockId)
                //console.log("deCur:", deCur)
                if(deCur.deposit != 0){
                        quitedValue = quitedValue.add(web3.utils.toBN(deOut.deposit))
                }
        }
        return quitedValue;
}
async function calQuitPartfromBase(gid, blockId){
        let selected = await smg.methods.getSelectedStoreman(gid).call(block_identifier=blockId)
        let from = await getBlockOfbase(gid)
        let options = {
                fromBlock: from,
                toBlock:blockId,
                filter:{wkAddr:selected}
        }
        let quitedValue = web3.utils.toBN(0)
        let event = await smg.getPastEvents("partOutEvent", options)
        for(let i=0; i<event.length; i++){
                let de = await smg.methods.getSmPartnerInfo(event[i].returnValues.wkAddr,event[i].returnValues.from).call(block_identifier=event[i].blockNumber)
                quitedValue = quitedValue.add(web3.utils.toBN(de.deposit))
        }
        return quitedValue;
}
async function verifyDeposit(gid,blockId){
        let globalConf = await smg.methods.getStoremanConf().call(block_identifier=blockId);
        let weight = globalConf.standaloneWeight;
        let groupInfo = await smg.methods.getStoremanGroupInfo(gid).call(block_identifier=blockId);
        //console.log("groupInfo:", groupInfo)
        assert.equal(21, groupInfo.memberCountDesign,'count is wrong')
        let totalDeposit = web3.utils.toBN(0)
        let totalDepositWeight = web3.utils.toBN(0)
        let selected = await smg.methods.getSelectedStoreman(gid).call(block_identifier=blockId);
        for(let i=0; i<parseInt(groupInfo.memberCountDesign);i++){
                let deTotal =  web3.utils.toBN(0)
                let pnTotal =  web3.utils.toBN(0)

                let sk = await smg.methods.getStoremanInfo(selected[i]).call(block_identifier=blockId);
                // console.log("sk:", sk)
                totalDeposit = totalDeposit.add(web3.utils.toBN(sk.deposit))
                totalDeposit = totalDeposit.add(web3.utils.toBN(sk.delegateDeposit))
                totalDeposit = totalDeposit.add(web3.utils.toBN(sk.partnerDeposit))
                totalDepositWeight = totalDepositWeight.add(web3.utils.toBN(sk.deposit).mul(web3.utils.toBN(weight)).div(web3.utils.toBN(10000)))
                totalDepositWeight = totalDepositWeight.add(web3.utils.toBN(sk.partnerDeposit).mul(web3.utils.toBN(weight)).div(web3.utils.toBN(10000)))
                totalDepositWeight = totalDepositWeight.add(web3.utils.toBN(sk.delegateDeposit))
                for(let k=0; k<parseInt(sk.delegatorCount); k++){
                        let deAddr = await smg.methods.getSmDelegatorAddr(sk.wkAddr, k).call(block_identifier=blockId);
                        let de = await smg.methods.getSmDelegatorInfo(sk.wkAddr, deAddr).call(block_identifier=blockId);
                        if(!de.quited){
                                deTotal = deTotal.add(web3.utils.toBN(de.deposit))
                        }
                }
      
                let cap = web3.utils.toBN(0)
                if(KnownCap[sk.wkAddr.toLowerCase()]){
                        cap = web3.utils.toBN(KnownCap[sk.wkAddr.toLowerCase()])
                }
                if(deTotal.toString(10) !=  web3.utils.toBN(sk.delegateDeposit).sub(cap).toString(10)){
                        console.log("********************deTotal, sk.delegateDeposit:", deTotal.toString(10) , web3.utils.toBN(sk.delegateDeposit).sub(web3.utils.toBN(KnownCap[sk.wkAddr.toLowerCase()])).toString(10),sk.wkAddr)
                        assert.equal(deTotal.toString(10), web3.utils.toBN(sk.delegateDeposit).sub(cap).toString(10), "delegate deposit is wrong")
                }
                for(let m=0; m<parseInt(sk.partnerCount); m++){
                        let pnAddr = await smg.methods.getSmPartnerAddr(sk.wkAddr, m).call(block_identifier=blockId);
                        let pn = await smg.methods.getSmPartnerInfo(sk.wkAddr, pnAddr).call(block_identifier=blockId);
                        if(!pn.quited){
                                pnTotal = pnTotal.add(web3.utils.toBN(pn.deposit))
                        }
                }
                if(pnTotal.toString(10) != sk.partnerDeposit){
                        console.log("pnTotal, sk.partnerDeposit:", pnTotal.toString(10) , sk.partnerDeposit, sk.wkAddr)
                        assert.equal(pnTotal, sk.partnerDeposit, "delegate deposit is wrong")
                }
        }
        let quitedDelegate = await calQuitDelegatefromBase(gid, blockId)
        let quitedPart = await calQuitPartfromBase(gid, blockId)
        console.log("quitedDelegate:",quitedDelegate.toString(10))
        console.log("quitedPart:",quitedPart.toString(10))
        console.log("groupdeposit:", groupInfo.deposit)
        console.log("totalDeposit:", totalDeposit.add(quitedDelegate).add(quitedPart).toString(10),  blockId, gid)
        assert.equal(groupInfo.deposit, totalDeposit.add(quitedDelegate).add(quitedPart).toString(10), "totalDeposit is wrong")
        console.log("total DepositWeight: ", totalDepositWeight.add(quitedDelegate).add(quitedPart.mul(web3.utils.toBN(weight)).div(web3.utils.toBN(10000))).toString(10), blockId)
        console.log("group DepositWeight: ", groupInfo.depositWeight, blockId)
        assert.equal(groupInfo.depositWeight, totalDepositWeight.add(quitedDelegate).add(quitedPart.mul(web3.utils.toBN(weight)).div(web3.utils.toBN(10000))).toString(10), "totalDepositWeight is wrong")

}

async function toFixDelegateOut(wkAddrs){
        let func = web3.utils.sha3("delegateOutEvent(address,address)")
        for(let i=0; i<wkAddrs.length; i++){
                let t = web3.utils.toBN(0)

                let option = {
                        fromBlock: 930000,
                        address:smgAdminAddr,
                        topics:[func, "0x000000000000000000000000"+wkAddrs[i].slice(2)],
                }
                //console.log("option:",option)
                let events = await web3.eth.getPastLogs(option)
                console.log("*****************delegateOutEvent events:", events)
                for(let k=0; k<events.length; k++){
                        let fdelegateIn = web3.utils.sha3("delegateInEvent(address,address,uint256)")
                        let o2 = {
                                fromBlock: events[k].blockNumber,
                                address:smgAdminAddr,
                                topics:[fdelegateIn, "0x000000000000000000000000"+wkAddrs[i].slice(2), events[k].topics[2]],
                        }
                        let eventIns = await web3.eth.getPastLogs(o2)
                        console.log("#####eventIns:", eventIns)
                        for(let m=0; m<eventIns.length; m++){
                                t = t.add(web3.utils.toBN(eventIns[m].topics[3]))
                        }
                }
                console.log("t:", t.toString(10), wkAddrs[i])
        }
        

}
async function getIncentiveFromPos(_groupId, day) {

}
function basicEqual(A, B,s){
        if(A.divRound(web3.utils.toBN(10000)).toString(10) != B.divRound(web3.utils.toBN(10000)).toString(10)){
                console.log("-----------------------:",A.divRound(web3.utils.toBN(10000)).toString(10), B.divRound(web3.utils.toBN(10000)).toString(10))
        }
        assert.equal(A.divRound(web3.utils.toBN(10000)).toString(10), B.divRound(web3.utils.toBN(10000)).toString(10), s)
}
function rate(A, B) {
        return web3.utils.toBN(10000000).mul(A).div(B).mul(web3.utils.toBN(365)).toString(10)
}
async function checkSmgIncentive(_groupId) {
        let groupInfo = await smg.methods.getStoremanGroupInfo(_groupId).call()
        let groupStartDay =parseInt(groupInfo.startTime/3600/24); 
        let groupEndDay = parseInt(groupInfo.endTime/3600/24);

        let selectedNodes = await smg.methods.getSelectedStoreman(_groupId).call();
        console.log("getSelectedStoreman:", selectedNodes)

        let today = parseInt(Date.now()/1000/3600/24)
        let groupIncentives = []
        for(let day=groupStartDay; day<groupEndDay && day<today; day++){
                let gi = await smg.methods.checkGroupIncentive(_groupId, day).call();
                console.log("group incentive every day:", day, gi)
                groupIncentives[day] = gi
                let posCap = await pos.methods.getHardCap( day*3600*24).call();
                console.log("pos posCap:", posCap[0])
                let posAvg = await pos.methods.getPosAvgReturn(  day*3600*24).call();
                console.log("pos posAvg rate: %d/10000",  posAvg[0])
                let totalDepositCache = await listGroup.methods.getTotalDeposit(day).call();
                console.log("totaldepodit day:", day, totalDepositCache)

                let groupNumber = await getLastBlockByEpoch(day)
                groupInfo = await smg.methods.getStoremanGroupInfo(_groupId).call(block_identifier=groupNumber)

                let p1Return = web3.utils.toBN(groupInfo.deposit).mul(web3.utils.toBN(posAvg[0])).div(web3.utils.toBN(3650000))
                let capReturn = web3.utils.toBN(groupInfo.deposit).mul(web3.utils.toBN(posCap[0]).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)))).div(web3.utils.toBN(totalDepositCache)).div(web3.utils.toBN(10000))
                //let capReturn = web3.utils.toBN(groupInfo.deposit).mul(web3.utils.toBN(posCap[0])).div(web3.utils.toBN(totalDepositCache))
                let posRet = await pos.methods.getMinIncentive(groupInfo.deposit, day, totalDepositCache).call();
                console.log("getMinIncentive:", web3.utils.fromWei(posRet))
                if(p1Return.lt(capReturn)){
                        assert.equal( web3.utils.toBN(posRet).toString(10), p1Return.toString(10), "group Incentive is wrong")
                } else {
                        assert.equal( web3.utils.toBN(posRet).toString(10), capReturn.toString(10), "group Incentive is wrong")
                }
                let co = await smg.methods.getChainTypeCo(groupInfo.chain1, groupInfo.chain2).call(block_identifier=groupNumber)
                if(gi.toString(10) != 0){
                        assert.equal( web3.utils.toBN(posRet).mul(web3.utils.toBN(co)).div(web3.utils.toBN(10000)).toString(10), gi, "group Incentive is wrong")
                }
                let metricInfo = await metric.methods.getPrdInctMetric(groupId, day, day).call()
                console.log("day metric info:", day, metricInfo)
        }

        for(let i=0; i<groupInfo.memberCountDesign; i++){
                for(let m=groupStartDay; m<groupEndDay && m<today;m++){
                        console.log("incentive group day:", groupInfo.groupId, m)
                        let block = await getLastBlockByEpoch(m);
                        let groupInfoDay = await smg.methods.getStoremanGroupInfo(_groupId).call(block_identifier=block);
                        let smInfo = await smg.methods.getStoremanInfo(selectedNodes[i]).call(block_identifier=block);
                        let ii = await smg.methods.getStoremanIncentive(selectedNodes[i], m).call();
                        let expectIncentiveSkSelf = web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(smInfo.deposit).mul(web3.utils.toBN(15000)).div(web3.utils.toBN(10000))).div(web3.utils.toBN(groupInfoDay.depositWeight))
                        if(ii != 0){
                                console.log("\nday Incentive:", m, smInfo.wkAddr, ii)
                                let AllexpectIncentiveFromDe = web3.utils.toBN(0)
                                for(let j=0; j<smInfo.delegatorCount;j++){
                                        let deAddr = await smg.methods.getSmDelegatorAddr(smInfo.wkAddr, j).call(block_identifier=block)
                                        let deInfo = await smg.methods.getSmDelegatorInfo(smInfo.wkAddr, deAddr).call(block_identifier=block)
                                        if(deInfo.quited){
                                                let q = await listGroup.methods.getDelegateQuitGroupId(smInfo.wkAddr, deAddr).call(block_identifier=block)
                                                if(q.groupId != _groupId && q.nextGroupId!= _groupId){
                                                        // don't calculate after out.
                                                        continue
                                                }
                                        }
                                        let deIncentive = await smg.methods.getSmDelegatorInfoIncentive(smInfo.wkAddr, deAddr, m).call()
                                        let expectIncentiveDe = web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(deInfo.deposit)).div(web3.utils.toBN(groupInfoDay.depositWeight)).mul(web3.utils.toBN(90)).div(web3.utils.toBN(100))
                                        AllexpectIncentiveFromDe = AllexpectIncentiveFromDe.add(web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(deInfo.deposit)).div(web3.utils.toBN(groupInfoDay.depositWeight)).mul(web3.utils.toBN(10)).div(web3.utils.toBN(100)))
                                        console.log("-- delegate incentive:", deAddr,rate(web3.utils.toBN(deIncentive), web3.utils.toBN(deInfo.deposit)), deInfo.deposit,deIncentive, expectIncentiveDe.toString(10))
                                        basicEqual(expectIncentiveDe,web3.utils.toBN(deIncentive), "delegate incentive wrong")
                                }

                                let AllexpectIncentiveFromPartner = web3.utils.toBN(0)
                                for(let j=0; j<smInfo.partnerCount;j++){
                                        let deAddr = await smg.methods.getSmPartnerAddr(smInfo.wkAddr, j).call(block_identifier=block)
                                        let deInfo = await smg.methods.getSmPartnerInfo(smInfo.wkAddr, deAddr).call(block_identifier=block)
                                        if(deInfo.quited){
                                                let q = await listGroup.methods.getPartQuitGroupId(smInfo.wkAddr, deAddr).call(block_identifier=block)
                                                if(q.groupId != _groupId && q.nextGroupId!= _groupId){
                                                        // don't calculate after out.
                                                        continue
                                                }
                                        }
                                        let expectIncentivePn = web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(deInfo.deposit)).div(web3.utils.toBN(groupInfoDay.depositWeight)).mul(web3.utils.toBN(15000)).div(web3.utils.toBN(10000))
                                        AllexpectIncentiveFromPartner = AllexpectIncentiveFromPartner.add(expectIncentivePn)
                                }
                                console.log("-- sk incentive:", rate(web3.utils.toBN(ii),expectIncentiveSkSelf.add(AllexpectIncentiveFromDe)), ii, expectIncentiveSkSelf.add(AllexpectIncentiveFromDe).add(AllexpectIncentiveFromPartner).toString(10))
                                basicEqual(web3.utils.toBN(ii),expectIncentiveSkSelf.add(AllexpectIncentiveFromDe).add(AllexpectIncentiveFromPartner), "sk incentive wrong")


                        }
                }
        }
}
async function getActiveGroupIDs() {
        let today = parseInt(Date.now()/1000/3600/24)
        groupIDs = await smg.methods.getActiveGroupIds(today).call();
        console.log("groupIDs:", groupIDs)
        return groupIDs;
}
async function getAvgRewardRatio(){
        let epochID=18559
        let groupIDs = await smg.methods.getActiveGroupIds(epochID).call();
        let totalIncentive = web3.utils.toBN(0)
        let totalDeposit = await listGroup.methods.getTotalDeposit(epochID).call()
        for(let i=0; i<groupIDs.length; i++){
                let groupIncentive = await smg.methods.checkGroupIncentive(groupIDs[i], epochID).call()
                totalIncentive = totalIncentive.add(web3.utils.toBN(groupIncentive))
        }
        console.log("dattotalIncentive, totalDeposit:",  web3.utils.fromWei(totalIncentive).toString(10), web3.utils.fromWei(totalDeposit));
        let base = web3.utils.toBN(10000)
        console.log("rate %s%%%%",  base.mul(web3.utils.toBN(365)).mul(totalIncentive).div(web3.utils.toBN(totalDeposit)).toString(10))
        let posCap = await pos.methods.getHardCap(epochID*3600*24).call()
        console.log("pos hard:", web3.utils.toBN(posCap[0]).div(web3.utils.toBN(10000)).toString(10))
}
async function main(){
        await init();
        //await checkTm();
        //await checkCross();
        await checkSmgBalance();
        let groupIds = await getActiveGroupIDs();
        for(let i=0; i<groupIds.length; i++){
                let grId = groupIds[i]
                console.log("group:", grId)
                await verifyDepositCurrent(grId)
                await checkSmgIncentive(grId);
        }
}
main();



async function getBlockOfSelect(groupId) {
        let func = web3.utils.sha3("selectedEvent(bytes32,uint256,address[])")
        let option = {
                fromBlock: 930000,
                address:smgAdminAddr,
                topics:[func, groupId],
        }
        let events = await web3.eth.getPastLogs(option)
        return events[events.length-1].blockNumber;
}
async function getBlockOfDismiss(groupId) {
        let func = web3.utils.sha3("StoremanGroupDismissedEvent(bytes32,uint256)")
        let option = {
                fromBlock: 930000,
                address:smgAdminAddr,
                topics:[func, groupId],
        }
        let events = await web3.eth.getPastLogs(option)
        if(events.length == 0){
                return web3.eth.getBlockNumber();
        }else{
                return events[events.length-1].blockNumber;
        }
}


async function getBlockOfbase(groupId) {
        let func = web3.utils.sha3("SlashLogger(bytes32,uint8,address,address,uint16,uint8)")
        let option = {
                fromBlock: 930000,
                address:gpkAddr,
                topics:[func, groupId],
        }
        let events = await web3.eth.getPastLogs(option)
        if(events.length == 0){
                return getBlockOfSelect(groupId)
        }else{
                return events[events.length-1].blockNumber;
        }
        
}

async function checkSmgBalance() {
        let balanceRealSc = await web3.eth.getBalance(smgAdminAddr)
        let balanceSc = web3.utils.toBN(0)
        let options = {
                fromBlock: 9300000,
                address:smgAdminAddr,
        }
        let event = await smg.getPastEvents("allEvents", options)
        for(let i=0; i<event.length; i++){
                switch(event[i].event){
                        case "stakeInEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.add(web3.utils.toBN(event[i].returnValues.value))
                                break
                        case "stakeAppendEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.add(web3.utils.toBN(event[i].returnValues.value))
                                break
                        case "delegateInEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.add(web3.utils.toBN(event[i].returnValues.value))
                                break
                        case "partInEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.add(web3.utils.toBN(event[i].returnValues.value))
                                break      
                        case "storemanGroupContributeEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.add(web3.utils.toBN(event[i].returnValues.value))
                                break                                
                        case "stakeClaimEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.sub(web3.utils.toBN(event[i].returnValues.value))
                                break                                  
                        case "delegateClaimEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.sub(web3.utils.toBN(event[i].returnValues.amount))
                                break                                  
                        case "partClaimEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.sub(web3.utils.toBN(event[i].returnValues.amount))
                                break                                  
                        case "delegateIncentiveClaimEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.sub(web3.utils.toBN(event[i].returnValues.amount))
                                break                                  
                        case "stakeIncentiveClaimEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.sub(web3.utils.toBN(event[i].returnValues.amount))
                                break                                  
                        case "stakeIncentiveCrossFeeEvent":
                                //console.log("event: ", event[i].event)
                                balanceSc = balanceSc.sub(web3.utils.toBN(event[i].returnValues.amount))
                                break                                  
                                                                                                                                                        

                }
                //console.log("event[i]:",event[i])
        }
        console.log("real balance of smg:", balanceRealSc)
        console.log("calculated balance of smg:", balanceSc.toString(10))
        assert.equal(balanceRealSc, balanceSc.toString(10), "smg balance is wrong")

}
async function  getLastBlockByEpoch(epochId){
        let curBlock = await web3.eth.getBlock('latest')
        let curEpochId = curBlock.epochId;
        let curSlostId = curBlock.slotId;

        if(epochId>=curEpochId){
                return curBlock.number;
        } else {
                let cap = (curEpochId-epochId-1)*12*60*24+curSlostId
                let start = curBlock.number - cap - 16;
                let startBLock = await web3.eth.getBlock(start)
                assert(startBLock.epochId <= epochId);
                for(let i=start+1; i<curBlock.number; i++){
                        let b = await web3.eth.getBlock(i);
                        if(b.epochId >= epochId+1){
                                return b.number-1
                        }
                }
        }
}

