import { mutation } from './_generated/server';
import { throwWithoutAdmin } from './util';

export const generateUploadUrl = mutation(async (ctx) => {
  await throwWithoutAdmin(ctx);

  return await ctx.storage.generateUploadUrl();
});
