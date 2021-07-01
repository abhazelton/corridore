/**
 * Promise wrapper that returns an object when used
 * with `await` preventing the need for try/catch.
 * 
 * @example
 * const { err, data } = await promised(Promise);
 * 
 * @param promise the promise to be executed.
 */
 export const promised = <T = any, E = Error>(promise: Promise<T>): { err?: E, data?: T } => {
  return promise
    .then(data => ({ err: null, data }))
    .catch(err => ({ err })) as { err?: E, data?: T };
};
