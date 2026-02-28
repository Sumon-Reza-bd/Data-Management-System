
import React from 'react';
import { ICONS } from './constants';

export const formatDate = (dateStr: string) => {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateStr;
};

export const formatTo12Hr = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const getCategoryIcon = (category: string, color?: string) => {
  const cat = category.toLowerCase();
  const props = { 
    className: "w-4 h-4", 
    style: color ? { color } : {} 
  };

  if (cat.includes('food')) return React.createElement(ICONS.Food, props);
  if (cat.includes('rent') || cat.includes('home')) return React.createElement(ICONS.Home, props);
  if (cat.includes('bill')) return React.createElement(ICONS.Bills, props);
  if (cat.includes('dps') || cat.includes('savings')) return React.createElement(ICONS.Savings, props);
  if (cat.includes('transport')) return React.createElement(ICONS.Transport, props);
  if (cat.includes('shopping')) return React.createElement(ICONS.Shopping, props);
  if (cat.includes('medical') || cat.includes('health')) return React.createElement(ICONS.Medical, props);
  if (cat.includes('salary')) return React.createElement(ICONS.Financial, { ...props, style: { color: color || '#10b981' } });
  return React.createElement(ICONS.Other, props);
};

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const toBnDigits = (num: number | string) => num.toString().split('').map(d => isNaN(parseInt(d)) ? d : bnDigits[parseInt(d)]).join('');

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

export const getBengaliMonthDetails = (date: Date) => {
  const bnMonths = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
  
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  
  const gYear = current.getFullYear();
  let startOfBnYear = new Date(gYear, 3, 14); // April 14
  startOfBnYear.setHours(0, 0, 0, 0);

  let diffInDays = Math.floor((current.getTime() - startOfBnYear.getTime()) / (1000 * 60 * 60 * 24));
  let bnYear = gYear - 593;

  if (diffInDays < 0) {
    bnYear = gYear - 594;
    const prevYearStart = new Date(gYear - 1, 3, 14);
    prevYearStart.setHours(0, 0, 0, 0);
    diffInDays = Math.floor((current.getTime() - prevYearStart.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Bangla Academy 2019 Revised Rules for Bangladesh
  // 1-6 months: 31 days, 7-12 months: 30 days, Falgun (11th month) is 29 days (30 in Leap Years)
  // Note: we check the leap year of the Gregorian year where Falgun occurs
  const currentGYear = current.getFullYear();
  const bnMonthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeapYear(currentGYear) ? 30 : 29, 30];
  
  let bnMonthIdx = 0;
  let remainingDays = diffInDays;

  for (let i = 0; i < 12; i++) {
    if (remainingDays < bnMonthDays[i]) {
      bnMonthIdx = i;
      break;
    }
    remainingDays -= bnMonthDays[i];
  }

  const bnDayNum = remainingDays + 1;
  return {
    day: bnDayNum,
    month: bnMonthIdx,
    monthName: bnMonths[bnMonthIdx],
    year: bnYear,
    daysInMonth: bnMonthDays[bnMonthIdx]
  };
};

export const getFullBengaliCombinedDate = (date: Date) => {
  const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const details = getBengaliMonthDetails(date);
  
  const current = new Date(date);
  const enDatePart = current.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const bnDayName = bnDays[current.getDay()];
  const bnDayStr = toBnDigits(details.day.toString().padStart(2, '0'));
  const bnYearStr = toBnDigits(details.year);

  return `${enDatePart} / ${bnDayName}, ${bnDayStr} ${details.monthName} ${bnYearStr}`;
};

export const getBengaliDate = (date: Date) => getFullBengaliCombinedDate(date);

export const getEnglishDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
