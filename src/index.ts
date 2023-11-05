import { Hono } from 'hono';
const app = new Hono();
import * as fs from 'fs';
import csvParser from 'csv-parser';

interface Employee {
    name: string;
    department: string;
    salary: number;
    office: string;
    isManager: boolean;
    skills: string[];
}

interface Department {
    name: string;
    managerName: string;
    employees: Employee[];
}

interface Organization {
    departments: Department[];
}

function orgCsvToJson(csvData: string): Promise<Organization> {
    return new Promise((resolve, reject) => {
        const organization: Organization = { departments: [] };

        const lines = csvData.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
        const headers = lines[0].split(',').map(header => header.trim());

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length !== headers.length) {
                reject('Invalid CSV format'); // Reject if the number of values does not match headers
                return;
            }

            const employee: Employee = {
                name: values[headers.indexOf('name')].trim(),
                department: values[headers.indexOf('department')].trim(),
                salary: parseInt(values[headers.indexOf('salary')].trim(), 10),
                office: values[headers.indexOf('office')].trim(),
                isManager: values[headers.indexOf('isManager')].trim() === 'TRUE',
                skills: values.slice(headers.indexOf('skill1')).map(skill => skill.trim()).filter(skill => skill !== '')
            };

            const existingDepartment = organization.departments.find(dept => dept.name === employee.department);

            if (existingDepartment) {
                existingDepartment.employees.push(employee);
                if (employee.isManager) {
                    existingDepartment.managerName = employee.name;
                }
            } else {
                const newDepartment: Department = {
                    name: employee.department,
                    managerName: employee.isManager ? employee.name : '',
                    employees: [employee]
                };
                organization.departments.push(newDepartment);
            }
        }

        resolve(organization);
    });
}

function meCsvToJson(csvData: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const jsonArray: any[] = [];
  
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
  
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const entry: any = {};
  
        for (let j = 0; j < headers.length; j++) {
          entry[headers[j]] = values[j].trim();
        }
  
        jsonArray.push(entry);
      } 
      resolve(jsonArray);
    });
  }

// Example usage
const csvData = 'name,department,salary,office,isManager,skill1,skill2,skill3\nJohn,CDN,80,Lisbon,FALSE,Caching,C++,AI\nAlice,CDN,90,Lisbon,TRUE,Java,Python,';

orgCsvToJson(csvData).then((formattedData) => {
    console.log(JSON.stringify(formattedData, null, 2));
});


//function convertCsvToJson(csvFilePath: string): Promise<Organization> {  
function convertCsvToJson(csvFilePath: string): Promise<Organization> {
        
    const departments: { [key: string]: Department } = {};

    return new Promise((resolve, reject) => {
        console.log('reading fine'+csvFilePath);
        const readStream = fs.createReadStream(csvFilePath);
        
        //return "Inside csvtojson function..next step - "+csvFilePath;
        readStream
            .pipe(csvParser())
            .on('data', (row) => {
                const employee: Employee = {
                    name: row.name,
                    department: row.department,
                    salary: parseFloat(row.salary),
                    office: row.office,
                    isManager: row.isManager.toLowerCase() === 'true',
                    skills: [row.skill1, row.skill2, row.skill3].filter(Boolean)
                };

                if (!departments[row.department]) {
                    departments[row.department] = {
                        name: row.department,
                        managerName: '',
                        employees: []
                    };
                }

                if (employee.isManager) {
                    departments[row.department].managerName = employee.name;
                }

                departments[row.department].employees.push(employee);
            })
            .on('end', () => {
                const organization: Organization = {
                    departments: Object.values(departments)
                };
                resolve(organization);
            })
            .on('error', (error) => {
                reject(error);
            });

        readStream.on('error', (error) => {
            reject(error);
        });
    });
}

app.get("/", (ctx) => {
    return ctx.text(
        //creating a table of contents
        "This is the cloudfare general coding assesment challenge \n\n1) type in /organization-chart to see the organization chart\n2)type in /me to get information in a json file about me!"
    )
});

app.get("/organization-chart", async (ctx) => {    
    const csvData: string = `
    name,department,salary,office,isManager,skill1,skill2,skill3
    John,CDN,80,Lisbon,FALSE,Caching,C++,AI
    Ibrahim Gould,Bots,262,Austin,FALSE,HTML,Performance,GoLang
    Violeta Cortes,Developer Platform,98,Austin,FALSE,Caching,C++,AI
    Banks Fitzpatrick,CDN,250,Singapore,FALSE,Typescript,Rust,GoLang
    Annabella Velasquez,Accounting,172,San Francisco,FALSE,HTML,Performance,Postgres
    Braden McMahon,Bots,219,San Francisco,TRUE,Distributed Systems,Rust,AI
    Belen Norman,DeveloperPlatform,252,London,TRUE,HTML,Rust,GoLang
    Aziel Gibson,CDN,145,New York,TRUE,Caching,C++,AI
    Eden Roy,Accounting,190,Austin,FALSE,Typescript,C++,GoLang
    Marcelo Sullivan,Bots,241,Singapore,FALSE,HTML,CSS,Postgres
    Melanie Esparza,Developer Platform,231,San Francisco,FALSE,Distributed Systems,Rust,A
    Carl Nava,CDN,230,London,FALSE,HTML,Rust,GoLang
    Scout Hansen,Accounting,259,New York,FALSE,Caching,C++,AI
    Charlie West,Bots,131,Lisbon,FALSE,Typescript,C++,GoLang
    Remi Hendrix,Developer Platform,162,Austin,FALSE,HTML,CSS,Postgres
    Korbyn Cuevas,CDN,86,Singapore,FALSE,Distributed Systems,Rust,AI
    Adele Castillo,Accounting,237,SanFrancisco,FALSE,HTML,Rust,GoLang
    Kai Rojas,Bots,102,London,FALSE,Caching,C++,AI
    Adaline Murphy,Developer Platform,238,New York,FALSE,Typescript,C++,GoLang
    Cameron Doyle,CDN,81,Lisbon,FALSE,HTML,CSS,Postgres
    Annalise Fuller,Accounting,172,Austin,FALSE,Distributed Systems,Rust,AI
    Andre Spears,Bots,106,Singapore,FALSE,HTML,Performance,GoLang
    Isabela Casey,Developer Platform,283,San Francisco,FALSE,Caching,C++,AI
    Armando Trujillo,CDN,178,London,FALSE,Typescript,CSS,GoLang
    Danielle dkins,Accounting,89,New York,FALSE,HTML,Rust,Postgres
    Kylo Hayes,Bots,213,London,FALSE,Distributed Systems,Performance,AI
    Iris Frye,Developer Platform,212,New York,FALSE,HTML,C++,GoLang
    Franco Short,CDN,82,Lisbon,FALSE,Caching,CSS,AI
    Cheyenne Fowler,Accounting,150,Austin,FALSE,Typescript,Rust,GoLang
    Kameron Colon,Bots,149,Singapore,FALSE,HTML,Performance,Postgres
    Remy Wang,Developer Platform,94,San Francisco,FALSE,Distributed Systems,C++,AI
    Cohen Dougherty,CDN,157,London,FALSE,HTML,CSS,GoLang
    Alisson Russell,Accounting,214,New York,FALSE,Caching,Rust,AI
    Weston McIntosh,Bots,130,Lisbon,FALSE,Typescript,Performance,GoLang
    Gwen Gutierrez,Developer Platform,259,Austin,FALSE,HTML,C++,Postgres
    Luca Acosta,CDN,175,Singapore,FALSE,Distributed Systems,CSS,AI
    Kaia Wyatt,Accounting,112,San Francisco,FALSE,HTML,Rust,GoLang
    Sam Hubbard,Bots,87,London,FALSE,Caching,Performance,AI
    Rosie Hull,Developer Platform,227,New York,FALSE,Typescript,C++,GoLang
    Salem Foley,CDN,290,London,FALSE,HTML,CSS,Postgres
    Zaylee Blair,Accounting,136,New York,FALSE,Distributed Systems,Rust,AI
    Troy Bartlett,Bots,103,Lisbon,FALSE,HTML,Performance,GoLang
    Aubrielle Collier,Developer Platform,225,Austin,FALSE,Distributed Systems,C++,AI
    Edison Hamilton,CDN,267,Singapore,FALSE,HTML,CSS,GoLang
    Mackenzie Gill,Accounting,101,San Francisco,FALSE,Caching,Rust,Postgres
    Matthias Greene,Bots,288,London,FALSE,Typescript,Performance,AI
    Selena Hutchinson,Developer Platform,263,New York,FALSE,HTML,C++,GoLang
    Korbin Francis,CDN,108,Lisbon,FALSE,Distributed Systems,Rust,AI
    Daniella Noble,Accounting,289,Austin,FALSE,HTML,Performance,GoLang
    Idris Kent,Bots,297,Singapore,FALSE,Caching,C++,Postgres
    Jazmine Holt,Developer Platform,139,San Francisco,FALSE,Typescript,Rust,AI
    Niko Molina,CDN,229,London,FALSE,HTML,Performance,GoLang
    Alexandria Booth,Accounting,156,New York,FALSE,Distributed Systems,C++,AI
    Chaim Cisneros,Bots,80,Austin,FALSE,Distributed Systems,Rust,GoLang
    Janelle Hall,Developer Platform,158,Singapore,FALSE,HTML,Performance,Postgres
    Thomas Nixon,CDN,201,San Francisco,FALSE,Caching,C++,AI
    Deborah Taylor,Accounting,186,London,FALSE,Typescript,Rust,GoLang
    Jackson Parsons,Bots,150,New York,FALSE,HTML,Performance,AI
    Maia Blackburn,Developer Platform,294,Austin,FALSE,Distributed Systems,C++,GoLang
    Zahir Hartman,CDN,106,Singapore,FALSE,HTML,Rust,Postgres
    Kennedi Palacios,Accounting,300,San Francisco,FALSE,Caching,Performance,AI
    Thaddeus Dillon,Bots,172,London,FALSE,Typescript,C++,GoLang
    Laurel Moore,Developer Platform,194,New York,FALSE,HTML,Rust,AI
    Levi Rivers,CDN,141,Austin,FALSE,Distributed Systems,Performance,GoLang
    Kiana Ray,Accounting,104,Austin,FALSE,Distributed Systems,C++,Postgres
    Arlo Person,Bots,203,Singapore,FALSE,HTML,Rust,AI
    Dylan Evans,Developer Platform,90,San Francisco,FALSE,Caching,Performance,GoLang
    Elias Quintero,CDN,215,London,FALSE,Typescript,C++,AI
    Keyla Hurst,Accounting,137,New York,FALSE,HTML,Rust,GoLang
    Neil Carroll,Bots,188,Austin,FALSE,Distributed Systems,Performance,Postgres
    Zara Bradford,Developer Platform,163,Austin,FALSE,HTML,C++,AI
    Ander Quintero,CDN,226,Singapore,FALSE,Caching,Rust,GoLang
    Keyla Bravo,Accounting,242,San Francisco,FALSE,Typescript,Performance,AI
    Genesis Felix,Bots,187,London,FALSE,HTML,C++,GoLang
    Paisleigh Sherman,Developer Platform,118,New York,FALSE,Distributed Systems,Rust,Postgres
    Adan Sanford,CDN,280,Austin,FALSE,Distributed Systems,Performance,AI
    Emerald Macdonald,Accounting,228,Austin,FALSE,HTML,C++,GoLang
    Hugh Bowman,Bots,139,Singapore,FALSE,Caching,Rust,AI
    Fiona Robinson,Developer Platform,300,San Francisco,FALSE,Typescript,Performance,GoLang
    Matthew Christensen,CDN,204,London,FALSE,HTML,C++,Postgres
    Carmen McLaughlin,Accounting,221,New York,FALSE,Distributed Systems,Rust,AI
    Ibrahim Gould,Bots,262,Austin,FALSE,HTML,Performance,GoLang
    Violeta Cortes,Developer Platform,98,Austin,FALSE,Caching,C++,AI
    Banks Fitzpatrick,CDN,250,Singapore,FALSE,Typescript,Rust,GoLang
    Annabella Velasquez,Accounting,172,San Francisco,FALSE,HTML,Performance,Postgres
    Sullivan Nunez,Bots,165,London,FALSE,Distributed Systems,C++,AI
    Mya Hardy,Developer Platform,127,New York,FALSE,Distributed Systems,Rust,GoLang
    Jayceon Murillo,CDN,128,Austin,FALSE,HTML,Performance,AI
    Mikaela Hampton,Accounting,89,Austin,FALSE,Caching,C++,GoLang
    Hank Sandoval,Bots,165,Singapore,FALSE,Typescript,Rust,Postgres
    Elsie McCarthy,Developer Platform,128,San Francisco,FALSE,HTML,Rust,AI
    Devin Weber,CDN,285,London,FALSE,Distributed Systems,Performance,GoLang`;
    try {
        const jsonArray = await orgCsvToJson(csvData);
        console.log(jsonArray);
        const jsonString = JSON.stringify(jsonArray, null, 2);
        const currentTime = new Date().toLocaleTimeString();
        console.log('Current time: ' + currentTime);
        console.log('i am outside'); // This line will be printed after the JSON data
        return ctx.text(jsonString);
    } catch (error) {
        console.error('ERROR organization chart data.' + error);
        return ctx.text('ERROR organization chart data.' + error);
    }
}
);

app.get("/me", async (ctx) => {
    const csvData = 'name,favorite show,github url,linkedIn,hobbie1,hobbie2\nShashank Raghuraj,Ted Lasso,https://github.com/ShashankRaghuraj,https://www.linkedin.com/in/shashank-raghuraj-06ba72219/,Basketball,Chess';
    let jsonString = '';
    try {
        const jsonArray = await meCsvToJson(csvData);
        console.log(jsonArray);
        const jsonString = JSON.stringify(jsonArray, null, 2);
        const currentTime = new Date().toLocaleTimeString();
        console.log(jsonString);
        return ctx.text(jsonString);
    } catch (error) {
        console.error('ERROR organization chart data.' + error);
        return ctx.text('ERROR organization chart data.' + error);
    }
});
export default app;


// import {Hono} from "hono";
// const app = new Hono();
// import * as fs from 'fs';
// import csvParser from 'csv-parser';


// app.get("/", (ctx) => {
//     return ctx.text(
//         //creating a table of contents
//         "This is the cloudfare general assessment\n\n1) type in /organization_chart to see the organization chart\n2)type in /me to get information in a json file about me!"
//     )
// })

// app.get("/organization_chart", (ctx) => {
//     //insert the json value here
//     return ctx.text("");
// })
// app.get("/me", (ctx) => {
//     return ctx.text(
//         "this is a cloudfare test"
//     )
// })
// export default 