export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  applicantsCount: number;
  status: "Active" | "Closed" | "Draft";
  createdAt?: string;
}

export interface CreateJobDto {
  title: string;
  department: string;
  location: string;
  description: string;
}
