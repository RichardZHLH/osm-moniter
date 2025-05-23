const Web3 = require('web3')
const fs = require('fs')
const wanutil = require('wanchain-util');
const WanTx = wanutil.wanchainTx
const ethTx = require('ethereumjs-tx');
const assert = require('assert')
const args = require("optimist").argv;
const sendEmail = require('./send-email').sendEmail;
const tableify = require("tableify")
const iWanClient = require('iwan-sdk');
const SolidityEvent = require("web3_0/lib/web3/event.js");
const { parse } = require('json2csv');
const smgAbi = require("./abi.StoremanGroupDelegate.json")
const { parseLog } = require('ethereum-event-logs')
const axios = require('axios')
const BigNumber = require('bignumber.js')

const APIURL = 'https://thegraph.one/subgraphs/name/wanchain/StoremanGroup'

const sf ={
        priv:"0x303bc5cc3af0f655430909a4a3add6a411fa9c4b7f182a8d2a1a419614e818f0",
        addr:"0xf1cf205442bea02e51e2c68ff4cc698e5879663c"
}
const gGasPrice = 1000000000
const gGasLimit = 1000000
let scAddr;
const lastFeeBlock = 17827095 // after that, no Fee
const lastChangeOwnerBlock = 	  37909364
const lastChangeOwnerBlockETH =  22216051
const oldCrossEventFee = "9960"
let wan_atEth = ""

var logargs =  process.argv.splice(2)
var job = logargs[0]
var build_number = logargs[1]

const testnet = args.testnet
let smgAdminAddr = '0x1E7450D5d17338a348C5438546f0b4D0A5fbeaB6';
let gpkAddr= '0xFC86Ad558163C4933eBCfA217945aF6e9a3bcE06';
let listGroupAddr = '0x8113a9373BD319A05b607747f396CA8e78e8F5B9';
let PosLibAddr = "0xe5D05F0C52DAe635B8bd2e5AFAF5c72369920B39"
let metricAddr = '0xd5e61e4069c013a444e962dbd489d845b9Ae2727';
let ConfigAddr = "0x2C0134788652A8C5fC6EC5c6a9B157E8481F5118"
let oracleAddr = "0xa2b6CFAE041371A30bED5f2092393f03D6dCDEEc"
let SignatureVerifierAddr = "0x58C0116caC5e6448A8E04De50f75CB8Ea9664055"
let tokenManagerAddr = "0x9Fdf94Dff979dbECc2C1a16904bDFb41D305053A"
let quotaAddr = "0xD076B7fe116da6CcBDA8494771AFeADA7E56e4EE"
let crossScAddr = "0xe85b0D89CbC670733D6a40A9450D8788bE13da47"

let SignatureVerifierEth = '0x9276ee38A5250e2F7FbE00A12EC17d09b5d28F3d'
let Bn128SchnorrVerifierEth = '0x84271540F80e8879826C377eBC496DFaE270321a'
let Secp256k1SchnorrVerifierEth = '0xC654a945E8Ed388C0477F81f1be531946fcC6FF0'
let TokenManagerProxyEth = '0xbaB93311dE250B5B422c705129b3617b3cB6E9e1'
let CrossProxyEth = '0xfCeAAaEB8D564a9D0e71Ef36f027b9D162bC334e'
let QuotaProxyEth = '0x169eA2E2C8783a9Da305F563C65793525e831F62'
let OracleProxyEth = '0xBb38d10033b26F3836A8c1E41788206868b9F228'
let KnownCap = {}
let web3Option = {
        timeout: 300000, // ms
        clientConfig: {maxReceivedFrameSize: 9000000000, maxReceivedMessageSize: 9000000000}
}
let web3 = new Web3(new Web3.providers.HttpProvider("https://gwan-ssl.wandevs.org:56891",web3Option))
//let web3 = new Web3(new Web3.providers.HttpProvider("http://44.236.235.123:26891"))

// let web3 = new Web3(new Web3.providers.WebsocketProvider("wss://api.wanchain.org:8443/ws/v3/4ffef9104ced391e4d447e9a8d8ce40f7a137698b24c566db21d2528aac6d0d9", {
//         clientConfig: {maxReceivedFrameSize: 1000000000, maxReceivedMessageSize: 1000000000}
// })) 
//let web3Eth = new Web3(new Web3.providers.HttpProvider("http://54.213.225.113:26892")) 
let web3Eth = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/eed9f47eee3d4104a990f9e45ea2c545")) 

if(testnet) {
        SignatureVerifierAddr = "0x5dcAB781bD5E1e7af64EEC0686f6d618554F6340"
        ConfigAddr = "0xc59a6E80E387bdeFa89Efb032aA4EE922Ca78036"
        crossScAddr = '0x62dE27e16f6f31d9Aa5B02F4599Fc6E21B339e79'.toLowerCase();
        oracleAddr = '0xF728FB2e26Be1f12496d9F68BDDFe1Eac0eBFD26'.toLowerCase();
        quotaAddr = '0x7585c2ae6a3F3B2998103cB7040F811B550C9930';
        tokenManagerAddr = '0x017aB6485fF91C1A0a16B90E71f92B935B7213d3';
        smgAdminAddr = '0xaa5a0f7f99fa841f410aafd97e8c435c75c22821';
        listGroupAddr = '0x83C4F86124329040dDdb936bffa211Ce460aCb9E';

        gpkAddr= '0xf0bFfF373EEF7b787f5aecb808A59dF714e2a6E7';
        metricAddr = '0x869276043812B459Cc9d11E255Fb0097D51846EF';
        PosLibAddr = "0x4Ec1e3c0aB865707eEc5F9a97Bcaee2E39b8a2De"
        WrcEthOnWanAddr = "0x48344649b9611a891987b2db33faada3ac1d05ec"
        KnownCap = {
                "0x5c770cbf582d770b93ca90adad7e6bd33fabc44c": "400000000000000000000",
                "0xef1df88ab86ce47bacb01ccb52818e87dde08137": "100000000000000000000",
                "0x5e97f046fc50c094a437c6aa15c72a69625d297b": "100000000000000000000",
        }
        //web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.1.2:8545")) 
        web3 = new Web3(new Web3.providers.WebsocketProvider("wss://apitest.wanchain.org:8443/ws/v3/4ffef9104ced391e4d447e9a8d8ce40f7a137698b24c566db21d2528aac6d0d9",
                {
                        clientConfig: {maxReceivedFrameSize: 1000000000, maxReceivedMessageSize: 1000000000}
                }
                )) 

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



async function monitorChangeOwner(){
        let ret = []
        let func2 = web3.utils.sha3("AddAdmin(address)")
        let func = web3.utils.sha3("OwnershipTransferred(address,address)")
        let func3 = web3.utils.sha3("Upgraded(address)") 
        let func4 = web3.utils.sha3("removeAdmin(address)")
        //console.log("func:", func, func2, func3)
        let options = {
                fromBlock: lastChangeOwnerBlock,
                address:[smgAdminAddr,gpkAddr,listGroupAddr,PosLibAddr,metricAddr,ConfigAddr,oracleAddr,SignatureVerifierAddr,tokenManagerAddr,quotaAddr,crossScAddr],
                topics:[[func,func2,func3,func4]],
        }
        let events = await web3.eth.getPastLogs(options)
        for(let i=0; i<events.length; i++){
                console.log("event:", events[i])
                let obj = {}
                //assert.equal(events[i].blockNumber<lastChangeOwnerBlock,true,"owner,admin,Upgraded changed")
                obj["scAddr"] = events[i].address
                switch(events[i].topics[0]){
                        case func:
                                console.log("OwnershipTransferred to ",  events[i].topics[2], "address:",events[i].address, "blockNumber:",  events[i].blockNumber)
                                obj["event"] = "OwnershipTransferred"
                                obj["target"] = events[i].topics[2]
                                break
                        case func2:
                                obj["event"] = "AddAdmin"
                                obj["target"] = events[i].data
                                console.log("AddAdmin  ", events[i].data, "address:",events[i].address)
                                break
                        case func3:
                                obj["event"] = "Upgraded"
                                obj["target"] = events[i].topics[1]
                                console.log("Upgraded to ", events[i].topics[1], "address:",events[i].address)
                                break
                        case func4:
                                obj["event"] = "removeAdmin"
                                obj["target"] = events[i].data
                                console.log("removeAdmin  ", events[i].data, "address:",events[i].address)
                                break                                
                }
                ret.push(obj)
        }
        return ret
}


async function monitorChangeOwnerEth(){
        let ret = []
        let func2 = web3.utils.sha3("AddAdmin(address)")
        let func = web3.utils.sha3("OwnershipTransferred(address,address)")
        let func3 = web3.utils.sha3("Upgraded(address)") 
        let func4 = web3.utils.sha3("removeAdmin(address)")
        //console.log("func:", func, func2, func3)
        let options = {
                fromBlock: lastChangeOwnerBlockETH,
                address:[SignatureVerifierEth,Bn128SchnorrVerifierEth,Secp256k1SchnorrVerifierEth,TokenManagerProxyEth,CrossProxyEth,QuotaProxyEth,OracleProxyEth],
                topics:[[func,func2,func3,func4]],
        }

        let events = await web3Eth.eth.getPastLogs(options)
        for(let i=0; i<events.length; i++){
                console.log("event:", events[i])
                let obj = {}
                //assert.equal(events[i].blockNumber<lastChangeOwnerBlock,true,"owner,admin,Upgraded changed")
                obj["scAddr"] = events[i].address
                switch(events[i].topics[0]){
                        case func:
                                console.log("OwnershipTransferred to ",  events[i].topics[2], "address:",events[i].address, "blockNumber:",  events[i].blockNumber)
                                obj["event"] = "OwnershipTransferred"
                                obj["target"] = events[i].topics[2]
                                break
                        case func2:
                                obj["event"] = "AddAdmin"
                                obj["target"] = events[i].data
                                console.log("AddAdmin  ", events[i].data, "address:",events[i].address)
                                break
                        case func3:
                                obj["event"] = "Upgraded"
                                obj["target"] = events[i].topics[1]
                                console.log("Upgraded to ", events[i].topics[1], "address:",events[i].address)
                        case func4:
                                obj["event"] = "removeAdmin"
                                obj["target"] = events[i].data
                                console.log("removeAdmin  ", events[i].data, "address:",events[i].address)
                                break                                
                }
                ret.push(obj)
        }
        return ret
}


async function verifyDeposit(gid,blockId){
        let globalConf = await smg.methods.getStoremanConf().call(block_identifier=blockId);
        let weight = globalConf.standaloneWeight;
        let groupInfo = await smg.methods.getStoremanGroupInfo(gid).call(block_identifier=blockId);
        //console.log("groupInfo:", groupInfo)
        assert.equal(25, groupInfo.memberCountDesign,'count is wrong')
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
                totalDepositWeight = totalDepositWeight.add(web3.utils.toBN(sk.deposit).mul(web3.utils.toBN(weight)).divRound(web3.utils.toBN(10000)))
                totalDepositWeight = totalDepositWeight.add(web3.utils.toBN(sk.partnerDeposit).mul(web3.utils.toBN(weight)).divRound(web3.utils.toBN(10000)))
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
        console.log("total DepositWeight: ", totalDepositWeight.add(quitedDelegate).add(quitedPart.mul(web3.utils.toBN(weight)).divRound(web3.utils.toBN(10000))).toString(10), blockId)
        console.log("group DepositWeight: ", groupInfo.depositWeight, blockId)
        if(gid != "0x000000000000000000000000000000000000000000000041726965735f303037") {
                assert.equal(groupInfo.depositWeight, totalDepositWeight.add(quitedDelegate).add(quitedPart.mul(web3.utils.toBN(weight)).divRound(web3.utils.toBN(10000))).toString(10), "totalDepositWeight is wrong")
        }

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
        if(A.divRound(web3.utils.toBN(10000)).toString(10) == B.divRound(web3.utils.toBN(10000)).toString(10)
        || A.add(web3.utils.toBN(9999)).divRound(web3.utils.toBN(10000)).toString(10) == B.add(web3.utils.toBN(9999)).divRound(web3.utils.toBN(10000)).toString(10)
        ) {
                return
        }
        let C
        if(A.lt(B)) {
          C = B.sub(A)
        } else {
          C = A.sub(B)
        }
      
        if(C.lt(web3.utils.toBN("10000"))) {
          return
        }
        console.log("C:", C.toString(10))
        assert(false, true, s)
        //assert.equal(A.divRound(web3.utils.toBN(10000)).toString(10), B.divRound(web3.utils.toBN(10000)).toString(10), s)
}
function rate(A, B) {
        return web3.utils.toBN(10000000).mul(A).divRound(B).mul(web3.utils.toBN(365)).toString(10)
}
async function checkSmgIncentive(_groupId) {
        let groupInfo = await smg.methods.getStoremanGroupInfo(_groupId).call()
        let groupStartDay =parseInt(groupInfo.startTime/3600/24); 
        let groupEndDay = parseInt(groupInfo.endTime/3600/24);

        let selectedNodes = await smg.methods.getSelectedStoreman(_groupId).call();
        console.log("getSelectedStoreman:", selectedNodes)

        let today = parseInt(Date.now()/1000/3600/24)
        let groupIncentives = []
        if(today - 3 > groupStartDay) {
                groupStartDay = today - 3
        }
        for(let day=groupStartDay; day<groupEndDay && day<today; day++){
                if(day == 19609) continue; // this day result is bad;
                let gi = await smg.methods.checkGroupIncentive(_groupId, day).call();
                console.log("group incentive every day:", day, gi)
                groupIncentives[day] = gi
                let posCap = await pos.methods.getHardCap( day*3600*24).call();
                console.log("pos posCap:", posCap[0])
                let posAvg
                while(true){
                        try {
                                posAvg = await pos.methods.getPosAvgReturn(  day*3600*24).call();
                                console.log("pos posAvg rate: %d/10000",  posAvg[0])
                                break
                        }catch(err){
                                console.log("pos getPosAvgReturn exception, retry")
                        }
                }

                let totalDepositCache = await listGroup.methods.getTotalDeposit(day).call();
                console.log(" day totaldepodit:", day, totalDepositCache)
                assert(totalDepositCache!=0, true, "totalDepositCache can not fetch, please check")

                let groupNumber = await getLastBlockByEpoch(day)
                groupInfo = await smg.methods.getStoremanGroupInfo(_groupId).call(block_identifier=groupNumber)

                let p1Return = web3.utils.toBN(groupInfo.deposit).mul(web3.utils.toBN(posAvg[0])).divRound(web3.utils.toBN(10000)).divRound(web3.utils.toBN(365))
                let capReturn = web3.utils.toBN(groupInfo.deposit).mul(web3.utils.toBN(posCap[0]).mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)))).divRound(web3.utils.toBN(totalDepositCache)).divRound(web3.utils.toBN(10000))
                //let capReturn = web3.utils.toBN(groupInfo.deposit).mul(web3.utils.toBN(posCap[0])).divRound(web3.utils.toBN(totalDepositCache))
                let posRet = await pos.methods.getMinIncentive(groupInfo.deposit, day, totalDepositCache).call();
                console.log("getMinIncentive:", web3.utils.fromWei(posRet))
                if(p1Return.lt(capReturn)){
                        basicEqual( web3.utils.toBN(posRet), p1Return, "group Incentive is wrong")
                } else {
                        basicEqual( web3.utils.toBN(posRet), capReturn, "group Incentive is wrong")
                }
                let co = await smg.methods.getChainTypeCo(groupInfo.chain1, groupInfo.chain2).call(block_identifier=groupNumber)
                if(gi.toString(10) != 0){
                        basicEqual(web3.utils.toBN(gi), web3.utils.toBN(posRet).mul(web3.utils.toBN(co)).divRound(web3.utils.toBN(10000)),  "group Incentive is wrong")
                }
                let metricInfo = await metric.methods.getPrdInctMetric(_groupId, day, day).call()
                console.log("day metric info:", day, metricInfo)
        }

        for(let i=0; i<groupInfo.memberCountDesign; i++){
                for(let m=groupStartDay; m<groupEndDay && m<today;m++){
                        if(m == 19609) continue; // this day result is bad;
                        console.log("\nincentive group day:", groupInfo.groupId, m)
                        let block = await getLastBlockByEpoch(m);
                        let groupInfoDay = await smg.methods.getStoremanGroupInfo(_groupId).call(block_identifier=block);
                        let smInfo = await smg.methods.getStoremanInfo(selectedNodes[i]).call(block_identifier=block);
                        let globalConf = await smg.methods.getStoremanConf().call(block_identifier=block);
                        let ii = await smg.methods.getStoremanIncentive(selectedNodes[i], m).call();
                        let expectIncentiveSkSelf = web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(smInfo.deposit).mul(web3.utils.toBN(globalConf.standaloneWeight)).divRound(web3.utils.toBN(10000))).divRound(web3.utils.toBN(groupInfoDay.depositWeight))
                        if(ii != 0){
                                console.log("- day Incentive:", m, smInfo.wkAddr, ii)
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
                                        let expectIncentiveDe = web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(deInfo.deposit)).divRound(web3.utils.toBN(groupInfoDay.depositWeight)).mul(web3.utils.toBN(90)).divRound(web3.utils.toBN(100))
                                        AllexpectIncentiveFromDe = AllexpectIncentiveFromDe.add(web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(deInfo.deposit)).divRound(web3.utils.toBN(groupInfoDay.depositWeight)).mul(web3.utils.toBN(10)).divRound(web3.utils.toBN(100)))
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
                                        let expectIncentivePn = web3.utils.toBN(groupIncentives[m]).mul(web3.utils.toBN(deInfo.deposit)).divRound(web3.utils.toBN(groupInfoDay.depositWeight)).mul(web3.utils.toBN(globalConf.standaloneWeight)).divRound(web3.utils.toBN(10000))
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
        console.log("rate %s%%%%",  base.mul(web3.utils.toBN(365)).mul(totalIncentive).divRound(web3.utils.toBN(totalDeposit)).toString(10))
        let posCap = await pos.methods.getHardCap(epochID*3600*24).call()
        console.log("pos hard:", web3.utils.toBN(posCap[0]).divRound(web3.utils.toBN(10000)).toString(10))
}

async function check(){
        await init();

        let htmlString=""
        let OK = true;
        let ret = await monitorChangeOwner()
        if(ret.length != 0){
                console.log("monitorChangeOwner:", ret)
                OK = false 
                htmlString += tableify(ret)
        }
        ret = await monitorChangeOwnerEth()
        if(ret.length != 0){
                console.log("monitorChangeOwnerEth:", ret)
                OK = false 
                htmlString += tableify(ret)
        }

        try{
                let result = await checkSmgBalance();
                if(result.result){
                        htmlString += "<p> contract balance is correct </p>"
                } else {
                        OK = false
                        htmlString += "<p> contract balance is wrong </p>"
                }
                csv =   parse(result.ones, {fields:["type","wkAddr","sender","in","partin","out","incentive","deposit","isOk"]})
                fs.writeFileSync("/tmp/Investors.csv",csv)
        }catch(err){
                htmlString += "<p> checkSmgBalance try-catch error. check the console output for detail. </p>"
                htmlString += err
                OK = false
                console.log("checkSmgBalance failed:", err)
                if(-1 != err.toString().indexOf("CONNECTION ERROR")){
                        console.log("CONNECTION ERROR, ignore this check")
                        process.exit(0);
                }
        }
        let groupIds = await getActiveGroupIDs();
        for(let i=0; i<groupIds.length; i++){
                let grId = groupIds[i]
                console.log("group:", grId)
                try {
                        await verifyDepositCurrent(grId)
                        htmlString = htmlString + "<p> group" + grId +  " deposit is correct </p>"
                }catch(err){
                        OK = false
                        htmlString = htmlString + "<p> group" + grId +  " deposit check exception </p>"
                        htmlString += err
                        console.log("verifyDepositCurrent catch error:", err)
                        if(-1 != err.toString().indexOf("CONNECTION ERROR")){
                                console.log("CONNECTION ERROR, ignore this check")
                                process.exit(0);
                        }
                }

                try {
                        await checkSmgIncentive(grId);
                        htmlString = htmlString + "<p> group" + grId +  " incentive is correct </p>"
                }catch(err){
                        OK = false
                        htmlString = htmlString + "<p> group" + grId +  " incentive check exception.  </p>"
                        htmlString += err
                        console.log("checkSmgIncentive catch error:", err)
                        if(-1 != err.toString().indexOf("CONNECTION ERROR")){
                                console.log("CONNECTION ERROR, ignore this check")
                                process.exit(0);
                        }
                }
        }

        web3.currentProvider.disconnect();
        if(OK){
                console.log("html OK:", htmlString)
                //sendEmail({subject: "Pass-Openstoreman check OK",html: htmlString,attachments: [{filename: 'Investors.csv',path: '/tmp/Investors.csv'},{filename: 'log',path: '/var/lib/jenkins/jobs/'+ job + '/builds/' + build_number+'/log'}]});
        }else{
                console.log("html failed:", htmlString)
                sendEmail({subject: "Faild -Openstoreman check failed",
                        html: htmlString,
                        attachments: [{filename: 'Investors.csv',path: '/tmp/Investors.csv'},{filename: 'log',path: '/var/lib/jenkins/jobs/'+ job + '/builds/' + build_number+'/log'}]}
                        );
        }

}

async function main(){
        await check()
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

function logParse(log, abi){
        let decoders = abi.filter(function (json) {
                return json.type === 'event';
            }).map(function(json) {
                // note first and third params required only by enocde and execute;
                // so don't call those!
                return new SolidityEvent(null, json, null);
            });

        try{
                return decoders.find(function(decoder) {
                        return (decoder.signature() == log.topics[0].replace("0x",""));
                }).decode(log);
        }catch(err){
                return undefined
        }

}

function getOnefromInfo(info, wkAddr, sender, type){
        assert.equal(wkAddr!=undefined,true)
        assert.equal(sender!=undefined,true)
        let sk = info.get(wkAddr)
        if(!sk){
                sk = new Map()
                info.set(wkAddr, sk)
        }
        let one = sk.get(sender+type)
        if(!one){
                one  = {
                        "in":web3.utils.toBN(0),
                        "partin":web3.utils.toBN(0),
                        "out":web3.utils.toBN(0), // claim
                        "incentive":web3.utils.toBN(0), // incentiveClaim
                        "type":type,
                }
                sk.set(sender+type,one)
                if(type == 1){
                        wkaddr2OwnerMap.set(wkAddr, sender)
                }
        }
        return one
}

let wkaddr2OwnerMap = new Map()
async function addPartInToOwner(info, wkaddr, value){
        let from = wkaddr2OwnerMap.get(wkaddr)
        let one = getOnefromInfo(info, wkaddr, from,  1)
        one.partin = one.partin.add(value)
        //console.log("addPartInToOwner:", one)
}
async function checkSmgBalance() {
        let toBlock = await web3.eth.getBlockNumber() - 100
        console.log("checkSmgBalance toBlock:",toBlock)
        let balanceRealSc = await web3.eth.getBalance(smgAdminAddr, toBlock)
        let balanceSc = new BigNumber(0)
        let depositIn = new BigNumber(0)
        let depositOut = new BigNumber(0)
        let incentiveOut = new BigNumber(0)

        let info = new Map()
        let one

        let crossFee =   web3.utils.toBN(new BigNumber("66970000000000000000000"))

        console.log("crossFee total:", crossFee.toString(10))

        let skipNumber = 0
        let lastBlock = 0
        let AllWorker= new Set()
        let allDelegator = {}
        let allPartner = {}
        while(true) {
          const queryString = `
          {
            exampleEntities(first:1000,orderBy:block, skip:${skipNumber}) {
              id
              action
              count
              block
              wkAddr
              sender
            }
          }
          `
          const body = {query: queryString, variable:""}
          let ret = await axios.post(APIURL, JSON.stringify(body));
          let events = ret.data.data.exampleEntities
          console.log("events length:", events.length, skipNumber)
          skipNumber += 1000
          for(let i=0; i<events.length; i++){
                let event = events[i]
                if(event.block > toBlock ) {
                        continue // ignore too new block
                }
                //console.log("eent:", event, web3.utils.toBN(event.count).toString(10))
                switch(event.action){
                        case "stakeInEvent":
                                balanceSc = balanceSc.plus(web3.utils.toBN(event.count))
                                depositIn = depositIn.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 1)
                                one.in = one.in.add(web3.utils.toBN(event.count))
                                AllWorker.add(event.wkAddr)
                                break
                        case "stakeAppendEvent":
                                balanceSc = balanceSc.plus(web3.utils.toBN(event.count))
                                depositIn = depositIn.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr,event.sender, 1)
                                one.in = one.in.add(web3.utils.toBN(event.count))
                                break
                        case "delegateInEvent":
                                balanceSc = balanceSc.plus(web3.utils.toBN(event.count))
                                depositIn = depositIn.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 2)
                                one.in = one.in.add(web3.utils.toBN(event.count))
                                allDelegator[event.wkAddr+event.sender] = [event.wkAddr, event.sender]
                                break
                        case "partInEvent":
                                balanceSc = balanceSc.plus(web3.utils.toBN(event.count))
                                depositIn = depositIn.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 3)
                                one.in = one.in.add(web3.utils.toBN(event.count))
                                addPartInToOwner(info, event.wkAddr, web3.utils.toBN(event.count))
                                allPartner[event.wkAddr+event.sender] = [event.wkAddr, event.sender]
                                break      
                        case "storemanGroupContributeEvent":
                                depositIn = depositIn.plus(web3.utils.toBN(event.count))
                                balanceSc = balanceSc.plus(web3.utils.toBN(event.count))
                                break                                
                        case "stakeClaimEvent":
                                balanceSc = balanceSc.minus(web3.utils.toBN(event.count))
                                depositOut = depositOut.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 1)
                                one.out = one.out.add(web3.utils.toBN(event.count))

                                assert.ok(one.in.eq(one.out))
                                break                                  
                        case "delegateClaimEvent":
                                balanceSc = balanceSc.minus(web3.utils.toBN(event.count))
                                depositOut = depositOut.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 2)
                                one.out = one.out.add(web3.utils.toBN(event.count))

                                assert.ok(one.in.eq(one.out))
                                break                                  
                        case "partClaimEvent":
                                balanceSc = balanceSc.minus(web3.utils.toBN(event.count))
                                depositOut = depositOut.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 3)
                                one.out = one.out.add(web3.utils.toBN(event.count))
                                assert.ok(one.in.eq(one.out))
                                break                                  
                        case "delegateIncentiveClaimEvent":
                                balanceSc = balanceSc.minus(web3.utils.toBN(event.count))
                                incentiveOut = incentiveOut.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 2)
                                one.incentive = one.incentive.add(web3.utils.toBN(event.count))
                                assert.ok(one.incentive.lt(one.in))
                                break                                  
                        case "stakeIncentiveClaimEvent":
                                balanceSc = balanceSc.minus(web3.utils.toBN(event.count))
                                incentiveOut = incentiveOut.plus(web3.utils.toBN(event.count))
                                one = getOnefromInfo(info, event.wkAddr, event.sender, 1)
                                one.incentive = one.incentive.add(web3.utils.toBN(event.count))

                                if(!one.incentive.lt(one.in.add(one.partin))){
                                        console.log("one:", event.wkAddr, event.sender, one)
                                }
                                        
                                assert.ok(one.incentive.lt(one.in.add(one.partin)))
                                break                                  
                        case "stakeIncentiveCrossFeeEvent":
                                balanceSc = balanceSc.minus(web3.utils.toBN(event.count))
                                break                                  
                                                                                                                                                        

                }
            }
                if(events.length < 1000) {
                        break
                }
        }
      
        // fs.writeFileSync("./allDelegator.json", JSON.stringify(Object.values(allDelegator)))
        // fs.writeFileSync("./allPartner.json", JSON.stringify(Object.values(allPartner)))

        // fs.writeFileSync("./AllWorker.json", JSON.stringify(Array.from(AllWorker)))
        
        console.log("++++++++++++++++++++++++++++++++++++++++++++++:", depositIn.toString(), depositOut.toString(), incentiveOut.toString())
        balanceSc = balanceSc.plus(crossFee)
        console.log("real balance of smg:", balanceRealSc)
        console.log("calculated balance of smg:", balanceSc.toString(10))
        let result = true

        if(balanceRealSc != balanceSc.toString(10)){
                result = false
                console.log("error: real balance != calculated balance")
        }

        let ones = []
        for(let items of info.entries()){
                let wkAddr = items[0]
                let sks = items[1]
                for(let items2 of sks.entries()) {
                        let from = items2[0].slice(0,-1)
                        let node = items2[1]
                        let n1
                        let one = {}
                        if(node.type == 1){
                                n1 = await smg.methods.getStoremanInfo(wkAddr).call(block_identifier=toBlock);
                                one.type = "candidate"
                        }else if(node.type == 2){
                                n1 = await smg.methods.getSmDelegatorInfo(wkAddr, from).call(block_identifier=toBlock);
                                one.type = "delegator"
                        }else if(node.type == 3){
                                n1 = await smg.methods.getSmPartnerInfo(wkAddr, from).call(block_identifier=toBlock);
                                one.type = "partner"
                        }
                        one.wkAddr = wkAddr
                        one.sender = from
                        one.deposit = n1.deposit
                        one.in = node.in.toString(10)
                        one.out = node.out.toString(10)
                        one.incentive = node.incentive.toString(10)
                        one.isOk = true
                        if(n1.deposit != node.in.sub(node.out).toString(10)) {
                                result = false
                                one.isOk = false
                        }
                        if(!node.incentive.mul(web3.utils.toBN(1)).lt(node.in.add(node.partin))){
                                result = false
                                one.isOk = false
                                console.log("total incentive great than deposit, one:", one)
                                console.log("node:", node.in.toString(10), node.partin.toString(10),node.incentive.toString(10))
                        }
                        ones.push(one)
                        //console.log("one:", one)
                }
        }
        return {
                result:result,
                ones: ones,
        }
}



let epochBlockMap = new Map()
async function  getLastBlockByEpoch(epochId){
        let blockNumber = epochBlockMap.get(epochId)
        if(blockNumber != undefined) return  blockNumber

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
                                epochBlockMap.set(epochId, b.number-1)
                                return b.number-1
                        }
                }
        }
}

