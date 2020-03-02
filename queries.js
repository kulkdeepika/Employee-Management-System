const mysql = require('mysql');
const inquirer = require('inquirer');
const printTable = require("console.table");

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
})

const promptUser = function (){
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "\nWhat would you like to do?",
        choices: [
            "View all Employees",
            "Add Employee",
            "Add Department",
            "Add Role",
            "Update Employee Role"
        ]
    }).then(function(answer){
        switch(answer.action){
            case "View all Employees":
                showAllEmployees();
            break;

            case "Add Employee":
                addEmployee();
            break;

            case "Add Department":
                addDepartment();
            break;

            case "Add Role":
                addRole();
            break;

            case "Update Employee Role":
                updateEmpRole();
            break;

            default:
                quit();
        }
    })
} 

const showAllEmployees = function (){
    var query = connection.query(
        "SELECT EMPLOYEE.id,EMPLOYEE.first_name,EMPLOYEE.last_name, ROLE.title, ROLE.salary, DEPARTMENT.name as department, concat(e.first_name, ' ' ,e.last_name) as manager from EMPLOYEE join ROLE ON EMPLOYEE.role_id = ROLE.id join DEPARTMENT ON ROLE.department_id = DEPARTMENT.id left outer join EMPLOYEE e ON EMPLOYEE.manager_id = e.id ORDER BY EMPLOYEE.id;",
        (err, result) => {
            if(err){
                throw err;
            }

            console.log("\n" + printTable.getTable(result));
            promptUser();
        }
    )
}

const addEmployee = function (){
    let empArray = [];
    let roleArray = [];
    connection.query(
        "SELECT concat(first_name, ' ' , last_name) as person from EMPLOYEE;",
        function(err,result1){
            if(err){
                throw err;
            }

            console.log(result1);
            for(let i = 0; i < result1.length; i++){
                empArray[i] = result1[i].person;
            }
            empArray.unshift("NONE");
            console.log(empArray);

            connection.query(
                "SELECT title as roles from ROLE;",
                function(err,result2){
                    if (err){
                        throw err;
                    }
                    console.log(result2);
                    for(let i = 0; i < result2.length; i++){
                        roleArray[i] = result2[i].roles;
                    }
                    console.log(roleArray);
                    insertEmployee(empArray,roleArray);
                }
            )
            

        }
    )
    
    const insertEmployee = function(empArray, roleArray){
    inquirer.prompt([
        {
            name: "fname",
            type: "input",
            message: "Enter the first name: "
        },
        {
            name: "lname",
            type: "input",
            message: "Enter the last name: "
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

    ]).then(function(answers){

        connection.query(
            "SELECT id from ROLE where title = ? ;",
            [answers.role],
            function(err,result){
                if(err){
                   throw err;
                }
               
                let roleID = result[0].id;
                console.log(roleID);

                if(answers.manager === "NONE")
                {
                    console.log("if part " + answers.manager);
                    var managerFirstName = answers.manager;
                    var managerLastName = answers.manager;
                }
                else{
                    console.log("Else part " + answers.manager);
                    var managerFullName = answers.manager.split(" ");
                    var managerFirstName = managerFullName[0];
                    var managerLastName = managerFullName[1];
                }
            
                let query = connection.query(
                    "SELECT id from EMPLOYEE where first_name = ? and last_name = ? ;",
                    [managerFirstName, managerLastName],
                    function(err, result){
                        if(err){
                            throw err;
                        }
                        
                        managerID = result === [] ? null : result[0].id;
                        console.log(managerID);

                        let query = connection.query(
                            "INSERT into EMPLOYEE SET ?",
                            {
                                first_name : answers.fname,
                                last_name : answers.lname,
                                role_id: roleID,
                                manager_id: managerID
                            },
                            function(err, insertResult){
                                if(err){
                                    throw err;
                                }
                                console.log(insertResult);
                            }
                        )
                    }) 
                 
            })  
    })

}//new func
}
function addDepartment(){}
function addRole(){}
function updateEmpRole(){}
function quit(){}

module.exports = {
    promptUser : promptUser,
    showAllEmployees : showAllEmployees,
    addEmployee: addEmployee
}