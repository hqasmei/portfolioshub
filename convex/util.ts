import { GenericId, v, Validator } from "convex/values";

import { TableNames } from "./_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

export function vid<TableName extends TableNames>(
  tableName: TableName
): Validator<GenericId<TableName>> {
  return v.id(tableName);
}

export function filterNullishValues<T>(
  arr: (T | null | undefined)[]
): NonNullable<T>[] {
  return arr.filter(
    (value): value is NonNullable<T> => value !== null && value !== undefined
  );
}

export async function getUserId(ctx: QueryCtx | ActionCtx | MutationCtx) {
  return (await ctx.auth.getUserIdentity())?.subject;
}

export function formatName(firstName?: string, lastName?: string) {
  firstName = firstName ?? "";
  lastName = lastName ?? "";
  let combinedName = `${firstName} ${lastName}`.trim();
  if (combinedName === "") {
    combinedName = "Anonymous";
  }
  return combinedName;
}
