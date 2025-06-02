// utils/universityUtils.js
export const getUniversityFromEmail = (email) => {
    if (email.endsWith('@students.au.edu.pk')) return 'Air University';
    if (email.endsWith('@nust.edu.pk')) return 'NUST';
    if (email.endsWith('@lums.edu.pk')) return 'LUMS';
    if (email.endsWith('@student.uet.edu.pk')) return 'UET';
    if (email.endsWith('@pu.edu.pk')) return 'PU';
    if (email.endsWith('@iba.edu.pk')) return 'IBA';
    if (email.endsWith('@gcu.edu.pk')) return 'GCU';
    if (email.endsWith('@uok.edu.pk')) return 'UOK';
    if (email.endsWith('@qau.edu.pk')) return 'QAU';
    if (email.endsWith('@numls.edu.pk')) return 'NUML';
    if (email.endsWith('@student.uetpeshawar.edu.pk')) return 'UET Peshawar';
    if (email.endsWith('@student.uos.edu.pk')) return 'UOS';
    if (email.endsWith('@giki.edu.pk')) return 'GIKI';
    if(email.endsWith('@gmail.com')) return 'Guest'; 
    if (email.startsWith('campusbuzz07') && email.endsWith('@gmail.com')) return 'Team CampusBuzz';
    // Add more universities here
    return null; // unknown
  };
  