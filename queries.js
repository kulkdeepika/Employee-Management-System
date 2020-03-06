const mysql = require('mysql');
const inquirer = require('inquirer');
const printTable = require("console.table");
const chalk = require("chalk");
const boxen = require("boxen");
const Database = require("./dbOperations.js");

let config = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password123",
    database:"EMPLOYEE_MANAGEMENT_SYSTEM"
};

// Creating an instance of the Database class, in order to be able to access its query and close functions
let handleDB = new Database(config);

// Prompting the options and calling the appropriate functions based on the user selection
const promptUser = function (){
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "\nWhat would you like to do?",
        choices: [
            "View all Employees",
            "Add Employee",
            "Add Role",
            "Add Department",
            "View Roles",
            "View Departments",
            "Update Employee Role",
            "Delete Employee",
            "Delete Role",
            "Delete Department",
            "Update Employee's Manager",
            "View Employees By Manager",
            "View Department Budget",
            "QUIT"
        ]
    }).then(function(answer){
        switch(answer.action){
            case "View all Employees":
                showAllEmployees();
            break;

            case "Add Employee":
                addEmployee();
            break;

            case "Add Role":
                addRole();
            break;

            case "Add Department":
                addDepartment();
            break;

            case "View Roles":
                viewRoles();
            break;

            case "View Departments":
                viewDepartments();
            break;

            case "Update Employee Role":
                updateEmpRole();
            break;

            case "Delete Employee":
                deleteEmployee();
            break;

            case "Delete Role":
                deleteRole();
            break;

            case "Delete Department":
                deleteDepartment();
            break;

            case "Update Employee's Manager":
                updateEmployeeManager();
            break;

            case "View Employees By Manager":
                viewByManager();
            break;

            case "View Department Budget":
                viewBudget();
            break;

            case "QUIT":
                quit();
            break;

            default:
                quit();
        }
    })
} // end of promptUser

// View all the employee data by JOINING all 3 tables
const showAllEmployees = async function (){
    
    let queryString = "SELECT EMPLOYEE.id,EMPLOYEE.first_name,EMPLOYEE.last_name, ROLE.title, ROLE.salary, DEPARTMENT.name as department, concat(e.first_name, ' ' ,e.last_name) as manager from EMPLOYEE join ROLE ON EMPLOYEE.role_id = ROLE.id join DEPARTMENT ON ROLE.department_id = DEPARTMENT.id left outer join EMPLOYEE e ON EMPLOYEE.manager_id = e.id ORDER BY EMPLOYEE.id;";
  
    await getAndDisplay(queryString);
    promptUser();

}// END of showAllEmployees

// This function is responsible to insert a new employee into the employee table
const addEmployee = async function (){
    let empArray = [];
    let roleArray = [];

    // This part of the code queries and creates an array of all employees and roles to present as option
    //list to the user so that he can pick the manager and role of the new employee
    let queryString = "SELECT first_name, last_name from EMPLOYEE;";
    let result = await handleDB.query(queryString);

    let nameObjectArray = [];
    for(let i=0; i<result.length; i++){

        nameObjectArray.push({fullName : result[i].first_name + " " + result[i].last_name,
                              firstName : result[i].first_name,
                              lastName : result[i].last_name});
        empArray.push(result[i].first_name + " " + result[i].last_name);
    }
    empArray.unshift("NONE");

    queryString = "SELECT title as roles from ROLE;";
    result = await handleDB.query(queryString);

    for(let i = 0; i < result.length; i++){
        roleArray[i] = result[i].roles;
    }

    insertEmployee(empArray,roleArray, nameObjectArray);
}// END of addEmployee

// Called from addEmployee
const insertEmployee = function(empArray, roleArray, nameObjectArray){
    inquirer.prompt([
        {
            name: "fname",
            type: "input",
            message: "Enter the first name: ",
            validate: function(val) {
            // The users must enter a first name
                let isValid = val === "" ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a first name! ***\n"));
                    return isValid; 
                }
                isValid = /\S/.test(val) ? true : false;
                //isValid = val.trim().isEmpty() ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a first name! ***\n")); 
                }
                return isValid;
            }
        },
        {
            name: "lname",
            type: "input",
            message: "Enter the last name: ",
            validate: function(val) {
                // The users must enter a last name
                let isValid = val === "" ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a last name! ***\n"));
                    return isValid; 
                }
                isValid = /\S/.test(val) ? true : false;
                //isValid = val.trim().isEmpty() ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a last name! ***\n")); 
                }
                return isValid;
            }
        },
        {
            name: "role",
            type: "list",
            message: "What is the employee's role ",
            choices: roleArray
        },
        {
            name: "manager",
            type: "list",
            message: "Who is the employee's manager ",
            choices: empArray
        }
    
    ]).then(async function(answers){

        queryString = "SELECT id from ROLE where title = ? ;";
        result = await handleDB.query(queryString, [answers.role]);
        let roleID = result[0].id;

        if(answers.manager === "NONE")
        {
            var managerFirstName = answers.manager;
            var managerLastName = answers.manager;
        }
        else
        {
            for(let i=0; i< nameObjectArray.length; i++){
                if(nameObjectArray[i].fullName === answers.manager){
                    var managerFirstName = nameObjectArray[i].firstName;
                    var managerLastName = nameObjectArray[i].lastName;
                    break;
                }
            }
        }

        queryString = "SELECT id from EMPLOYEE where first_name = ? and last_name = ? ;"
        result = await handleDB.query(queryString, [managerFirstName, managerLastName]);

        managerID = (managerFirstName === "NONE" &&  managerLastName === "NONE") ? null : result[0].id;
        // FINAL INSERT after gathering and parsing all the required fields
        queryString = "INSERT into EMPLOYEE SET ?";
        result = await handleDB.query(queryString, [{first_name : answers.fname.trim(),last_name : answers.lname.trim(),  role_id: roleID,manager_id: managerID}]);

        console.log(boxen(chalk.green("\n*** Employee successfully added! ***\n"), {padding:0}));
        promptUser();
    });
}// END of insertEmployee

// This function is resposible for adding a new role into the ROLE table
const addRole = async function(){
    // Form the array of departments so that user can select what department the new role belongs under

    let queryString = "SELECT name from DEPARTMENT"; 
    const result = await handleDB.query(queryString);

    let deptArr = [];
    for(let i = 0; i < result.length; i++){
        deptArr[i] = result[i].name;
    }

    insertRole(deptArr);
}// END of addRole

function insertRole(deptArr){

    inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "What is the Title of the role that you would like to add? ",
            validate: function(val) {
                // The users must enter a role name
                let isValid = val === "" ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a role name! ***\n"));
                    return isValid; 
                }
                isValid = /\S/.test(val) ? true : false;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a role name! ***\n")); 
                }
                return isValid;
            }
        },
        {
            name: "salary",
            type: "input",
            message: "What would be the salary associated with this new Role? ",
            validate: function(val){
                let isNum = !isNaN(val); 
                if(!isNum)
                {
                    console.log(chalk.red("\n*** Must enter a Number! ***\n")); 
                }
                return isNum;
            }
        },
        {
            name: "department",
            type: "list",
            message: "Which Department does this role belong to? ",
            choices: deptArr
        }
    ]).then(async function(answers){

        let queryString = "SELECT id from DEPARTMENT where name = ?";
        let result = await handleDB.query(queryString, [answers.department]);
        let deptID = result[0].id;

        //FINAL INSERT after gathering all the required inputs
        queryString = "INSERT into ROLE SET ?";
        result = await handleDB.query(queryString, [{title: answers.title.trim(),salary: answers.salary.trim(),department_id: deptID}]);

        console.log(boxen(chalk.green("\n*** Role successfully added! ***\n"), {padding:0}));
        promptUser();
    })//end of .then
}//END of insertRole insertRole

// This function is responsible for inserting a new department in the DEPARTMENT Table
const addDepartment = function (){
    inquirer.prompt(
        {
            name: "deptName",
            type: "input",
            message: "What is the name of the new Department that you would like to add? ",
            validate: function(val) {
                // The users must enter a department name
                let isValid = val === "" ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a department name! ***\n"));
                    return isValid; 
                }
                isValid = /\S/.test(val) ? true : false;
                //isValid = val.trim().isEmpty() ? false : true;
                if(!isValid)
                {
                    console.log(chalk.red("\n*** Must enter a department name! ***\n")); 
                }
                return isValid;
            }
        }
    ).then(async function(answer){

        queryString = "INSERT into DEPARTMENT SET ?";
        let result = await handleDB.query(queryString,[{name : answer.deptName.trim()}]);
        console.log(boxen(chalk.green("\n*** Department successfully added! ***\n"), {padding:0}));
        promptUser();
    })
}//End of addDepartment

const viewRoles = async function(){
    let queryString = "SELECT * from ROLE";
    await getAndDisplay(queryString);
    promptUser();
}// End of viewRoles

const viewDepartments = async function(){
    let queryString = "SELECT * from DEPARTMENT";
    await getAndDisplay(queryString);
    promptUser();
}// End of viewDepartment

// This function is responsible for updating the role of an employee
const updateEmpRole = async function(){

    //This part of the code forms an array of names to display to the user, and also creates a key-val pair
    //So that the first name and last name can be effectively retrived after user chooses a name 
    let queryString = "SELECT first_name, last_name from EMPLOYEE;";
    let result = await handleDB.query(queryString);

    let nameObjectArray = [];
    let empDisplayArray = [];
    let roleArr = [];

    for(let i=0; i<result.length; i++){
        nameObjectArray.push({fullName : result[i].first_name + " " + result[i].last_name,
                                firstName : result[i].first_name,
                                lastName : result[i].last_name});
        empDisplayArray.push(result[i].first_name + " " + result[i].last_name);
    }

    queryString = "SELECT title from ROLE;";
    result = await handleDB.query(queryString);
    for(let i = 0; i< result.length; i++){
        roleArr[i] = result[i].title;
    }
    changeRole(empDisplayArray, roleArr,nameObjectArray);
}//End of updateEmpRole

function changeRole(empDisplayArray, roleArr, nameObjectArray){
    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "What is the name of the Employee whose Role you would like tp Update?",
            choices: empDisplayArray
        },
        {
            name: "newRole",
            type: "list",
            message: "What will be the Employee's new Role? ",
            choices: roleArr
        }
    ]).then(async function(answers){
        let newRoleID;
        let fName;
        let lName;

        let queryString = "SELECT id from ROLE where title = ?";
        let result = await handleDB.query(queryString,[answers.newRole]);
        newRoleID = result[0].id;

        for(let i=0; i< nameObjectArray.length; i++){
            if(nameObjectArray[i].fullName === answers.empName){
                fName = nameObjectArray[i].firstName;
                lName = nameObjectArray[i].lastName;
                break;
            }
        }

        queryString = "UPDATE EMPLOYEE SET role_id = ? where first_name = ? and last_name = ?";
        result = await handleDB.query(queryString, [newRoleID, fName, lName]);
        console.log(boxen(chalk.green("\n*** Successfully Updated Employee's Role! ***\n"), {padding:0}));
        promptUser();
    });
}//END of changeRole

//This function is responsible for removing an employee from the employee table
const deleteEmployee = async function(){
    let displayArr = [];
    let queryString ="SELECT first_name, last_name from EMPLOYEE;";
    let result = await handleDB.query(queryString);

    for(let i = 0; i < result.length; i++){
        displayArr.push(`${result[i].last_name},${result[i].first_name}`);
    }

    inquirer.prompt(
        {
            name: "empName",
            type: "list",
            message: "Which Employee's record would you like to delete?",
            choices: displayArr
        }).then(async function(answer){
        let lName = answer.empName.split(",")[0];
        let fName = answer.empName.split(",")[1];

        queryString = "DELETE from EMPLOYEE where first_name = ? and last_name = ?;"
        result = await handleDB.query(queryString, [fName, lName]);

        console.log(boxen(chalk.green("\n*** Employee successfully deleted! ***\n"), {padding:0}));
        promptUser();
    })
}// END of deleteEmployee

//This function is responsible for removing a role from the ROLE table
const deleteRole = async function(){
    let displayArr = [];
    let queryString ="SELECT title from ROLE;";
    let result = await handleDB.query(queryString);

    for(let i = 0; i < result.length; i++){
        displayArr.push(result[i].title);
    }

    inquirer.prompt(
        {
            name: "roleName",
            type: "list",
            message: "Which Role would you like to delete?",
            choices: displayArr
        }).then(async function(answer){
    
        queryString = "DELETE from ROLE where title = ?;";
        result = await handleDB.query(queryString, [answer.roleName]);

        console.log(boxen(chalk.green("\n*** Role successfully deleted! ***\n"), {padding:0}));
        promptUser();
    })
}// END of deleteRole

//This function is responsible for removing a department from the DEPARTMENT table
const deleteDepartment = async function(){

    let deptList = [];
    let queryString = "SELECT name from DEPARTMENT;";
    let result = await handleDB.query(queryString);

    for(let i=0; i<result.length; i++){
        deptList.push(result[i].name);
    }

    inquirer.prompt(
        {
            name: "deptName",
            type: "list",
            message: "Which department would you like to delete?",
            choices: deptList
        }).then(async function(answer){
    
        queryString = "DELETE from DEPARTMENT where name = ?";
        result = await handleDB.query(queryString, [answer.deptName]);

        console.log(boxen(chalk.green("\n*** Department successfully deleted! ***\n"), {padding:0}));
        promptUser();
    })
}// END of deleteDepartment

//This function shows the total budget of a particular department
const viewBudget = async function(){
    let deptArr = [];
    let queryString = "SELECT name from DEPARTMENT;";
    let result = await handleDB.query(queryString);

    for(let i=0 ; i<result.length; i++){
        deptArr.push(result[i].name);
    }
    inquirer.prompt(
        {
            name: "deptName",
            type: "list",
            message: "Enter the name of the department whose budget you would like to view:",
            choices: deptArr
        }).then(async function(answer){

            queryString = `SELECT SUM(salary) as budget from EMPLOYEE join ROLE ON EMPLOYEE.role_id = ROLE.id where ROLE.department_id = (SELECT id from DEPARTMENT where name = "${answer.deptName}");`
            result = await handleDB.query(queryString);

            console.log(boxen(chalk.white(`\n*** The Budget for ${answer.deptName} is ${result[0].budget} ***\n`), {padding:0, borderStyle: 'bold', backgroundColor: 'gray'}));

            promptUser();
        });
}// END of viewBudget

// This function is responsible for updating the manager of an employee
const updateEmployeeManager = async function(){

    let nameObjectArray = [];
    let empDisplayArray = [];

    let queryString = "SELECT first_name, last_name from EMPLOYEE;";
    let result = await handleDB.query(queryString);

    for(let i=0; i<result.length; i++){
        nameObjectArray.push({fullName : result[i].first_name + " " + result[i].last_name,
                                firstName : result[i].first_name,
                                lastName : result[i].last_name});
        empDisplayArray.push(result[i].first_name + " " + result[i].last_name);
    }

    inquirer.prompt(
        {
            name: "empName",
            type: "list",
            message: "Select the Employee whose Manager you would like to update",
            choices: empDisplayArray
        }).then(async function(answer){
            empDisplayArray.splice(empDisplayArray.indexOf(answer.empName),1);
            empDisplayArray.unshift("NONE");

            for(let i=0; i< nameObjectArray.length; i++){
                if(nameObjectArray[i].fullName === answer.empName){
                    var empFirstName = nameObjectArray[i].firstName;
                    var empLastName = nameObjectArray[i].lastName;
                    break;
                }
            }

            inquirer.prompt(
                {
                    name: "managerName",
                    type: "list",
                    message: "Select the new Manager for this Employee",
                    choices: empDisplayArray
                }).then(async function(answer){

                    if(answer.managerName === "NONE")
                    {
                        var managerFirstName = answer.managerName;
                        var managerLastName = answer.managerName;
                    }
                    else{
                        for(let i=0; i< nameObjectArray.length; i++){
                            if(nameObjectArray[i].fullName === answer.managerName){
                            var managerFirstName = nameObjectArray[i].firstName;
                            var managerLastName = nameObjectArray[i].lastName;
                            break;
                            }
                        }
                    }

                    queryString = "SELECT id from EMPLOYEE where first_name = ? and last_name = ?";
                    result = await handleDB.query(queryString, [managerFirstName,managerLastName]);
                    
                    let manager_id = (managerFirstName === "NONE" &&  managerLastName === "NONE") ? null : result[0].id;

                    queryString = "UPDATE EMPLOYEE SET manager_id = ? where first_name = ? and last_name = ?";
                    result = await handleDB.query(queryString, [manager_id, empFirstName, empLastName]);

                    console.log(boxen(chalk.green("\n*** Employee's manager successfully Updated! ***\n"), {padding:0}));
                    promptUser();
                });
        })
}// END updateEmployeeManager

// This function allows the user to view a particular manager's list of team members
const viewByManager = async function(){
    let managerArray = [];
    let nameObjectArray = [];
    queryString = "SELECT first_name, last_name from EMPLOYEE where id in (SELECT DISTINCT EMPLOYEE.manager_id from EMPLOYEE);";
    let result = await handleDB.query(queryString);
    
    for(let i=0; i<result.length; i++){

        nameObjectArray.push({fullName : result[i].first_name + " " + result[i].last_name,
                              firstName : result[i].first_name,
                              lastName : result[i].last_name});
        managerArray.push(result[i].first_name + " " + result[i].last_name);
    }

    inquirer.prompt(
        {
            name: "managerName",
            type: "list",
            message: "Which Manager's team would you like to view?",
            choices: managerArray
        }).then(async function(answer){
            for(let i=0; i< nameObjectArray.length; i++){
                if(nameObjectArray[i].fullName === answer.managerName){
                    var empFirstName = nameObjectArray[i].firstName;
                    var empLastName = nameObjectArray[i].lastName;
                    break;
                }
            }

            queryString = "SELECT id from EMPLOYEE where first_name = ? and last_name = ?;";
            result = await handleDB.query(queryString, [empFirstName,empLastName]);
            manager_id = result[0].id;

            queryString = `SELECT concat(first_name, ' ' , last_name) as Employees_under_${empFirstName}_${empLastName} from EMPLOYEE where manager_id = ?;`;
            result = await handleDB.query(queryString, [manager_id]);
            console.log("\n" + boxen(printTable.getTable(result)));
            promptUser();
        })
}// end of viewByManager

// This function will close the connection to the database
async function quit(){
    const result = await handleDB.close();
    console.log(boxen(chalk.white("\n*** Thank you for using this Employee Management System! ***\n"), {padding:0, borderStyle: 'bold', backgroundColor: 'gray'}));
}//End of quit

// This function is responsible for quering and displaying the data on the console
const getAndDisplay = async function(queryString){
    const result = await handleDB.query(queryString);
    console.log("\n" + boxen(printTable.getTable(result)));
}//END of getAndDisplay

module.exports = {
    promptUser : promptUser,
}