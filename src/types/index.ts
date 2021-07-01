import { Task } from '../task';

export type AsyncFunction<T extends Record<string, unknown> = any> = (...args: any[]) => Promise<T>;
export type AsyncOrFunction = AsyncFunction | ((...args: any[]) => any);
export type AsyncFunctionWithContext = (task: Task) => AsyncFunction;
export type AsyncOrFunctionWithContext = (task: Task) => AsyncOrFunction;
