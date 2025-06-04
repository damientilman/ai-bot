"use client";
import { RedirectToSignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";
import PageContent from "./PageContent"; // Assure-toi que ce fichier est bien en /app/

export default function Home() {
  return (
    <>
      <SignedIn>
        <PageContent />
      </SignedIn>

<SignedOut>
  <RedirectToSignIn />
</SignedOut>
    </>
  );
}