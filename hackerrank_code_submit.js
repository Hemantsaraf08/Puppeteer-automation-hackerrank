let puppeteer=require("puppeteer");
let {codes}=require("./codes");
let {password,email}=require("./secrets.js");
//all puppeteer methods are async and require promises
let gtab;       //gtab is set in global ec, later it will hold the val of newTab created
let broweserWillOpenPromise=puppeteer.launch({
    //below info is got from official puppeteer docs
    headless:false,
    defaultViewport: null ,  //View size is reset from default values of 800*600
    args: ["--start-maximized"]
})
broweserWillOpenPromise     //browserwillbeopenpromise obj will have status and data or outcome or val
                            //when we use "then" method we know that status will be settled, but data/val/outcome will have to passed to 
                            //then function (then callback function)
    //the functions newPage(), goto(), type() are inbuilt in puppeteer, and can be got through https://flaviocopes.com/puppeteer/
    //note that some methods are only page like goto(), and some on browserinstance like newPage
    //like wise type is also applied on page(here gtab)
    .then(function(browserinstance){
        let newpagepromise=browserinstance.newPage();
        //new page returns Puppeteer page obj as promise
        return newpagepromise;
    }).then(function(newTab){
        let loginpagewillbeopenedpromise=newTab.goto("https://www.hackerrank.com/auth/login?h_l=body_middle_left_button&h_r=login")
        //goto returns HTTP response (not a page) in its promise obj, therefore we can't pass it as parameter to our call back function
        gtab=newTab;    //from now on gtab means newTab WHICH IS AT hackerrank login page
        return loginpagewillbeopenedpromise;
    }).then(function(){
        let emailwillbetypedpromise=gtab.type("#input-1",email, {delay:200})
        return emailwillbetypedpromise;        
    }).then(function(){
        let passwordwillbetypedpromise=gtab.type("#input-2",password,{delay:200});
        return passwordwillbetypedpromise;
    }).then(function(){
        let loginpagewillbeclickedpromise=gtab.click("button[data-analytics='LoginPassword']");
        // ABOVE CLICK RESULTS IN NAVIGATION: means change in url
        //we wait because only click is done that doesn't mean we have reached next page, it takes time for server response
        let combinedpromise=Promise.all([loginpagewillbeclickedpromise,
            gtab.waitForNavigation({waitUntil: "networkidle0"})])
            //networkidle0 is used for simple dynamic website,
            //networkidle2 is used for dynamic website
            return combinedpromise;
    })
    .then(function(){
        //instead of writing the combined promise code as above we can write a promisified function and call it
        let clickedpromise= waitAndClick(".card-content h3[title='Interview Preparation Kit']");
        return clickedpromise;
    }).then(function(){
        let clickedpromise= waitAndClick("a[data-attr1='warmup']");
        return clickedpromise;
    }).then(function(){
        return gtab.url();
    }).then(function(url){
        // console.log(url);
        //implementing serial promises code using for loop and chaining the promise returned by then
        //step1: get a promise obj. step2.: attach then to it in for loop
        let firstqsolvepromise= questionSolver(url,codes[0].soln,codes[0].qName);
        
        for(let i=1;i<codes.length;i++){
            firstqsolvepromise=firstqsolvepromise.then(function(){
                return questionSolver(url,codes[i].soln,codes[i].qName);
            })
        }
        //for the last promise i.e. when i==codes.length-1; we don't have to put a then statement after the 
        //for loop becoz their is no data/val returned by questionSolver which needs to be passed to the then callback
        //so that your work is display, here ask their is no data in the resolve of questionSolver, so no need of additional then
        return firstqsolvepromise;      //if not put Task completed will be printed before the task is completed;
        //becoz it will take undefined'
    }).then(function(){
        console.log("Task completed");
    })
    .catch(function(err){
        console.log(err);
    })
    //promisified function wait and click
    function waitAndClick(selector){
        return new Promise(function (resolve, reject){

            //we are skipping wait for navigation here and going directly to selector wait
            let selectorwaitpromise=gtab.waitForSelector(selector,{visible:true});
            selectorwaitpromise.then(function(){
                let selectorclickpromise=gtab.click(selector);
                return selectorclickpromise;
            }).then(function(){
                resolve();
            }).catch(function(){
                reject(err);
            })
        })
    }
    //questionsolver is also a promisified function
    function questionSolver(url,code, questionname){
        return new Promise(function(resolve,reject){
            let reachedpageurlpromise=gtab.goto(url);
            reachedpageurlpromise.then(function(){
                //if we scan the page we find that question name in under selector h4
                 //  page h4 -> matching h4 -> click 
                // function will exceute inside the browser console
                function browserconsolerunFn(questionname){
                    let allh4Ele=document.querySelectorAll("h4");   //a dom function like find all
                    //extracting question name string below and storing it in textarr
                    let textarr=[];
                    for (let i = 0; i < allh4Ele.length; i++) {
                        let myQuestion = allh4Ele[i].innerText.split("\n")[0];     //innertext is also a dom function
                        //we are spliting it because if we run above lines in browser console we find that it has additional texts 
                        //spliting and storing the first element in myQuestion
                        textarr.push(myQuestion);
                    }

                    //now we know that textarr has many question name but we want to click on a specific question and submit it
                    //therefore we get index
                    let idx = textarr.indexOf(questionname);
                    // console.log("hello"); //this hello will be printed on browser console and not in vs code as we have passed browserconsolefn in evaluate as a parameter
                    allh4Ele[idx].click(); //clicking the relevant question
                }
                //Syntax of page.evaluate(function_on_br_console, param1,param2,...) param1, param2 is passed to function_on_br_console
                let pageClickPromise =gtab.evaluate(browserconsolerunFn, questionname); //evaluate is puppeteer functin that helps us to do things ON/FROM a browser console
                return pageClickPromise
                }).then(function(){
                    //first we will type code in custon input box of hackerrank website and then paste it back to editor
                    return waitAndClick(".custom-checkbox.inline")
                }).then(function (){
                    return gtab.type(".custominput",code)
                }).then(function(){
                    return gtab.keyboard.down("Control");
                }).then(function(){
                    return gtab.keyboard.press("a");
                }).then(function(){
                    return gtab.keyboard.press("x");
                }).then(function(){
                    return gtab.click(".hr-monaco-editor-parent");
                }).then(function(){
                    return gtab.keyboard.press("a");
                }).then(function(){
                    return gtab.keyboard.press("v");
                }).then(function(){
                    return gtab.click(".pull-right.btn.btn-primary.hr-monaco-submit");
                }).then(function(){
                resolve();
                }).catch(function(){
                reject(err);
                })
        })
    }