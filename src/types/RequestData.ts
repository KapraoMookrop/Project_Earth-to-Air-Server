export interface RequestData<T> {
    searchCriteria: T;
    page: number;
    pageSize: number;
}