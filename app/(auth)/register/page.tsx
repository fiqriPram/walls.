"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

const registerSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const { register, handleSubmit } = useForm<RegisterForm>({
		resolver: zodResolver(registerSchema),
	})

	const onSubmit = async (data: RegisterForm) => {
		setLoading(true)
		try {
			await authClient.signUp.email({
				name: data.name,
				email: data.email,
				password: data.password,
			})
			toast.success("Account created")
			router.push("/dashboard")
		} catch {
			toast.error("Registration failed")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Register</h1>
					<p className="mt-1 text-sm text-muted-foreground">Create an admin account</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium">
							Name
						</label>
						<Input id="name" placeholder="Admin" {...register("name")} />
					</div>
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<Input id="email" type="email" placeholder="admin@example.com" {...register("email")} />
					</div>
					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<Input id="password" type="password" placeholder="••••••" {...register("password")} />
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Creating account..." : "Create account"}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/login" className="font-medium text-foreground underline underline-offset-4">
						Login
					</Link>
				</p>
			</div>
		</div>
	)
}
