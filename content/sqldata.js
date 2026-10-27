// Practice databases for the SQL exercises. Every run starts from a fresh copy, so nothing a learner types can break them.
import { DATASET, SCHEMA_DOC } from './sql.js';

const staff = `
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, title TEXT, salary INTEGER, manager_id INTEGER, hire_date TEXT, commission INTEGER);
CREATE TABLE contractors (id INTEGER PRIMARY KEY, name TEXT, hourly_rate INTEGER);
INSERT INTO departments VALUES (1,'Engineering','Austin'),(2,'Sales','Chicago'),(3,'Support','Austin'),(4,'Finance','New York'),(5,'Legal','New York');
INSERT INTO employees VALUES
 (1,'Maya Chen',1,'Engineer',120000,9,'2019-03-04',NULL),
 (2,'Omar Haddad',1,'Engineer',105000,9,'2020-07-13',NULL),
 (3,'Lena Fischer',1,'Engineer',98000,9,'2022-01-10',NULL),
 (4,'Raj Patel',2,'Account Exec',85000,10,'2018-05-21',12000),
 (5,'Tara Brooks',2,'Account Exec',91000,10,'2019-11-02',15000),
 (6,'Ivan Petrov',2,'Sales Rep',62000,10,'2023-02-27',4000),
 (7,'Nina Rossi',3,'Support Agent',58000,11,'2021-06-14',NULL),
 (8,'Sean Murphy',3,'Support Agent',56000,11,'2022-09-19',NULL),
 (9,'Grace Kim',1,'Engineering Manager',160000,NULL,'2016-01-18',NULL),
 (10,'Hector Diaz',2,'Sales Manager',130000,NULL,'2017-04-03',20000),
 (11,'Priya Nair',3,'Support Manager',95000,NULL,'2018-08-27',NULL),
 (12,'Zoe Adams',4,'Analyst',78000,13,'2021-10-04',NULL),
 (13,'Paul Evans',4,'Finance Manager',125000,NULL,'2015-12-07',NULL),
 (14,'Kofi Mensah',4,'Analyst',78000,13,'2023-05-15',NULL),
 (15,'Ana Costa',1,'Engineer',105000,9,'2023-08-21',NULL),
 (16,'Leo Grant',3,'Support Agent',54000,11,'2024-01-08',NULL);
INSERT INTO contractors VALUES (1,'Beth Lowe',85),(2,'Chris Yu',110),(3,'Dmitri Volk',95);
`;

const shop = `
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, signup_date TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price INTEGER);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO customers VALUES
 (1,'Ava Martin','Denver','2025-11-02'),(2,'Ben Ortiz','Austin','2025-11-15'),(3,'Chloe Wang','Seattle','2025-12-01'),
 (4,'Dev Singh','Austin','2025-12-20'),(5,'Ella Brown','Denver','2026-01-05'),(6,'Finn Walsh','Boston','2026-01-18'),
 (7,'Gia Romano','Seattle','2026-02-02'),(8,'Hugo Lang','Boston','2026-02-14'),(9,'Iris Cole','Denver','2026-03-01'),(10,'Jon Park','Austin','2026-03-10');
INSERT INTO products VALUES
 (1,'Desk Lamp','Home',30),(2,'Standing Desk','Office',400),(3,'Office Chair','Office',250),(4,'Notebook Set','Stationery',12),
 (5,'Monitor Arm','Office',80),(6,'Plant Pot','Home',20),(7,'Desk Mat','Office',25);
INSERT INTO orders VALUES
 (1,1,'2026-01-03','Shipped'),(2,2,'2026-01-09','Shipped'),(3,3,'2026-01-15','Shipped'),(4,1,'2026-01-28','Shipped'),
 (5,4,'2026-02-02','Cancelled'),(6,5,'2026-02-06','Shipped'),(7,2,'2026-02-11','Shipped'),(8,6,'2026-02-19','Shipped'),
 (9,1,'2026-02-25','Shipped'),(10,3,'2026-03-03','Shipped'),(11,7,'2026-03-08','Shipped'),(12,2,'2026-03-12','Pending'),
 (13,5,'2026-03-20','Shipped'),(14,8,'2026-03-27','Shipped'),(15,1,'2026-04-04','Shipped'),(16,6,'2026-04-10','Shipped'),
 (17,4,'2026-04-18','Cancelled'),(18,7,'2026-04-25','Shipped'),(19,3,'2026-05-02','Shipped'),(20,2,'2026-05-09','Shipped');
INSERT INTO order_items VALUES
 (1,2,1),(1,1,2),(2,3,1),(3,5,1),(4,7,2),(4,6,1),(5,2,1),(6,3,1),(6,1,1),(7,4,2),(7,5,1),(8,1,1),
 (9,2,1),(9,3,1),(10,6,3),(11,5,2),(11,7,2),(12,1,1),(13,3,1),(14,2,1),(14,4,1),(15,1,1),(15,5,1),(16,3,1),
 (17,6,2),(17,4,3),(18,2,1),(19,1,2),(19,5,1),(20,3,2);
`;

const stations = `
CREATE TABLE stations (id INTEGER PRIMARY KEY, city TEXT, state TEXT, lat_n REAL, long_w REAL);
CREATE TABLE triangles (id INTEGER PRIMARY KEY, a INTEGER, b INTEGER, c INTEGER);
INSERT INTO stations VALUES
 (1,'Albany','NY',42.65,73.75),(2,'Austin','TX',30.27,97.74),(3,'Atlanta','GA',33.75,84.39),(4,'Boise','ID',43.62,116.2),
 (5,'Buffalo','NY',42.89,78.88),(6,'Chicago','IL',41.88,87.63),(7,'Eugene','OR',44.05,123.0893),(8,'Erie','PA',42.13,80.09),
 (9,'Omaha','NE',41.26,95.93),(10,'Orlando','FL',28.54,81.38),(11,'Portland','OR',45.52,122.68),(12,'Portland','ME',43.66,70.2641),
 (13,'Provo','UT',40.23,111.66),(14,'Reno','NV',39.53,119.81),(15,'Salem','OR',44.94,123.04),(16,'Tampa','FL',27.95,82.46),
 (17,'Toledo','OH',41.65,83.54),(18,'Utica','NY',43.1,75.23),(19,'Waco','TX',31.55,97.15),(20,'Yuma','AZ',32.69,114.63);
INSERT INTO triangles VALUES (1,20,20,23),(2,20,20,20),(3,20,21,22),(4,13,14,30),(5,5,5,10),(6,6,9,6),(7,7,7,7),(8,3,4,5);
`;

const school = `
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE friends (id INTEGER, friend_id INTEGER);
CREATE TABLE packages (id INTEGER PRIMARY KEY, salary INTEGER);
INSERT INTO students VALUES (1,'Ali'),(2,'Bea'),(3,'Cal'),(4,'Dee'),(5,'Eli'),(6,'Fay');
INSERT INTO friends VALUES (1,2),(2,3),(3,1),(4,5),(5,6),(6,4);
INSERT INTO packages VALUES (1,70),(2,85),(3,60),(4,90),(5,80),(6,95);
`;

export const DATASETS = {
  sales: { sql: DATASET, doc: SCHEMA_DOC },
  staff: {
    sql: staff,
    doc: [
      { table: 'departments', cols: 'id, name, city', note: '5 departments. Legal has no employees' },
      { table: 'employees', cols: 'id, name, dept_id, title, salary, manager_id, hire_date, commission', note: '16 employees. manager_id points to another employee (blank for managers). commission is blank (NULL) for most people. hire_date looks like 2021-06-14' },
      { table: 'contractors', cols: 'id, name, hourly_rate', note: '3 contractors, not employees' },
    ],
  },
  shop: {
    sql: shop,
    doc: [
      { table: 'customers', cols: 'id, name, city, signup_date', note: '10 customers. Two have never ordered' },
      { table: 'products', cols: 'id, name, category, price', note: '7 products in three categories' },
      { table: 'orders', cols: 'id, customer_id, order_date, status', note: '20 orders. status is Shipped, Pending or Cancelled' },
      { table: 'order_items', cols: 'order_id, product_id, qty', note: 'One row per product on an order. Line value = qty x price' },
    ],
  },
  stations: {
    sql: stations,
    doc: [
      { table: 'stations', cols: 'id, city, state, lat_n, long_w', note: '20 weather stations. A city name can appear twice (Portland, OR and Portland, ME). lat_n and long_w are decimals' },
      { table: 'triangles', cols: 'id, a, b, c', note: '8 sets of three side lengths' },
    ],
  },
  school: {
    sql: school,
    doc: [
      { table: 'students', cols: 'id, name', note: '6 students' },
      { table: 'friends', cols: 'id, friend_id', note: 'Each student has one best friend. (1, 2) means student 1\'s best friend is student 2' },
      { table: 'packages', cols: 'id, salary', note: 'The job offer each student received, in thousands. id matches students.id' },
    ],
  },
};
