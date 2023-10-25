import puppeteer from "puppeteer";

export async function aseo_smc(municipality,rol,dv){


try{
  // measurement_date info
  const fechaActual = new Date();

  const dia = fechaActual.getDate();
  const mes = fechaActual.getMonth() + 1;
  const año = fechaActual.getFullYear();
  const hora = fechaActual.getHours();
  const minutos = fechaActual.getMinutes();
  const segundos = fechaActual.getSeconds();

  const fechaFormateada = `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

  // Puppeteer process
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage()
  await page.deleteCookie();

  const url=`https://pago.smc.cl/pagoAseov2/muni/${municipality}.aspx`

  await page.goto(url,{timeout:20000});
  await page.waitForSelector('#ctl00_ContentPlaceHolder1_txtRol',{timeout:5000})
  await page.type('#ctl00_ContentPlaceHolder1_txtRol',rol)
  await page.type('#ctl00_ContentPlaceHolder1_txtRol2',dv)
  await page.click('#ctl00_ContentPlaceHolder1_btnAceptar')
  


  try{
    await page.waitForSelector('#ctl00_ContentPlaceHolder1_lblTextHelp',{timeout:5000})
    let working= document.getElementById("ctl00_ContentPlaceHolder1_lblTextHelp").innerText
    if (working == 'PREDIO NO EXISTE'){
      return {data:[{
        id:rol+'-'+dv,
        measurement_date:fechaFormateada,
        invoice_amount: "Predio no existe",
      }]}
    } else {
      return {data:[{
        id:rol+'-'+dv,
        measurement_date:fechaFormateada,
        invoice_amount: "Error al cargar página",
      }]}
    }
   
  } catch{
    
  }

  try{
  await page.waitForSelector('#ctl00_ContentPlaceHolder1_UpdatePanel2 > table > tbody > tr:nth-child(2) > td:nth-child(6)',{timeout:5000})

  
  const result= await page.evaluate(() =>{
    total=document.getElementsByClassName('lblTres')[0].innerText
    return total
  })

  let total=result
  if (total != '$'){
    total=total.replace('$','').replace('.','')
    total=parseInt(total)
  } else {
    total=0
  }

  await browser.close()

  if(total >=0){
    return { data:[{
      id:rol+'-'+dv,
      measurement_date:fechaFormateada,
      invoice_amount: total,
    }]}
  }

  } catch {
    return {data:[{
      invoice_amount: "Error al cargar página",
    }]}
  }}
  catch{
    return {data:[{
      invoice_amount: "Error al cargar página",
    }]}
  }
  
}

export default aseo_smc 