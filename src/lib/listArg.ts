export type ListArgs = {
  skip?: number;
  take?: number;
  search?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}