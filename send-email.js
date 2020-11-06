var nodemailer = require('nodemailer');
var rot13 = require('rot-13');
var fs = require("fs");

module.exports.sendEmail = function (options) {
    //if(!options){
    //    throw new Error("Options can not be null");
    //}else if(!options.auth){
    //    throw new Error("Options.auth{user,pass} can not be null");
    //}else if(!options.auth.user || !options.auth.pass){
    //    throw new Error("Options.auth.user or Options.auth.password can not be null");
    //}

    var transporter = nodemailer.createTransport({
        host: options.host || 'smtp.office365.com', // Office 365 server
        port: options.port || 587,     // secure SMTP

        secure:options.secure || false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: {
            user: "jenkins@wanchain.org",
            pass: smtp_pwd()
        }, 
        tls: options.tls || {ciphers: 'SSLv3'}
    });

    transporter.sendMail({
        from: options.from || 'jenkins@wanchain.org',
        to: options.to || 'guowei@wanchain.org,weijia@wanchain.org,guowu@wanchain.org,guowei@wanchain.org,zhanli@wanchain.org',
        //to: options.to || 'shuchao@wanchain.org',
        cc: options.cc || '',
        subject: options.subject,
        text:options.text,
        html:options.html,
        attachments:options.attachments
    }, function (err, info) {
        if (err) {
            console.log('Error: ' + err);
        }else {
            console.log(info);
        }

        return process.exit(0);
    });
}

function smtp_pwd() {
    pwd = fs.readFileSync(".smtp.pwd", "utf8");

    pwd_decode_rot13 = rot13(pwd);
    pwd_decode_b64 = new Buffer(pwd_decode_rot13, 'base64').toString("ascii");

    return pwd_decode_b64;
}
