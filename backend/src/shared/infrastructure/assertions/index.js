/*
Use this assertion directly they throw Error
but its is better to wrap it in try and catch block
and throw a more specific error type 
like httpValidationError if the assertion is in controller
OrderNotFound if inside a order domain and so on
or instead of try and catch use wrappers
*/



export { assertNonEmptyString } from "./assertNonEmptyString";
export { assertObject } from "./assertObject";
export { assertArray } from "./assertArray";
export { assertFunction } from "./assertFunction";
export { assertNumber } from "./assertNumber";
export { assertNonEmptyArray } from "./assertNonEmptyArray"
export { assertPositifNumber } from "./assertPositifNumber"
export { assertRequiredFields } from "./assertRequiredFields"

