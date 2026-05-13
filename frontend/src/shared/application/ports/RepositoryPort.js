/**
 * SHARED APPLICATION — Repository port contract
 *
 * All repository ports extend this shape.
 * Port assertions verify adapters implement these methods.
 */

/** Standard CRUD port methods */
export const CRUD_PORT_METHODS = ["getAll", "getById", "create", "update", "delete"];

/** Read-only port methods */
export const READ_PORT_METHODS = ["getAll", "getById"];
