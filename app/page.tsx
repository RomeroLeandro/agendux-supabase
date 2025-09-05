// import { EnvVarWarning } from "@/components/env-var-warning";
// import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
// import { hasEnvVars } from "@/lib/utils";
import { Typography } from "@/components/ui/Typography";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          {/* {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />} */}
        </nav>

        <ThemeSwitcher />
      </div>
      <Typography variant="heading-xl">Welcome to Agenda</Typography>
    </main>
  );
}
