"use client";

import { trpc } from "@/trpc/client";
import { Loader2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

type Props = {
  token: string;
};

const VerifyEmail = ({ token }: Props) => {
  const { data, isLoading, isError } = trpc.auth.verifyEmail.useQuery({
    token,
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center">
        <XCircle className="h-8 w-8 text-red-600" />
        <h3 className="text-xl font-semibold">There was a problem</h3>
        <p className="text-sm text-muted-foreground">
          This token is not valid or might be expired. Please try again
        </p>
      </div>
    );
  }

  if (data?.success) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative mb-4 h-60 w-60 text-muted-foreground">
          <Image alt="email was sent" src="/hippo-email-sent.png" fill />
        </div>

        <div className="text-2xl font-semibold">You&apos;re all set!</div>
        <p className="mt-1 text-center text-muted-foreground">
          Thank you for verifying your Email.
        </p>
        <Link href="/sign-in" className={buttonVariants({ className: "mt-4" })}>
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        <h3 className="text-xl font-semibold">Verifying...</h3>
        <p className="text-sm text-muted-foreground">
          This won&apos;t take long
        </p>
      </div>
    );
  }

  return <div>VerifyEmail</div>;
};

export default VerifyEmail;
