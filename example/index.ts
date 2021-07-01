import { Corridore } from '../src/corridore';
import { Task } from '../src/task';

type CorridoreInput = { };
type CorridoreOutput = { };
type TaskInput = { };
type TaskOutput = { };

const runnerStepPre1 = (task: Task) => (data: CorridoreInput): any => {
  console.log('runnerStepPre1');
};

const runnerStepPost1 = (task: Task) => (data: any): CorridoreOutput => {
  console.log('runnerStepPost1');
  return { };
};

const task1StepPre1 = (task: Task) => (data: TaskInput): any => {
  console.log('task1StepPre1');
};

const task1StepPre2 = (task: Task) => (data: any): any => {
  console.log('task1StepPre2');
};

const task1Action = (task: Task) => async (data: any): Promise<any> => {
  console.log('task1Action start');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('task1Action end');
      resolve({ });
    }, 1000);
  });
};

const task1StepPost1 = (task: Task) => (data: any): TaskOutput => {
  console.log('task1StepPost1');
  return { };
};

const task2StepPre1 = (task: Task) => (data: TaskInput): any => {
  console.log('task2StepPre1');
};

const task2Action = (task: Task) => async (data: any): Promise<any> => {
  console.log('task2Action start');
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('task2Action end');
      resolve({ });
    }, 1000);
  });
};

const task2StepPost1 = (task: Task) => (data: any): any => {
  console.log('task2StepPost1');
};

const task2StepPost2 = (task: Task) => (data: any): TaskOutput => {
  console.log('task2StepPost2');
  return { };
};

// CREATE TASKS

const taskService1 = new Task<TaskInput, TaskOutput>('task1');

taskService1
  .pre([
    task1StepPre1,
    task1StepPre2,
  ])
  .action(task1Action)
  .post([
    task1StepPost1,
  ]);

const taskService2 = new Task<TaskInput, TaskOutput>('task2');

taskService2
  .pre([
    task2StepPre1,
  ])
  .action(task2Action)
  .post([
    task2StepPost1,
    task2StepPost2,
  ]);
  
// CREATE CORRIDORE INSTANCE
const runner1 = new Corridore('runner1');

runner1
  .concurrent(true) // allow tasks to run concurrently
  .pre([
    runnerStepPre1,
  ])
  .tasks([
    taskService1,
    taskService2,
  ])
  .post([
    runnerStepPost1,
  ]);

const runner2 = new Corridore('runner2');

// NOTE: since we default to concurrent: false, all of taskService1 will complete and the
// result will be passed to taskService2 as input, and so on for each task provided
runner2
  .pre([
    runnerStepPre1,
  ])
  .tasks([
    taskService1,
    taskService2,
  ])
  .post([
    runnerStepPost1,
  ]);

// EXECUTE

(async () => {

  try {
    // async test
    const dataAsync = await runner1.exec<CorridoreOutput>({ });

    console.log('async test completed');
    console.log('async test results:', dataAsync);
  }
  catch (err) {
    console.log('err async', err);
  }

  try {
    // sync test
    const dataSync = await runner2.exec<CorridoreOutput>({ });

    console.log('sync test completed');
    console.log('sync test results:', dataSync);
  }
  catch (err) {
    console.log('err sync', err);
  }

})();
