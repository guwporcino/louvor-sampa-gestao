
import { Schedule, Member } from "../types";
import { format, addDays } from "date-fns";

// Function to replicate a schedule with a new date
export const replicateSchedule = (schedule: Schedule, newDate: Date): Omit<Schedule, 'id' | 'createdAt'> => {
  return {
    title: `${schedule.title} (Replica de ${format(schedule.date, 'dd/MM/yyyy')})`,
    description: schedule.description,
    date: newDate,
    members: [...schedule.members], // Copy members array
    songs: [...schedule.songs], // Copy songs array
    isPublished: false, // Set as draft by default
    departmentId: schedule.departmentId,
    classroomId: schedule.classroomId, // Maintain classroom for EBD
  };
};

// Function to generate random schedule with X members from a pool
export const generateRandomSchedule = (
  title: string,
  date: Date,
  description: string,
  allMembers: Member[],
  departmentId: string,
  memberCount: number,
  classroomId?: string
): Omit<Schedule, 'id' | 'createdAt'> => {
  // Filter only active members
  const activeMembers = allMembers.filter(member => member.active);
  
  // Shuffle members array
  const shuffledMembers = [...activeMembers].sort(() => Math.random() - 0.5);
  
  // Take the first X members or all if not enough
  const selectedMembers = shuffledMembers.slice(0, Math.min(memberCount, shuffledMembers.length));
  
  return {
    title,
    description,
    date,
    members: selectedMembers.map(member => member.id),
    songs: [], // Empty for sound and EBD
    isPublished: false, // Set as draft by default
    departmentId,
    classroomId, // Only for EBD
  };
};
