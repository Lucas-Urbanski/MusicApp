"use client"

import React from 'react'
import * as z from "zod"; 
import { useForm } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod' 
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

export default function page() {

    const [datasd, setData] = useState<Session | string>("");
    const [errorsd, setError] = useState<string | null>(null);

    const zodSignIn = z.object({
        email: z.email("Please input your Email"),
        password: z.string("Please input your Password")
    });

    type zodSignInType = z.infer<typeof zodSignIn>;

    const { register, handleSubmit, control, formState: {errors} } = useForm<zodSignInType>({ resolver: zodResolver(zodSignIn), })

    const onSubmit = async (zodData: zodSignInType) => {
        const supabase = createClient();

        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: zodData.email,
                password: zodData.password
            });
            if (error) throw error;

            setData(data.session);
            console.log(data);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occured");
        }



    }
    return (
        <div>
            page
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("email", {required:true})} />
                {errors.email?.message && <p>{errors.email.message}</p>}

                <input {...register("password", {required:true})} />
                {errors.password?.message && <p>{errors.password.message}</p>}

                <button type="submit" >SignIn</button>
            </form>
            {datasd ? <p>{datasd.toString()}</p> : <p>nothing here bro</p>}
        </div>
    )
}
