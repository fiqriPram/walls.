"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
})

const registerSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

function LoginFormView() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const { register, handleSubmit } = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
	})

	const onSubmit = async (data: LoginForm) => {
		setLoading(true)
		try {
			const { error } = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			})
			if (error) {
				toast.error(error.message ?? "Invalid credentials")
				return
			}
			toast.success("Logged in")
			router.push("/")
			router.refresh()
		} catch {
			toast.error("Invalid credentials")
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="login-email" className="text-sm font-medium">
					Email
				</label>
				<Input id="login-email" type="email" placeholder="you@example.com" {...register("email")} />
			</div>
			<div className="space-y-2">
				<label htmlFor="login-password" className="text-sm font-medium">
					Password
				</label>
				<Input id="login-password" type="password" placeholder="••••••" {...register("password")} />
			</div>
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Signing in..." : "Sign in"}
			</Button>
		</form>
	)
}

function RegisterFormView() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const { register, handleSubmit } = useForm<RegisterForm>({
		resolver: zodResolver(registerSchema),
	})

	const onSubmit = async (data: RegisterForm) => {
		setLoading(true)
		try {
			const { error } = await authClient.signUp.email({
				name: data.name,
				email: data.email,
				password: data.password,
			})
			if (error) {
				toast.error(error.message ?? "Registration failed")
				return
			}
			toast.success("Account created")
			router.push("/")
			router.refresh()
		} catch {
			toast.error("Registration failed")
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="register-name" className="text-sm font-medium">
					Name
				</label>
				<Input id="register-name" placeholder="Your name" {...register("name")} />
			</div>
			<div className="space-y-2">
				<label htmlFor="register-email" className="text-sm font-medium">
					Email
				</label>
				<Input
					id="register-email"
					type="email"
					placeholder="you@example.com"
					{...register("email")}
				/>
			</div>
			<div className="space-y-2">
				<label htmlFor="register-password" className="text-sm font-medium">
					Password
				</label>
				<Input
					id="register-password"
					type="password"
					placeholder="••••••"
					{...register("password")}
				/>
			</div>
			<Button type="submit" className="w-full" disabled={loading}>
				{loading ? "Creating account..." : "Create account"}
			</Button>
		</form>
	)
}

function AuthTabs() {
	const searchParams = useSearchParams()
	const initialTab = searchParams.get("tab") === "register" ? "register" : "login"

	return (
		<div className="w-full max-w-sm space-y-6">
			<div className="text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
				<p className="mt-1 text-sm text-muted-foreground">Sign in or create your account</p>
			</div>

			<Tabs defaultValue={initialTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="register">Register</TabsTrigger>
				</TabsList>
				<TabsContent value="login" className="mt-4">
					<LoginFormView />
				</TabsContent>
				<TabsContent value="register" className="mt-4">
					<RegisterFormView />
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default function AuthPage() {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<Suspense>
				<AuthTabs />
			</Suspense>
		</div>
	)
}
