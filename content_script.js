
async function goToNextPage() {
    const nextButton = document.querySelector("[class*=next]");
    if (nextButton) {
        nextButton.click();
        return true; // Se hizo clic en el botón de siguiente página
    }
    return false; // No hay más páginas para navegar
}

async function getJobsInformation(numPages) {
    let jobsElementInformation = document.querySelectorAll("div[id*=jobcard]");
    jobsElementInformation = [...jobsElementInformation];

    let currentPage = 1;
    while (currentPage < numPages) {
        
        const nextPageClicked =  await goToNextPage();
        console.log(nextPageClicked);

        if (!nextPageClicked) {
            break; // No hay más páginas para navegar
        }

        currentPage++;
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera para cargar la siguiente página

        let jobsElementInformation2 = document.querySelectorAll("div[id*=jobcard]");
        jobsElementInformation = [...jobsElementInformation, ...jobsElementInformation2];
    }    

    const jobJsonInformation = jobsElementInformation.map((el) => {
        const ciudad=el.querySelector("[class*=zonesLinks]").innerText;
        const [
            { href: url },
            {
                children: [
                    {
                        children: [
                            { innerText: fecha },
                            { innerText: title },
                            { innerText: salario },
                        ],
                    },
                ],
            },
        ] = el.children;
        return { fecha, title, salario, ciudad };
    });

    for (let i = 0; i < jobJsonInformation.length; i++) {
        // Modificar la fecha
        jobJsonInformation[i].fecha = jobJsonInformation[i].fecha.replace('Recomendada', '').trim();
        // Modificar el salario
        const salario = jobJsonInformation[i].salario;
        const salarioNumerico = salario
            .replace('$', '')
            .replace('Mensual', '')
            .trim()
            .replace(/[^0-9-]/g, '');
        jobJsonInformation[i].salario = salarioNumerico;
    }

    // Agrupar por fecha, ciudad y sueldo
    const groupedJobs = jobJsonInformation.reduce((acc, job) => {
        const { fecha, ciudad, salario } = job;
        // Crear una clave única para cada combinación de fecha, ciudad y sueldo
        const key = `${fecha}-${ciudad}-${salario}`;
        if (!acc[key]) {
            // Si la clave no existe en el acumulador, crear un nuevo objeto con la clave y los valores iniciales
            acc[key] = {
            fecha,
            ciudad,
            salario,
            registros: 1
        };
        } else {
            // Si la clave ya existe, incrementar el contador de registros
            acc[key].registros++;
        }
        return acc;
    }, {});

    // Ordenar el nuevo objeto por sueldo de menor a mayor
    const sortedJobs = Object.values(groupedJobs).sort((a, b) => {
        const salarioA = a.salario !== '' ? parseInt(a.salario.split('-')[0]) : 0;
        const salarioB = b.salario !== '' ? parseInt(b.salario.split('-')[0]) : 0;
        return salarioA - salarioB;
    });

    return sortedJobs;
}

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener( ({ cmd }) => {
        if (cmd == "scrap") {
            // const jobsInformation = getJobsInformation(2);
            // port.postMessage( { message: jobsInformation } )
            // console.log(jobsInformation)

            let jobsInformation;
            getJobsInformation(2)
                .then(jobsInformation => {
                    port.postMessage({ message: jobsInformation });
                })
                .catch(error => {
                    // Manejar el error si la promesa es rechazada
                });
        }
    });
});