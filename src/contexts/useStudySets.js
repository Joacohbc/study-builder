import { useContext } from 'react';
import { StudySetContext } from '@/contexts/StudySetContext'; // Assuming StudySetContext is default export or named export from its file

export const useStudySets = () => useContext(StudySetContext);
