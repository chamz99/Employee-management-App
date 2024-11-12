import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Employee } from '../../Models/employee';
import { EmployeeService } from '../../Services/employee.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  employeeList: Employee[] = [];
  filteredEmployeeList: Employee[] = [];
  employees: Employee[] = [];
  empService = inject(EmployeeService);
  employeeForm: FormGroup = new FormGroup({});

  currentPage: number = 1;
  pageSize: number = 5;
  pageNumbers: number[] = [];
  searchQuery: string = '';

  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.getEmployees();
    this.setFormState();

    this.applySearchAndPagination();
  }

  openModal() {
    const empModal = document.getElementById('myModal');
    if (empModal != null) {
      empModal.style.display = 'block';
    }
  }

  closeModal() {
    this.setFormState();
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  setFormState() {
    this.employeeForm = this.fb.group({
      id: [0],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      position: ['', [Validators.required, Validators.maxLength(50)]],
      salary: ['', [Validators.required]],
    });
  }

  getEmployees() {
    console.log('hello Before');
    this.empService.getAllEmployees().subscribe((res) => {
      this.employeeList = res;
      this.filteredEmployeeList = res;
      console.log('hello');
      console.log(this.employeeList);
      // this.filteredEmployeeList = res;
    });
  }

  formValues: any;
  onSubmit() {
    console.log(this.employeeForm.value);
    if (this.employeeForm.invalid) {
      alert('Please Fill All Fields');
      return;
    }
    if (this.employeeForm.value.id == 0) {
      this.formValues = this.employeeForm.value;
      this.empService.addEmployee(this.formValues).subscribe((res) => {
        alert('Employee Added Successfully');
        this.getEmployees();
        this.employeeForm.reset();
        this.closeModal();
      });
    } else {
      this.formValues = this.employeeForm.value;
      this.empService.updateEmployee(this.formValues).subscribe((res) => {
        alert('Employee Updated Successfully');
        this.getEmployees();
        this.employeeForm.reset();
        this.closeModal();
      });
    }
  }

  onDelete(employee: Employee) {
    const isConfirm = confirm(
      'Are you sure you want to delete this Employee ' + employee.firstName
    );
    if (isConfirm) {
      this.empService.deleteEmployee(employee.id).subscribe((res) => {
        alert('Employee Deleted Successfully');
        this.getEmployees();
      });
    }
  }

  OnEdit(Employee: Employee) {
    this.openModal();
    this.employeeForm.patchValue(Employee);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchQuery = query.toLowerCase();
    this.currentPage = 1;
    this.applySearchAndPagination();
  }
  goToPage(page: number) {
    this.currentPage = page;
    this.applySearchAndPagination();
  }
  applySearchAndPagination() {
    this.updatePageNumbers();
    if (this.searchQuery == '') {
      this.employees = this.employeeList;
    } else {
      this.employees = this.employeeList.filter((employee) =>
        Object.values(employee).some((value) =>
          value.toString().toLowerCase().includes(this.searchQuery)
        )
      );
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredEmployeeList = this.employees.slice(startIndex, endIndex);

    console.log('aaaaa');
    console.log(this.filteredEmployeeList);
  }

  get totalPages(): number {
    return Math.ceil(
      this.employeeList.filter((employee) =>
        Object.values(employee).some((value) =>
          value.toString().toLowerCase().includes(this.searchQuery)
        )
      ).length / this.pageSize
    );
  }
  // get totalPages(): number {
  //   return Math.ceil(this.filteredEmployeeList.length / this.pageSize);
  // }

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    console.log(this.pageNumbers);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applySearchAndPagination();
    }
  }

  // Go to next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applySearchAndPagination();
    }
  }
}
