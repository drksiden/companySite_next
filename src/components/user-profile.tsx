import { useSession } from "next-auth/react";
import Medusa from "@medusajs/medusa-js";
import { useEffect, useState } from "react";

const medusa = new Medusa({ baseUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000", maxRetries: 3 });

export function UserProfile() {
  const { data: session } = useSession();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (session?.user.id) {
      medusa.customers.retrieve(session.user.id).then(({ customer }) => {
        setCustomer(customer);
      });
    }
  }, [session]);

  if (!session) return <div>Please sign in</div>;
  if (!customer) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Email: {customer.email}</p>
      <p>Name: {customer.first_name} {customer.last_name}</p>
    </div>
  );
}