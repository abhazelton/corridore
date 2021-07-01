# 🏃🏼‍♂️ Corridore
Corridore is a simple promise-based task runner with a chainable api 

![ts](https://badgen.net/badge/Built%20With/TypeScript/blue)

## Purpose

The purpose of this lib is to allow organization and simple abstraction for actions that can be varied by the tasks needed to complete each one. For example, perhaps you have to consume various (possibly third-party) services that all have their own methods of retrieval but want to transform uniformly each one and combine the results into a single set. You can easily create mini abstractions for each service as a task, and run them all at once.

## Overview

The general idea centers around some `action` function (originally designed for API calls, but could be anything) that should be run in a `task`, which may or may not have one or more `pre` or `post` functions that should be run before or after the `action` completes. A `corridore` instance handles the running of multiple `tasks` and can additionally have its own `pre` and `post` functions as well. Think of it as a simple way to handle piping data from one function to another, grouping those pipelines and combining them with others, possibly running them in parallel.

The assumption is made that whatever your tasks and step functions are doing, you have strict types for the incoming and outgoing data from the task, and that your runner can handle multiple tasks, but all having the same incoming and outgoing types.

## Concurrency

Where possible, you can specify using concurrency for *tasks* so that they may be run in parallel. *Pre* and *post* functions are always run synchronously, typically used for transform steps. However, you may also run tasks synchronously if you wish for very complex transform scenarios where you need more abstraction.  When doing this, each subsequent task (or the first pre function of that task) receives as input the *final* output from the previous task, including any post functions.

## Example Scenario

See [example](example/index.ts) for more detail.

Let's say you have to provide a result set which is pulled from 2 different third-party APIs, each of which return their data in different shapes and formats.

### Service A Example

```ts
// TASK STEP FUNCTIONS

const taskStepPre1 = (task: Task) => (data: IncomingTaskType): TypeForTaskAction => {
  //
};

const taskAction = (task: Task) => (data: TypeForTaskAction): TypeForStepPost1 => {
  //
};

const taskStepPost1 = (task: Task) => (data: TypeForStepPost1): OutgoingTaskType => {
  //
};

// CREATE TASK

const taskService1 = new Task<IncomingTaskType, OutgoingTaskType>('task1');

taskService1
  .pre([
    taskStepPre1,
    taskStepPre2,
    ...
  ])
  .action(taskAction)
  .post([
    taskStepPost1,
    ...
  ]);

```

Service B, Service C, etc. as above...

### Corridore as Runner of All Tasks

```ts
// CREATE CORRIDORE INSTANCE
const runner = new Corridore('runner');

runner
  .concurrent(true) // allow tasks to run concurrently, see notes on what this means if false
  .pre([
    runnerStepPre1,
    ...
  ])
  .tasks([
    taskService1,
    taskService2,
    ...
  ])
  .post([
    runnerStepPost1,
    ...
  ]);

// execute it someplace
const results = await runner.exec<RunnerResultType>(initialDataPassedToPreStep1);
```

## License

See [LICENSE.md](LICENSE)
