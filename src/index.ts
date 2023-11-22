// Importing necessary modules and dependencies
import { Context, Hono } from 'hono';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from 'firebase/database';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';

// Defining the Employee interface to represent employee data
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

// Defining the Department interface to represent department data
interface Department {
    name: string;
    managerName: string;
    employees: Employee[];
}

// Defining the Organization interface to represent the overall structure
interface Organization {
    departments: Department[];
}

// Creating an instance of the Hono application
const app = new Hono();

// Handling the root endpoint
app.get("/", (ctx) => {
    return ctx.text(
        // Providing information on available endpoints
        "This is the Cloudflare general coding assessment challenge \n\n1) GET/organization-chart to see the organization chart\n2) GET/me to get information in a JSON file about me!"
    );
});

// Handling the organization chart endpoint
app.get("/organization-chart", async (ctx) => {
    // Initializing Firebase app and retrieving data
    const firebaseApp = initializeApp(firebaseConfig);
    const database = getDatabase(firebaseApp);
    const db = getFirestore(firebaseApp);

    try {
        // Retrieving organization data from Firestore
        const organization = collection(db, 'departments');
        const organizationSnapshot = await getDocs(organization);

        // Mapping Firestore data to a structured organization format
        const departments = organizationSnapshot.docs.map(departmentDoc => {
            const departmentData = departmentDoc.data();

            // Extracting manager information and employee details
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

            // Constructing department object
            return {
                name: departmentData.name,
                managerName: managerName,
                employees: employees
            };
        });

        // Constructing the final result object
        const result = {
            departments: departments
        };

        // Returning the result as a formatted JSON
        return ctx.text(JSON.stringify(result, null, 2));
    } catch (error) {
        // Handling errors during data retrieval
        console.error('ERROR fetching organization chart data.' + error);
        return ctx.text('ERROR fetching organization chart data.' + error);
    }
});

// Handling the "me" endpoint
app.get("/me", async (ctx) => {
    // Initializing Firebase app and retrieving data
    const firebaseApp = initializeApp(firebaseConfig);
    const database = getDatabase(firebaseApp);
    const db = getFirestore(firebaseApp);
    const organization = collection(db, 'aboutMe');
    const organizationSnapshot = await getDocs(organization);

    // Mapping Firestore data to a structured "me" format
    const jsonValues = organizationSnapshot.docs.map(doc => {
        const data = doc.data();

        // Extracting relevant fields from Firebase document
        const name = data.name || "";
        const homepage = data.homepage || "";
        const githubURL = data.githubURL || "";
        const interestingFact = data.interestingFact || "";
        const skills = data.skills || [];

        // Constructing the "me" object
        return {
            name,
            homepage,
            githubURL,
            interestingFact,
            skills,
        };
    });

    // Returning the "me" data as a formatted JSON
    return ctx.text(JSON.stringify(jsonValues, null, 2));
});

// Exporting the Hono application instance
export default app;


