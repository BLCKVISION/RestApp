import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-datepicker.component.html',
  styleUrl: './custom-datepicker.component.scss'
})
export class CustomDatepickerComponent implements OnInit {
  @Input() value: string = ''; // Format YYYY-MM-DD
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  currentDate = new Date(); // Controls the month being viewed
  calendarDays: { date: Date, isCurrentMonth: boolean, isToday: boolean, isSelected: boolean }[] = [];
  
  weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  ngOnInit() {
    if (this.value) {
      const parts = this.value.split('-');
      this.currentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    this.generateCalendar();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    // We'll manage clicks using stopPropagation on the component
    this.isOpen = false;
  }

  toggle(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      if (this.value) {
        const parts = this.value.split('-');
        this.currentDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        this.currentDate = new Date();
      }
      this.generateCalendar();
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  get displayValue(): string {
    if (!this.value) return 'Seleccionar fecha...';
    const parts = this.value.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  get currentMonthName(): string {
    return this.monthNames[this.currentDate.getMonth()];
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  prevMonth(event: Event) {
    event.stopPropagation();
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(event: Event) {
    event.stopPropagation();
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  setToday(event: Event) {
    event.stopPropagation();
    const today = new Date();
    this.selectDate(today);
  }

  clear(event: Event) {
    event.stopPropagation();
    this.value = '';
    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  selectDate(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this.value = `${y}-${m}-${day}`;
    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Day of week (0-6, where 0 is Sunday). We want Monday=0, Sunday=6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let selectedDateObj: Date | null = null;
    if (this.value) {
      const parts = this.value.split('-');
      selectedDateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      selectedDateObj.setHours(0, 0, 0, 0);
    }

    // Previous month's days
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      this.calendarDays.push({
        date: d,
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isSelected: selectedDateObj ? d.getTime() === selectedDateObj.getTime() : false
      });
    }
    
    // Current month's days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      this.calendarDays.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.getTime() === today.getTime(),
        isSelected: selectedDateObj ? d.getTime() === selectedDateObj.getTime() : false
      });
    }
    
    // Next month's days (to fill out 42 cells)
    const daysToAdd = 42 - this.calendarDays.length;
    for (let i = 1; i <= daysToAdd; i++) {
      const d = new Date(year, month + 1, i);
      this.calendarDays.push({
        date: d,
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isSelected: selectedDateObj ? d.getTime() === selectedDateObj.getTime() : false
      });
    }
  }
}
