// utils/universityUtils.js
export const getUniversityFromEmail = (email) => {
    if (email.endsWith('@students.au.edu.pk')) return 'Air University';
    if (email.endsWith('@students.nust.edu.pk')) return 'NUST';
    if (email.endsWith('@students.lums.edu.pk')) return 'LUMS';
    // Add more universities here
    return null; // unknown
  };
  