// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { signUpSchema } from "@/lib/schemas"; // Your Zod validation schema
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate incoming data using your Zod schema
    const validatedData = signUpSchema.parse(body);
    const { email, password, firstName, lastName /*, phone, companyName, metadata */ } = validatedData;

    const supabase = await createClient();

    // Step 1: Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      console.error("Error during supabase.auth.signUp:", error.message);
      let errorMessage = "Ошибка при первичной регистрации учетных данных.";
      let statusCode = 500;

      if (error.message && error.message.toLowerCase().includes("email address already registered")) {
        errorMessage = "Учетные данные с таким email уже существуют. Попробуйте войти или использовать другой email.";
        statusCode = 409;
      } else if (error.message) {
        errorMessage = error.message;
      }
      return NextResponse.json({ message: errorMessage }, { status: statusCode });
    }

    return NextResponse.json({
      message: "Пользователь успешно зарегистрирован!",
      customer_id: data.user?.id
    }, { status: 201 });

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
