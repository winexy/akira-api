export interface WorkerSpec<T = void> {
  Worker(): Promise<void>
  RunTask(): Promise<T>
}
