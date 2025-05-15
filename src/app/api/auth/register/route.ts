// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sdk } from '@/lib/sdk'; // Ensure this path is correct for your Medusa SDK instance
import { ZodError } from "zod";
import { signUpSchema } from "@/lib/schemas"; // Your Zod validation schema
import { FetchError } from "@medusajs/js-sdk"; // For typing errors from the SDK

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate incoming data using your Zod schema
    const validatedData = signUpSchema.parse(body);
    const { email, password, firstName, lastName /*, phone, companyName, metadata */ } = validatedData;

    let registrationToken: string | null = null;

    // Step 1: Register the auth identity and get a token
    try {
      const authResponse = await sdk.auth.register("customer", "emailpass", {
        email,
        password,
      });

      if (typeof authResponse === 'string') {
        registrationToken = authResponse;
      } else if (authResponse && typeof authResponse === 'object' && 'token' in authResponse) {
        registrationToken = (authResponse as { token: string }).token;
      } else if (authResponse === null || authResponse === undefined) {
         console.warn("sdk.auth.register did not return a token directly.");
         // Attempt to proceed, assuming SDK might manage state internally,
         // but if createCustomer fails, this could be a point of failure.
         // Forcing an error if no token and createCustomer requires it explicitly.
         // However, the Medusa example implies the SDK handles this.
         // Let's be optimistic for now, but if createCustomer fails with 401, this is why.
         // The provided Medusa example for sdk.store.customer.create explicitly uses the token
         // in the header, so we MUST have it.
         return NextResponse.json({ message: "Не удалось получить токен регистрации от Medusa (ответ не содержал токен)." }, { status: 500 });
      } else {
         console.error("Unexpected response from sdk.auth.register:", authResponse);
         return NextResponse.json({ message: "Неожиданный ответ от сервиса аутентификации Medusa при регистрации." }, { status: 500 });
      }

      if (!registrationToken) { // Double check
        return NextResponse.json({ message: "Токен регистрации не был получен или имеет неверный формат." }, { status: 500 });
      }

    } catch (error) {
      const fetchError = error as FetchError; // Type assertion
      console.error("Error during sdk.auth.register:", fetchError.status, fetchError.message);
      let errorMessage = "Ошибка при первичной регистрации учетных данных.";
      let statusCode = fetchError.status || 500;

      // Medusa often returns a specific message for duplicate identities
      if (fetchError.message && fetchError.message.toLowerCase().includes("identity with email already exists")) {
        errorMessage = "Учетные данные с таким email уже существуют. Попробуйте войти или использовать другой email.";
        statusCode = 409; // Conflict
      } else if (fetchError.message) {
        // Use the message from FetchError if available
        errorMessage = fetchError.message;
      }
      return NextResponse.json({ message: errorMessage }, { status: statusCode });
    }

    // Step 2: Create the customer profile using the obtained token
    try {
      const { customer } = await sdk.store.customer.create(
        { // Payload for creating the customer
          email,
          first_name: firstName,
          last_name: lastName,
          // phone,
          // company_name: companyName,
          // metadata,
        },
        {}, // Query parameters (optional)
        { // Headers
          Authorization: `Bearer ${registrationToken}`
        }
      );

      return NextResponse.json({
        message: "Пользователь успешно зарегистрирован!",
        customer_id: customer.id
      }, { status: 201 });

    } catch (error) {
      const fetchError = error as FetchError; // Type assertion
      console.error("Error during sdk.store.customer.create:", fetchError.status, fetchError.message);
      let errorMessage = "Ошибка при создании профиля пользователя.";
      let statusCode = fetchError.status || 500;

      if (fetchError.message) {
        if (fetchError.message.toLowerCase().includes("customer with email already exists") ||
            (fetchError.status === 422 && fetchError.message.toLowerCase().includes("duplicate key value violates unique constraint"))) {
             errorMessage = "Профиль пользователя с таким email уже существует.";
             statusCode = 409; // Conflict
        } else if (fetchError.status === 401) {
            errorMessage = "Ошибка авторизации при создании профиля. Возможно, токен недействителен.";
            statusCode = 401;
        }
         else {
            errorMessage = fetchError.message; // Use the message from FetchError
        }
      }
      return NextResponse.json({ message: errorMessage }, { status: statusCode });
    }

  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        message: "Ошибка валидации данных.",
        errors: error.flatten().fieldErrors
      }, { status: 400 });
    }

    console.error("Unhandled registration error in API route:", error);
    return NextResponse.json({
      message: "Произошла непредвиденная ошибка при регистрации."
    }, { status: 500 });
  }
}
