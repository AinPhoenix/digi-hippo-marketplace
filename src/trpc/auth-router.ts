import { AuthCredentialValidator } from "../lib/validators/account-credential-validator";
import { publicProcedure, router } from "./trpc";
import { getPayloadClint } from "../get-payload";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialValidator)
    .mutation(async ({ input }) => {
      const { email, password } = input;
      const payload = await getPayloadClint();

      // CHECK IF USER ALREADY EXIST
      const { docs: users } = await payload.find({
        collection: "users",
        where: {
          email: { equals: email },
        },
      });

      if (users.length != 0) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      await payload.create({
        collection: "users",
        data: {
          email,
          password,
          role: "user",
        },
      });

      return { success: true, sentToEmail: email };
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const { token } = input;
      const payload = await getPayloadClint();

      const isVerfied = await payload.verifyEmail({
        collection: "users",
        token,
      });

      if (!isVerfied) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return { success: true };
    }),

  signIn: publicProcedure
    .input(AuthCredentialValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { res } = ctx;

      const payload = await getPayloadClint();

      try {
        await payload.login({
          collection: "users",
          data: {
            email,
            password,
          },
          res,
        });

        console.log("Running");

        return { success: true };
      } catch (err) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
    }),
});
