export type Course = {
  id: string;
  title: string;
  categoryId: string;
  instructor: string;
  time: {
    start: string;
    end: string;
    days: string;
  };
  creatorUserId: string;
  enrolledUserIds: string[];
};
