
export const toBnDigits = (num: string | number) => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
};

export const getBengaliMonthDetails = (date: Date) => {
  const bnMonths = [
    "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
    "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
  ];
  
  // Simple approximation for Bengali calendar
  // In reality, it's more complex, but this is a common approximation
  const month = date.getMonth();
  const day = date.getDate();
  
  let bnMonthIndex = (month + 8) % 12;
  let bnDay = day + 15;
  const bnYear = date.getFullYear() - 593;
  
  if (bnDay > 30) {
    bnDay -= 30;
    bnMonthIndex = (bnMonthIndex + 1) % 12;
  }
  
  return {
    day: bnDay,
    month: bnMonthIndex,
    monthName: bnMonths[bnMonthIndex],
    year: bnYear,
    daysInMonth: 30 // Simplified
  };
};
