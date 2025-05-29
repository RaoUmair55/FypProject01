// utils/universityUtils.js
export const getUniversityFromEmail = (email) => {
    if (email.endsWith('@students.au.edu.pk')) return 'Air University';
    if (email.endsWith('@students.nust.edu.pk')) return 'NUST';
    if (email.endsWith('@students.lums.edu.pk')) return 'LUMS';
    if (email.endsWith('@student.uet.edu.pk')) return 'University of Engineering and Technology';
    if (email.endsWith('@student.pu.edu.pk')) return 'University of the Punjab';
    if (email.endsWith('@student.iba.edu.pk')) return 'Institute of Business Administration';
    if (email.endsWith('@student.gcu.edu.pk')) return 'Government College University';
    if (email.endsWith('@student.uok.edu.pk')) return 'University of Karachi';
    if (email.endsWith('@student.qau.edu.pk')) return 'Quaid-i-Azam University';
    if (email.endsWith('@student.uetpeshawar.edu.pk')) return 'University of Engineering and Technology Peshawar';
    if (email.endsWith('@student.uos.edu.pk')) return 'University of Sargodha';
    if (email.startsWith('campusbuzz07') && email.endsWith('@gmail.com')) return 'Team CampusBuzz';
    // Add more universities here
    return null; // unknown
  };
  