export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to GoFree</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to continue.
          </p>
        </div>
        {/* TODO: Better Auth sign-in form */}
        <p className="text-center text-sm text-muted-foreground">Auth form coming soon.</p>
      </div>
    </main>
  );
}
