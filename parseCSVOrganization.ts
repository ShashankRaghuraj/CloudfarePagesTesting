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

function convertCsvToJson(csvFilePath: string): Promise<Organization> {
    const departments: { [key: string]: Department } = {};

    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(csvFilePath);

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

// Example usage
const csvFilePath = 'general_data.csv';
convertCsvToJson(csvFilePath)
    .then((organization) => {
        console.log(JSON.stringify(organization, null, 2));
    })
    .catch((error) => {
        console.error('Error:', error);
    });