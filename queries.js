const mysql = require('mysql');
const inquirer = require('inquirer');
const printTable = require("console.table");
const chalk = require("chalk");
const boxen = require("boxen");

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
            "Add Role",
            "Add Department",
            "View Roles",
            "View Departments",
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

            default:
                quit();
        }
    })
} // end of promptUser

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
}// end of showAllEmployees

const addEmployee = function (){
    let empArray = [];
    let roleArray = [];
    connection.query(
        "SELECT first_name, last_name from EMPLOYEE;",
        function(err,result1){
            if(err){
                throw err;
            }
            let nameObjectArray = [];

            for(let i=0; i<result1.length; i++){

                nameObjectArray.push({fullName : result1[i].first_name + " " + result1[i].last_name,
                                      firstName : result1[i].first_name,
                                      lastName : result1[i].last_name});
                empArray.push(result1[i].first_name + " " + result1[i].last_name);
            }
            empArray.unshift("NONE");
            //console.log(empArray);

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
                    insertEmployee(empArray,roleArray, nameObjectArray);
                }
            )
        }
    )
    
    const insertEmployee = function(empArray, roleArray, nameObjectArray){
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
                //console.log(roleID);

                if(answers.manager === "NONE")
                {
                    
                    var managerFirstName = answers.manager;
                    var managerLastName = answers.manager;
                    console.log("inside if " + managerFirstName + " " + managerLastName);
                }
                else{

                    for(let i=0; i< nameObjectArray.length; i++){
                        if(nameObjectArray[i].fullName === answers.manager){
                            fName = nameObjectArray[i].firstName;
                            lName = nameObjectArray[i].lastName;
                            break;
                        }
                    }

                    console.log("Just Before ***  " + fName + lName);

                    // var managerFullName = answers.manager.split(" ");
                    var managerFirstName = fName;
                    var managerLastName = lName;
                }
            
                let query = connection.query(
                    "SELECT id from EMPLOYEE where first_name = ? and last_name = ? ;",
                    [managerFirstName, managerLastName],
                    function(err, result){
                        if(err){
                            throw err;
                        }

                        console.log(result);
                        
                        managerID = (managerFirstName === "NONE" &&  managerLastName === "NONE") ? null : result[0].id;
                        //console.log(managerID);

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
                                
                                console.log(boxen(chalk.red("\n*** Employee successfully added! ***\n"), {padding:0}));

                                promptUser();
                            }
                        )
                    }) 
                 
            })  
    })

}//end of insertEmployee
}// end of addEmployee

const addRole = function(){

    connection.query(
        "SELECT name from DEPARTMENT",
        function(err, result1){
            let deptArr = [];
            for(let i = 0; i < result1.length; i++){
                deptArr[i] = result1[i].name;
            }
            console.log(deptArr);
            insertRole(deptArr);
        }
    )

function insertRole(deptArr){

    inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "What is the Title of the role that you would like to add? "
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
    ]).then(function(answers){

            connection.query(
                "SELECT id from DEPARTMENT where name = ?",
                [answers.department],
                function(err, result){
                    if(err){
                        throw err;
                    }
                    console.log(result[0].id);
                    let deptID = result[0].id;

                    // Now that we have the id of the department, we are ready to insert into the role tbl
                    connection.query(
                        "INSERT into ROLE SET ?",
                        {
                            title: answers.title,
                            salary: answers.salary,
                            department_id: deptID
                        },
                        function(err, result){
                            if(err){
                                throw err;
                            }
                            
                            console.log(boxen(chalk.red("\n*** Role successfully added! ***\n"), {padding:0}));
                            promptUser();
                        }
                    )
                })
            
    })//end of .then

}// insertRole

}// end of addRole


const addDepartment = function (){
    inquirer.prompt(
        {
            name: "deptName",
            type: "input",
            message: "What is the name of the new Department that you would like to add? "
        }
    ).then(function(answer){
        connection.query(
            "INSERT into DEPARTMENT SET ?",
            {
                name : answer.deptName
            },
            function(err,result){
                if(err){
                    throw err;
                }
                console.log(result);
                console.log(boxen(chalk.red("\n*** Department successfully added! ***\n"), {padding:0}));
                promptUser();
            }
        )
    })

}//End of addDepartment

const viewRoles = function(){
    connection.query(
        "SELECT * from ROLE",
        function(err, result){
            if(err){
                throw err;
            }
            
            console.log(printTable.getTable(result));
        }
    )
}// End of viewRoles


const viewDepartments = function(){
    connection.query(
        "SELECT * from DEPARTMENT",
        function(err, result){
            if(err){
                throw err;
            }
            
            console.log(printTable.getTable(result));
        }
    )
}

function updateEmpRole(){

    connection.query(
        "SELECT first_name, last_name from EMPLOYEE;",
        function(err, result){
            if(err){
                throw err;
            }
            let nameObjectArray = [];
            let empDisplayArray = [];
            let roleArr = [];
            //console.log(result);
            for(let i=0; i<result.length; i++){

                nameObjectArray.push({fullName : result[i].first_name + " " + result[i].last_name,
                                      firstName : result[i].first_name,
                                      lastName : result[i].last_name});
                empDisplayArray.push(result[i].first_name + " " + result[i].last_name);
            }

            console.log(nameObjectArray);
            console.log(empDisplayArray);

            connection.query(
                "SELECT title from ROLE",
                function(err, results){
                    if(err){
                        throw err;
                    }

                    console.log(results);
                    for(let i = 0; i< results.length; i++){
                        roleArr[i] = results[i].title;
                    }
                    console.log(roleArr);
                    changeRole(empDisplayArray, roleArr,nameObjectArray);
                }
            )
        }
    )

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
        ]).then(function(answers){
            let newRoleID;
            let fName;
            let lName;
            connection.query(
                "SELECT id from ROLE where title = ?",
                [answers.newRole],
                function(err, result){
                    if(err){
                        throw err;
                    }
                    console.log(result[0].id);
                    newRoleID = result[0].id;

                    for(let i=0; i< nameObjectArray.length; i++){
                        if(nameObjectArray[i].fullName === answers.empName){
                            fName = nameObjectArray[i].firstName;
                            lName = nameObjectArray[i].lastName;
                            break;
                        }
                    }

                    console.log("Just Before ***  " + fName + lName);

                    connection.query(
                        "UPDATE EMPLOYEE SET role_id = ? where first_name = ? and last_name = ?",
                        [newRoleID, fName, lName],
                        function(err, result){
                            if(err){
                                throw err;
                            }
                            console.log(result);
                        }
                    )
                }
            )
        })
    }
}
function quit(){}

module.exports = {
    promptUser : promptUser,
    showAllEmployees : showAllEmployees,
    addEmployee: addEmployee
}