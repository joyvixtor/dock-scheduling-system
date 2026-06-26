/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation ScanInboundPallet($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n  scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    createdAt\n  }\n}\n\nmutation AssignOperator($taskId: ID!, $operatorId: ID!) {\n  assignOperator(taskId: $taskId, operatorId: $operatorId) {\n    id\n    status\n    operatorId\n  }\n}\n\nmutation CompleteTransfer($taskId: ID!) {\n  completeTransfer(taskId: $taskId) {\n    id\n    status\n  }\n}": typeof types.ScanInboundPalletDocument,
    "query ActiveTransferTasks {\n  activeTransferTasks {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    operatorId\n    createdAt\n  }\n}\n\nquery ActiveInboundDocks {\n  activeInboundDocks {\n    id\n    dockNumber\n    status\n  }\n}": typeof types.ActiveTransferTasksDocument,
    "\n  mutation ScanInboundPalletCheckIn($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n    scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n      id\n      sku\n      quantity\n      inboundDockId\n      outboundDockId\n      status\n    }\n  }\n": typeof types.ScanInboundPalletCheckInDocument,
};
const documents: Documents = {
    "mutation ScanInboundPallet($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n  scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    createdAt\n  }\n}\n\nmutation AssignOperator($taskId: ID!, $operatorId: ID!) {\n  assignOperator(taskId: $taskId, operatorId: $operatorId) {\n    id\n    status\n    operatorId\n  }\n}\n\nmutation CompleteTransfer($taskId: ID!) {\n  completeTransfer(taskId: $taskId) {\n    id\n    status\n  }\n}": types.ScanInboundPalletDocument,
    "query ActiveTransferTasks {\n  activeTransferTasks {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    operatorId\n    createdAt\n  }\n}\n\nquery ActiveInboundDocks {\n  activeInboundDocks {\n    id\n    dockNumber\n    status\n  }\n}": types.ActiveTransferTasksDocument,
    "\n  mutation ScanInboundPalletCheckIn($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n    scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n      id\n      sku\n      quantity\n      inboundDockId\n      outboundDockId\n      status\n    }\n  }\n": types.ScanInboundPalletCheckInDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ScanInboundPallet($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n  scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    createdAt\n  }\n}\n\nmutation AssignOperator($taskId: ID!, $operatorId: ID!) {\n  assignOperator(taskId: $taskId, operatorId: $operatorId) {\n    id\n    status\n    operatorId\n  }\n}\n\nmutation CompleteTransfer($taskId: ID!) {\n  completeTransfer(taskId: $taskId) {\n    id\n    status\n  }\n}"): (typeof documents)["mutation ScanInboundPallet($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n  scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    createdAt\n  }\n}\n\nmutation AssignOperator($taskId: ID!, $operatorId: ID!) {\n  assignOperator(taskId: $taskId, operatorId: $operatorId) {\n    id\n    status\n    operatorId\n  }\n}\n\nmutation CompleteTransfer($taskId: ID!) {\n  completeTransfer(taskId: $taskId) {\n    id\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ActiveTransferTasks {\n  activeTransferTasks {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    operatorId\n    createdAt\n  }\n}\n\nquery ActiveInboundDocks {\n  activeInboundDocks {\n    id\n    dockNumber\n    status\n  }\n}"): (typeof documents)["query ActiveTransferTasks {\n  activeTransferTasks {\n    id\n    sku\n    quantity\n    inboundDockId\n    outboundDockId\n    status\n    operatorId\n    createdAt\n  }\n}\n\nquery ActiveInboundDocks {\n  activeInboundDocks {\n    id\n    dockNumber\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ScanInboundPalletCheckIn($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n    scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n      id\n      sku\n      quantity\n      inboundDockId\n      outboundDockId\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation ScanInboundPalletCheckIn($sku: String!, $quantity: Int!, $inboundDockId: String!) {\n    scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {\n      id\n      sku\n      quantity\n      inboundDockId\n      outboundDockId\n      status\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;