import { httpRouter } from "convex/server";

import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { formatName } from "./util";

const http = httpRouter();

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      switch (result.type) {
        case "user.created":
          await ctx.runMutation(internal.users.createUser, {
            userId: result.data.id,
            email: result.data.email_addresses[0]?.email_address as string,
            name: formatName(result.data.first_name as string, result.data.last_name as string),
            profileImage: result.data.image_url,
          });
          break;
        case "user.updated":
          await ctx.runMutation(internal.users.updateUser, {
            userId: result.data.id,
            profileImage: result.data.image_url,
          });
          break;
        case "user.deleted":
          await ctx.runMutation(internal.users.deleteUser, {
            userId: result.data.id!,
          });
          break;
      }

      return new Response(null, {
        status: 200,
      });
    } catch (err) {
      console.error(err);
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId") as Id<"_storage"> | null;

    if (!storageId) {
      return new Response("Missing storageId", {
        status: 400,
      });
    }

    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", {
        status: 404,
      });
    }
    return new Response(blob, {
      headers: new Headers({
        "Access-Control-Allow-Origin": "*",
        Vary: "origin",
      }),
    });
  }),
});

export default http;
