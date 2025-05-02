import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: ["/profile", "/cart", "/checkout", "/account", "/account/orders", "/wishlist", "/account/settings"],
};