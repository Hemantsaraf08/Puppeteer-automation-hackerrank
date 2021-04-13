const puppeteer = require('puppeteer');
let {password,email}=require("./secrets.js");

(async function(){
    try{
        let browser=await puppeteer.launch({
            headless:false,
            slowMo: 1,
            defaultViewport: null,
            args: ["--start-maximized"]
        })
        let tab=await browser.newPage();
        await tab.goto("https://www.hackerrank.com/auth/login?h_l=body_middle_left_button&h_r=login");
        await tab.type("#input-1",email, {delay:0});
        await tab.type("#input-2",password,{delay:0});
        await tab.click("button[data-analytics='LoginPassword']");
        await tab.waitForNavigation({waitUntil: "networkidle0"});
        await waitAndClick(".card-content h3[title='Interview Preparation Kit']",tab);
        await waitAndClick("a[data-attr1='warmup']",tab);
        await tab.waitForSelector(".content--list_body");
        await tab.waitForSelector("h4");
        let url=tab.url();
        questionandback(tab);
        // await browser.close();
    }
    catch(err){
        console.log(err);
    }
    
})();

async function waitAndClick(selector,gtab){
    //we are skipping wait for navigation here and going directly to selector wait
       await gtab.waitForSelector(selector,{visible:true});
       return selectorclickpromise=gtab.click(selector);   
}
function browserconsolerun(idx){
    let a=document.querySelectorAll("h4");
    a[idx].click();
    // let textarr=[];
    // for(let i=0;i<a.length;i++){
    //     let t=a[i].innerText.split("\n"
    //     console.log(t);
    //     textarr.push(t);
    // }
    // console.log(textarr);
    // return textarr;
    // for(let i=0;i<allQarr.length-1;i++){
    //     await allQarr[i].click();
    // }
}
async function questionandback(tab){
    let noofQs= await tab.evaluate(()=>{
        let a=document.querySelectorAll("h4");
        return a.length;
    });
    console.log(noofQs);
    for(let i=0;i<noofQs-1;i++){
        await tab.evaluate((i)=>{
            let a=document.querySelectorAll("h4");
            a[i].click();
        });
        await tab.waitForNavigation({waitUntil: "networkidle0"});
        await tab.goBack();
    }   
}