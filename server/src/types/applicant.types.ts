export interface Applicant {
  id: string;
  name: string;
  role: string;
  location: string;
  experience: string;
  email: string;
  technicalProfile: string;
  resuméText?: string;

  // New Specification Fields
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  skills?: {
    name: string;
    level: string;
    yearsOfExperience: number;
  }[];
  languages?: {
    name: string;
    proficiency: string;
  }[];
  workExperience?: any[];
  education?: any[];
  certifications?: any[];
  projects?: any[];
  availability?: any;
  socialLinks?: any;
}

export interface CreateApplicantDto {
  name: string;
  role: string;
  email: string;
  technicalProfile: string;
  // Optional spec fields
  firstName?: string;
  lastName?: string;
  headline?: string;
}
