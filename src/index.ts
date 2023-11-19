import { Hono } from 'hono';
const app = new Hono();
import * as fs from 'fs';
import csvParser from 'csv-parser';
// Import Firebase and its modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from 'firebase/database';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

interface Employee {
    name: string;
    department: string;
    salary: number;
    office: string;
    isManager: boolean;
    skills: string[];
}


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC0bVYMlcFtrx47jeJNyLzeP6URvWtBoAU",
    authDomain: "organization-data-44cfc.firebaseapp.com",
    databaseURL: "https://organization-data-44cfc-default-rtdb.firebaseio.com",
    projectId: "organization-data-44cfc",
    storageBucket: "organization-data-44cfc.appspot.com",
    messagingSenderId: "979375300051",
    appId: "1:979375300051:web:651b7f8491ce6f267a2326",
    measurementId: "G-LW1MYCZLHF"
  };

interface Department {
    name: string;
    managerName: string;
    employees: Employee[];
}

interface Organization {
    departments: Department[];
}

function csvFileToString(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
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

app.get("/test", async (ctx) => {
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    console.log("");
    const database = getDatabase(firebaseApp);
    console.log("");
    const db = getFirestore(firebaseApp);
    //console.log(db);
    try {
        // Get a list of cities from your database
        const organization = collection(db, 'departments');
        const organizationSnapshot = await getDocs(organization);
        const jsonValues = organizationSnapshot.docs.map(doc => doc.data()); 
        return ctx.text(JSON.stringify(jsonValues, null, 2));
        //});
        // // Fetch data from Firebase
        // console.log("passed 2nd");
        // const snapshot = await get(ref(database, '{'));
        // console.log("passed 3rd");
        // const firebaseData: Organization = snapshot.val();
        
        // // Send the data in the response
        // const jsonString = JSON.stringify(firebaseData, null, 2);
        // return ctx.text(jsonString);
    } catch (error) {
        console.error('ERROR fetching organization chart data.' + error);
        return ctx.text('ERROR fetching organization chart data.' + error);
    }
});

app.get("/organization-chart", async (ctx) => {
    const csvData: string = await csvFileToString("input/general_data.csv");    
    
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