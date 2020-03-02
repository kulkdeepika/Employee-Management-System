const mysql = require('mysql');
const inquirer = require('inquirer');
const figlet = require("figlet");
const boxen = require("boxen");
const printTable = require("console.table");
const queries = require("./queries.js");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password123",
    database:"EMPLOYEE_MANAGEMENT_SYSTEM"
});

connection.connect(function(err){
    if(err){
        throw err;
    }
    console.log(`connected as id ${connection.threadID}`);
    welcomeUser();
})

// const showAllEmployees = function (){
//     var query = connection.query(
//         "SELECT EMPLOYEE.id,EMPLOYEE.first_name,EMPLOYEE.last_name, ROLE.title, ROLE.salary, DEPARTMENT.name as department, concat(e.first_name, ' ' ,e.last_name) as manager from EMPLOYEE join ROLE ON EMPLOYEE.role_id = ROLE.id join DEPARTMENT ON ROLE.department_id = DEPARTMENT.id left outer join EMPLOYEE e ON EMPLOYEE.manager_id = e.id;",
//         (err, result) => {
//             if(err){
//                 throw err;
//             }

//             console.log("\n" + printTable.getTable(result));
//         }
//     )
// }

// function addEmployee(){}
// function addDepartment(){}
// function addRole(){}
// function updateEmpRole(){}
// function quit(){}

function welcomeUser(){
    figlet("Employee\n\n\nManagement\n\n\nSystem", function(err,data){
        if (err){

            throw err;
        }
        console.log(boxen(data, {padding:1, borderStyle: 'bold', backgroundColor: 'gray'}));
        queries.promptUser();
    })
}