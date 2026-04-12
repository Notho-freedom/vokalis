export type ParticipantStatus = "PENDING" | "CALLING" | "CONFIRMED" | "DECLINED" | "NO_ANSWER" | "CALLBACK";

export interface Participant {
  id: string;
  name: string;
  phone: string;
  status: ParticipantStatus;
  calledAt?: string;
  respondedAt?: string;
}

export interface Campaign {
  id: string;
  name: string;
  meetingDate: string;
  meetingTime: string;
  description?: string;
  participants: Participant[];
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  createdAt: string;
}
