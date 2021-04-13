let puppeteer=require("puppeteer");
let {codes}=require("./codes");
let {password,email}=require("./secrets.js");
//all puppeteer methods are async and require promises
(async function(){
    try{
        let browserinstance= await puppeteer.launch({
            //below info is got from official puppeteer docs
            headless:false,
            defaultViewport: null ,  //View size is reset from default values of 800*600
            args: ["--start-maximized"],
            // slowMo: 100
        });
        let newTab=await browserinstance.newPage();
        await newTab.goto("https://www.hackerrank.com/auth/login?h_l=body_middle_left_button&h_r=login");
        await newTab.type("#input-1",email, {delay:200}) 
        await newTab.type("#input-2",password,{delay:200});
        await newTab.click("button[data-analytics='LoginPassword']");
        await newTab.waitForNavigation({waitUntil: "networkidle0"});
        await waitAndClick(".card-content h3[title='Interview Preparation Kit']",newTab);
        await waitAndClick("a[data-attr1='warmup']",newTab);
        let url=newTab.url();

        for(let i=0;i<codes.length;i++){
            await questionSolver(url,codes[i].soln,codes[i].qName,newTab);
        }
        console.log("Task completed");
    }catch(error){
        console.log(error);
    }  
})()
async function waitAndClick(selector,gtab){
     //we are skipping wait for navigation here and going directly to selector wait
        await gtab.waitForSelector(selector,{visible:true});
        return selectorclickpromise=gtab.click(selector);   
}
async function questionSolver(url, code, questionname,gtab){
    await gtab.goto(url);
    //click as per question name
    await gtab.evaluate(browserconsolefn,questionname);
    //initially typing ans in custom input
    await waitAndClick(".checkbox-input",gtab)
    await gtab.type("#input-3",code)
    await gtab.keyboard.down("Control");
    await gtab.keyboard.press("a");
    await gtab.keyboard.press("x");
    await gtab.keyboard.up("Control");
    //copy paste code ans in editor
    await gtab.click(".hr-monaco-editor-parent");
    await gtab.keyboard.down("Control");
    await gtab.keyboard.press("a");
    await gtab.keyboard.press("v");
    await gtab.keyboard.up("Control");
    //click submit
    await gtab.click(".pull-right.btn.btn-primary.hr-monaco-submit");
}
function browserconsolefn(questionname){
    let allh4Ele=document.querySelectorAll("h4"); 
    let textarr=[];
    for(let i=0;i<allh4Ele.length;i++){
        let text=allh4Ele[i].innerText.split("\n")[0];
        textarr.push(text);
    }
    
    let idx = textarr.indexOf(questionname);
    allh4Ele[idx].click();
}