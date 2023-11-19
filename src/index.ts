import { Context, Hono } from 'hono';
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


app.get("/", (ctx) => {
    return ctx.text(
        //creating a table of contents
        "This is the cloudfare general coding assesment challenge \n\n1) type in /organization-chart to see the organization chart\n2)type in /me to get information in a json file about me!"
    )
});

app.get("/organization-chart", async (ctx) => {
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const database = getDatabase(firebaseApp);
    const db = getFirestore(firebaseApp);
    //console.log(db);
    try {
        const organization = collection(db, 'departments');
        const organizationSnapshot = await getDocs(organization);
        
        const departments = organizationSnapshot.docs.map(departmentDoc => {
          const departmentData = departmentDoc.data();
        
          const manager = departmentData.employees.find(employee => employee.isManager);
          const managerName = manager ? manager.name : "";
        
          const employees = departmentData.employees.map(employee => {
            return {
              name: employee.name,
              department: departmentData.name,
              salary: employee.salary,
              office: employee.office,
              isManager: employee.isManager,
              skills: employee.skills
            };
          });
        
          return {
            name: departmentData.name,
            managerName: managerName,
            employees: employees
          };
        });
        
        const result = {
          departments: departments
        };
        
        return ctx.text(JSON.stringify(result, null, 2));
        
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

app.get("/me", async (ctx) => {
    const firebaseApp = initializeApp(firebaseConfig);
    const database = getDatabase(firebaseApp);
    const db = getFirestore(firebaseApp);
    const organization = collection(db, 'aboutMe');
    const organizationSnapshot = await getDocs(organization);
    const jsonValues = organizationSnapshot.docs.map(doc => {
        const data = doc.data();

        // Assuming the fields exist in the Firebase documents
        const name = data.name || "";  // Replace with the actual field name in your Firebase document
        const homepage = data.homepage || "";  // Replace with the actual field name in your Firebase document
        const githubURL = data.githubURL || "";  // Replace with the actual field name in your Firebase document
        const interestingFact = data.interestingFact || "";  // Replace with the actual field name in your Firebase document
        const skills = data.skills || [];  // Replace with the actual field name in your Firebase document

        return {
            name,
            homepage,
            githubURL,
            interestingFact,
            skills,
        };
    });
    return ctx.text(JSON.stringify(jsonValues, null, 2));

    // const csvData = 'name,favorite show,github url,linkedIn,hobbie1,hobbie2\nShashank Raghuraj,Ted Lasso,https://github.com/ShashankRaghuraj,https://www.linkedin.com/in/shashank-raghuraj-06ba72219/,Basketball,Chess';
    // let jsonString = '';
    // try {
    //     const jsonArray = await meCsvToJson(csvData);
    //     console.log(jsonArray);
    //     const jsonString = JSON.stringify(jsonArray, null, 2);
    //     const currentTime = new Date().toLocaleTimeString();
    //     console.log(jsonString);
    //     return ctx.text(jsonString);
    // } catch (error) {
    //     console.error('ERROR organization chart data.' + error);
    //     return ctx.text('ERROR organization chart data.' + error);
    // }
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