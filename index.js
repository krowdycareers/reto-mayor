const puppeteer = require('puppeteer');

(async () => {
  // Coneccion sin necesidad de abrir una ventana externa
  const browser = await puppeteer.launch({
    headless: false,
  });

  // Coneccion a la page
  const page = await browser.newPage();
  await page.goto('https://www.occ.com.mx/empleos/');

  // Carga del filtro
  async function realizarAcciones(page) {
    // Click en Fecha:
    await page.click(
      '[class*="row"] div[class*="facetsContainer"] div[class*="facetGroup"] div:nth-child(2)'
    );

    // Click en Filtro
    await page.click(
      '[class*="row"] div[class*=listsContainer] div:nth-child(2) div[class*="itemsWrapper"] a:first-child'
    );

    // Click en Aplicar
    await page.click(
      '[class*="row"] div[class*=listsContainer] div:nth-child(2) div[class*="bottomDiv"] button:first-child'
    );
  }

  // Obtencion de datos
  async function obtenerDatos() {
    // Esperar a que las card carguen
    await page.waitForSelector('div[id*="jobcard"]');

    // Colocacion de la data en un objeto
    const resultado = await page.evaluate(() => {
      const elementos = [];

      const locationElements = document.querySelectorAll(
        'div[id*="jobcard"] > div > div[class*="row"] p[class*="zonesLinks"]'
      );
      const salaryElements = document.querySelectorAll(
        'div[id*="jobcard"] > div > div[class*="row"] span[class*="salary"]'
      );

      locationElements.forEach((locationElement, index) => {
        const elemento = {
          location: locationElement.textContent?.trim() || '',
          salary: '',
        };

        if (salaryElements[index]) {
          elemento.salary = salaryElements[index].textContent?.trim() || '';
        }

        elementos.push(elemento);
      });

      return elementos;
    });

    return resultado;
  }

  // Cargar la paginacion en primer lugar
  await realizarAcciones(page);

  // Realiza bucle para la paginacion::
  let btnClicked = false;

  do {
    // Espera la carga de dicho elemento
    await page.waitForSelector(
      'ul[class*=pager] li:last-child:not([class*="disabled"])'
    );

    // Seleccion de elemento y si encuentra la clas disabled, se detiene (Esta clase solo aparece cuando no hay mas paginacion)
    const btn = await page.$('ul[class*=pager] li:last-child');
    const disabledClass = await btn?.evaluate((element) => {
      return element.classList.contains('[class*="disabled"]');
    });

    if (!disabledClass) {
      await btn?.click();
      await page.waitForSelector('div[id*="jobcard"]');

      const datos = await obtenerDatos();
      console.log(datos);
    } else {
      btnClicked = true;
    }
  } while (!btnClicked);

  browser.close()
})();
