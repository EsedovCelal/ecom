import { SignIn } from "@clerk/nextjs";

export default function Page(): React.ReactElement {
  return (
    <div className="flex items-center justify-center mt-16">
      <SignIn />
    </div>
  );
}
