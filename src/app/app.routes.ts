import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { EmployeeComponent } from './Component/employee/employee.component';


export const routes: Routes = [
    {
        path: "", component: EmployeeComponent
    },
    {
        path: "employee", component: EmployeeComponent
    }

];
