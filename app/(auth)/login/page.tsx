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

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const { register, handleSubmit } = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
	})

	const onSubmit = async (data: LoginForm) => {
		setLoading(true)
		try {
			await authClient.signIn.email({
				email: data.email,
				password: data.password,
			})
			toast.success("Logged in")
			router.push("/")
		} catch {
			toast.error("Invalid credentials")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Login</h1>
					<p className="mt-1 text-sm text-muted-foreground">Sign in to access your library</p>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
						{loading ? "Signing in..." : "Sign in"}
					</Button>
				</form>

				<p className="text-center text-sm text-muted-foreground">
					No account?{" "}
					<Link
						href="/register"
						className="font-medium text-foreground underline underline-offset-4"
					>
						Register
					</Link>
				</p>
			</div>
		</div>
	)
}
