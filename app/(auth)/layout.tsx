// app/(auth)/layout.tsx
import "../globals.css"; // if you need base styles

export const metadata = {
  title: "Login – Student Evaluation Tool",
  description: "Please log in to continue",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
    <nav>{children}</nav>     
    </div>
  );
}
