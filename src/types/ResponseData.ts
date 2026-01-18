export interface ResponseData<T> {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    data: T[];
}