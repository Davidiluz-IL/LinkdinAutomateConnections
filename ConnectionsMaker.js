const puppeteer = require('puppeteer');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let doneWithPage=0
  let BtnsToJumpInCurrentPage=0
  async function SendOneRequest(page){
    try{
      [doneWithPage,BtnsToJumpInCurrentPage] = await page.evaluate(async(doneWithPage,BtnsToJumpInCurrentPage)=>{
        await delay(850)
        let ConnectsBtns =[...document.querySelectorAll("button")].filter(e=>e.textContent.includes("Connect") && !e.textContent.includes("Connections") )
        if(ConnectsBtns.length==0+BtnsToJumpInCurrentPage)
          {
            return [1,BtnsToJumpInCurrentPage]
          }
          console.log(`${ConnectsBtns.length} and ${BtnsToJumpInCurrentPage}`)
        ConnectsBtns[BtnsToJumpInCurrentPage].click()
        await delay(850)
        if(document.querySelector("#send-invite-modal"))
          {if(document.querySelector("#send-invite-modal").textContent.includes("You can customize this invitation"))
            {document.querySelector('button[aria-label="Send now"]').click()}
            else if(document.querySelector("#send-invite-modal").textContent.includes("How do you know"))
            {BtnsToJumpInCurrentPage++;
              document.querySelector('button[aria-label="Dismiss"]').click()
              return [0,BtnsToJumpInCurrentPage]
            }
          else
            document.querySelector('button[aria-label="Dismiss"]').click()
            // BtnsToJumpInCurrentPage++
            return [0,BtnsToJumpInCurrentPage]
          }
        else
        document.querySelector('button[aria-label="Dismiss"]').click()
        return [0,BtnsToJumpInCurrentPage]
    },doneWithPage,BtnsToJumpInCurrentPage)

  }
    catch(e){
      doneWithPage=1
      console.log(e)}
  }

  async function SendConnectionsToAllPage(page){
    while(doneWithPage==0){
      await SendOneRequest(page)
    }
    console.log("done with page ")
  }

  let PageNumber=1
  async function ClickNextPage(page){
    doneWithPage=0
    BtnsToJumpInCurrentPage=0
    try{
    PageNumber = await page.evaluate(async()=>{
      await delay(500)
      document.querySelector('body').scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      await delay(300)
      let pageBtns = document.querySelectorAll('[data-test-pagination-page-btn] button')
      console.log(document.querySelectorAll('[data-test-pagination-page-btn] button'))
      for(let i=0;i<pageBtns.length;i++){
        if(pageBtns[i].getAttribute("aria-current"))
          {
            pageBtns[i+1].click()
            return
          }
      }
  })
  await delay(2000)
  await page.waitForSelector('[class="entity-result__universal-image"]')
}
catch(e){console.log(e)}

}

(async () => {
    const browser = await puppeteer.launch({
        userDataDir: 'LnkDinChrome',
        headless: false,
        defaultViewport: null}); // default is true

  const page = await browser.newPage();
  await page.exposeFunction("delay", delay);
  let Serach ="HR"
  await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${Serach}&page=12`,{waitUntil: "networkidle2"});


  for(let pages=0;pages<12;pages++)
      {
        try{
        await SendConnectionsToAllPage(page)
        await delay(300)
        await ClickNextPage(page)
        }catch(e){}
      }

})();

