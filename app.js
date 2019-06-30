const fs = require("fs");
const path = require("path");
const url = require("url");
const JSDOM = require("jsdom").JSDOM;

let count = 0;
let countImg = 0;


// let strOne = "https://read.qidian.com/chapter/-EkNsrL0lYdMWSz3e5zy7Q2/3zSddV1MfhPwrjbX3WA1AA2";
// let strTwo = "https://huaban.com/favorite/beauty/";
// let strThress = "https://www.7160.com/rentiyishu/36671/";
// let strFour = "https://www.7160.com/qingchunmeinv/";
// let str5 = "http://www.win4000.com/meitu.html";
let str5 = "http://www.win4000.com/mt/dilireba.html";

GetUrl(str5, (bufferData, strData) => {
    let imgSrc = [];
    let DOM = new JSDOM(`${strData}`);
    // let myHtml = DOM.window.document.querySelectorAll(".container img");
    let myHtml = DOM.window.document.querySelectorAll("body a img");
    // console.log(myHtml.getAttribute("src"),typeof myHtml);//获取src使用getAttribute方法
    for (const key in myHtml) {
        if (myHtml.hasOwnProperty(key)) {
            const element = myHtml[key];
            imgSrc.push(element.getAttribute("src"))
        } else {
            console.log("图片获取失败！！！");
        }
    }
    // console.log(imgSrc);
    GetImgs(imgSrc,"myimgpath");
});


/**
 * 创建目录函数的封装
 * @param {目录名称} str 
 */
function MakeDir(str) {
    let imgPath = "";
    fs.mkdir(str, () => {
        console.log("创建目录成功！");
    });

    imgPath = path.join(__dirname, "./" + str);
    return imgPath;
}


/**
 * 获取图片方法封装
 */
function GetImgs(imgSrc,myImgPath) {
    let imgPath = MakeDir(myImgPath + GetRandomNum(3, 10000));
    let test = [];
    for (let index = 0; index < imgSrc.length; index++) {
        GetUrl(imgSrc[index], (bufferData, strData) => {
            fs.writeFile(imgPath + "/beauty" + GetRandomNum(1, 1000) + ".jpg", bufferData, 'utf8', () => {
                countImg++;
                console.log("图片下载张数：", countImg);
            });
        });
    }
}


/**
 * 生成随机数函数封装
 * @param {最小值} Min 
 * @param {最大值} Max 
 */
function GetRandomNum(Min, Max) {
    let Range = Max - Min;
    let Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}


/**
 * 将链接处理过程封装成函数
 * @param {*} oUrl 
 * @param {*} success 
 */
function GetUrl(oUrl, success) {
    let urlObj = url.parse(oUrl);
    let http = "";

    count++;
    //请求的协议类型判断
    if (urlObj.protocol == "http:") {
        http = require("http");
    } else {
        http = require("https");
    }

    //创建请求，访问一个服务器
    let req = http.request({
        //注意不需要带http协议
        'hostname': urlObj.hostname,
        'path': urlObj.path
    }, res => {
        if (res.statusCode == 200) {
            let arr = [];
            let str = "";
            //request默认以post方式访问，数据需要以on方式获取
            res.on("data", buffer => {
                arr.push(buffer);
                str += buffer;
            });

            res.on("end", () => {
                let bufferObj = Buffer.concat(arr);
                success && success(bufferObj, str);
            });
        } else if (res.statusCode == 302 || res.statusCode == 301) {
            console.log("第${count}次重定向", res.headers.location);
            GetUrl(res.headers.location, success);
        }
    });

    req.on("error", (err) => {
        console.log("404，出错了！", err);
    })
    req.end();
}
