import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: "29000744563-a9f4kfndigr75u08m8md58q5cnjd4b1g.apps.googleusercontent.com",
      clientSecret: "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",
    })
  ],
  secret: "8360714f5778b2335d6d08da808aeef3"
};

export default NextAuth(authOptions);