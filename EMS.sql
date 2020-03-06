DROP DATABASE if exists EMPLOYEE_MANAGEMENT_SYSTEM;
create database EMPLOYEE_MANAGEMENT_SYSTEM;

use EMPLOYEE_MANAGEMENT_SYSTEM;

create table DEPARTMENT(
id INTEGER AUTO_INCREMENT NOT NULL,
name VARCHAR(30) NOT NULL,
PRIMARY KEY(id)
);

create table ROLE(
id INTEGER AUTO_INCREMENT NOT NULL,
title VARCHAR(30) NOT NULL,
salary DECIMAL NOT NULL,
department_id INTEGER NOT NULL,
PRIMARY KEY(id),
FOREIGN KEY(department_id) REFERENCES DEPARTMENT(id) ON DELETE CASCADE
);

create table EMPLOYEE(
id INTEGER AUTO_INCREMENT,
first_name VARCHAR(30),
last_name VARCHAR(30),
role_id INTEGER,
manager_id INTEGER NULL,
PRIMARY KEY(id),
FOREIGN KEY(role_id) REFERENCES ROLE(id) ON DELETE CASCADE
);

INSERT into DEPARTMENT (name)
values ("Sales"), ("Engineering"), ("Finance"), ("Legal"), ("HR");

INSERT into ROLE (title, salary, department_id)
values("Sales Lead" , 100000, 1), ("Salesperson", 80000, 1), ("Lead Engineer", 150000, 2), 
("Software Engineer", 120000, 2), ("Accountant", 125000, 3), ("Legal Team Lead", 250000, 4),
("Lawyer", 190000, 4),("HR Manager", 10000, 5),("HR Staff", 70000, 5);

INSERT into EMPLOYEE (first_name, last_name, role_id, manager_id) 
values ("John", "Doe", 1, 3),("Mike", "Chan", 2, 1), ("Ashley", "Rodriguez", 3, NULL), 
("Kevin", "Tupik", 4, 3), ("Malia", "Brown", 5, NULL), ("Sarah", "Lourd", 6, NULL), 
("Tom", "Allen", 7, 6),("Jeff", "Fischer", 3, NULL), ("Neil", "Owens", 4, 8), 
("Katie", "James", 8, NULL), ("Carson", "Washington", 9, 10),("Tim", "Langford", 9, 10);

ALTER TABLE employee  
ADD FOREIGN KEY(manager_id) REFERENCES employee(id) ON DELETE SET NULL;

SELECT * from EMPLOYEE;
SELECT * from ROLE;
SELECT * from DEPARTMENT;